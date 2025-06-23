"""Policy evaluation service - core engine for evaluating travel against policies"""

from typing import List, Dict, Any, Optional
from uuid import UUID
from datetime import datetime, timedelta
import logging

from app.models.policy import Policy
from app.models.user_policy_assignment import UserPolicyAssignment
from app.services.rule_engine import PolicyContext, RuleRegistry
from app.utils.exceptions import PolicyEvaluationError
from app.utils.currency import CurrencyConverter

logger = logging.getLogger(__name__)

class PolicyEvaluationService:
    """Service for evaluating travel data against policies"""
    
    def __init__(self):
        self.rule_registry = RuleRegistry()
        self.currency_converter = CurrencyConverter()
    
    def evaluate_policies(self, travel_data: Dict[str, Any], org_id: str, user_id: str) -> Dict[str, Any]:
        """
        Evaluate travel data against user's policies
        
        Returns:
            {
                'result': 'HIDDEN|BOOKING_BLOCKED|APPROVAL_REQUIRED|OUT_OF_POLICY|IN_POLICY|NOT_SPECIFIED',
                'policies_evaluated': int,
                'details': [...],
                'messages': [...],
                'approvers': [...]
            }
        """
        try:
            logger.info(f"Evaluating policies for user {user_id} in org {org_id}")
            
            # Create evaluation context
            context = PolicyContext(travel_data, org_id, user_id, self.currency_converter)
            
            # Get applicable policies for the user
            policies = self._get_user_policies(user_id, org_id)
            
            if not policies:
                logger.info(f"No policies found for user {user_id}")
                return {
                    'result': 'NOT_SPECIFIED',
                    'policies_evaluated': 0,
                    'details': [],
                    'messages': [],
                    'approvers': []
                }
            
            # Evaluate each policy
            policy_results = []
            for policy in policies:
                result = self._evaluate_policy(context, policy)
                policy_results.append(result)
            
            # Combine results (most restrictive wins)
            final_result = self._combine_policy_results(policy_results)
            
            # Collect messages and approvers
            messages = self._collect_messages(policy_results, travel_data)
            approvers = self._collect_approvers(policy_results)
            
            logger.info(f"Policy evaluation complete. Result: {final_result}")
            
            return {
                'result': final_result,
                'policies_evaluated': len(policies),
                'details': policy_results,
                'messages': messages,
                'approvers': approvers
            }
            
        except Exception as e:
            logger.error(f"Policy evaluation failed: {e}")
            raise PolicyEvaluationError(f"Policy evaluation failed: {str(e)}")
    
    def get_policy_info(self, org_id: str, user_id: str) -> Dict[str, Any]:
        """Get policy information for travel searches (without evaluation)"""
        try:
            policies = self._get_user_policies(user_id, org_id)
            
            policy_info = []
            for policy in policies:
                info = {
                    'id': str(policy.id),
                    'label': policy.label,
                    'type': policy.type,
                    'enforce_approval': policy.enforce_approval,
                    'rules_count': len(policy.rules)
                }
                policy_info.append(info)
            
            return {
                'policies': policy_info,
                'total_policies': len(policies),
                'org_id': org_id,
                'user_id': user_id
            }
            
        except Exception as e:
            logger.error(f"Failed to get policy info: {e}")
            raise PolicyEvaluationError(f"Failed to get policy info: {str(e)}")
    
    def _get_user_policies(self, user_id: str, org_id: str) -> List[Policy]:
        """Get all active policies assigned to a user in an organization"""
        try:
            # For now, just get all policies for the organization
            # since user assignments may not be set up yet
            org_uuid = UUID(org_id)
            
            # Get all active policies for the organization
            policies = Policy.query.filter(
                Policy.org_id == org_uuid,
                Policy.active == True
            ).all()
            
            return policies
            
        except ValueError as e:
            raise PolicyEvaluationError(f"Invalid UUID: {e}")
    
    def _evaluate_policy(self, context: PolicyContext, policy: Policy) -> Dict[str, Any]:
        """Evaluate a single policy against travel data"""
        logger.debug(f"Evaluating policy: {policy.label}")
        
        rule_results = []
        policy_violated = False
        
        for rule in policy.rules:
            if not rule.active:
                continue
            
            logger.debug(f"Evaluating rule: {rule.code}")
            
            # Get rule specification
            rule_spec = self.rule_registry.get_rule_spec(rule.code)
            if not rule_spec:
                logger.warning(f"Unknown rule specification: {rule.code}")
                continue
            
            # Apply the rule
            try:
                rule_result = rule_spec.apply(context, rule.vars or {})
                logger.debug(f"Rule {rule.code} result: {rule_result}")
                
                # Check exceptions if rule failed
                if rule_result is False:
                    for exception in rule.exceptions:
                        if not exception.active:
                            continue
                        
                        exc_spec = self.rule_registry.get_rule_spec(exception.code)
                        if exc_spec:
                            exc_result = exc_spec.apply(context, exception.vars or {})
                            if exc_result is True:
                                logger.debug(f"Exception {exception.code} applied, overriding rule failure")
                                rule_result = True
                                break
                
                rule_results.append({
                    'rule_id': str(rule.id),
                    'rule_code': rule.code,
                    'result': rule_result,
                    'action': rule.action,
                    'vars': rule.vars
                })
                
                # If any rule fails, mark policy as violated
                if rule_result is False:
                    policy_violated = True
                
            except Exception as e:
                logger.error(f"Error evaluating rule {rule.code}: {e}")
                rule_results.append({
                    'rule_id': str(rule.id),
                    'rule_code': rule.code,
                    'result': None,
                    'action': rule.action,
                    'error': str(e)
                })
        
        # Determine policy result
        if policy_violated:
            policy_result = self._map_action_to_result(policy.action)
        elif policy.enforce_approval:
            policy_result = 'APPROVAL_REQUIRED'
        else:
            policy_result = 'IN_POLICY'
        
        return {
            'policy_id': str(policy.id),
            'policy_label': policy.label,
            'policy_type': policy.type,
            'result': policy_result,
            'rule_results': rule_results,
            'enforce_approval': policy.enforce_approval,
            'message_for_reservation': policy.message_for_reservation
        }
    
    def _combine_policy_results(self, policy_results: List[Dict[str, Any]]) -> str:
        """
        Combine multiple policy results into final result
        Priority (most to least restrictive): HIDDEN > BOOKING_BLOCKED > APPROVAL_REQUIRED > OUT_OF_POLICY > IN_POLICY
        """
        if not policy_results:
            return 'NOT_SPECIFIED'
        
        result_priority = {
            'HIDDEN': 5,
            'BOOKING_BLOCKED': 4,
            'APPROVAL_REQUIRED': 3,
            'OUT_OF_POLICY': 2,
            'IN_POLICY': 1,
            'NOT_SPECIFIED': 0
        }
        
        max_priority = 0
        final_result = 'IN_POLICY'
        
        for policy_result in policy_results:
            result = policy_result.get('result', 'NOT_SPECIFIED')
            priority = result_priority.get(result, 0)
            
            if priority > max_priority:
                max_priority = priority
                final_result = result
        
        return final_result
    
    def _map_action_to_result(self, action: str) -> str:
        """Map policy action to evaluation result"""
        mapping = {
            'HIDE': 'HIDDEN',
            'BLOCK': 'BOOKING_BLOCKED',
            'APPROVE': 'APPROVAL_REQUIRED',
            'OUT_OF_POLICY': 'OUT_OF_POLICY'
        }
        return mapping.get(action, 'OUT_OF_POLICY')
    
    def _collect_messages(self, policy_results: List[Dict[str, Any]], travel_data: Dict[str, Any]) -> List[str]:
        """Collect policy violation messages"""
        messages = []
        
        for policy_result in policy_results:
            if policy_result['result'] in ['HIDDEN', 'BOOKING_BLOCKED', 'APPROVAL_REQUIRED', 'OUT_OF_POLICY']:
                
                # Check for custom messages
                custom_messages = policy_result.get('message_for_reservation')
                if custom_messages and isinstance(custom_messages, dict):
                    # Try to get message for travel type
                    travel_type = self._determine_travel_type(travel_data)
                    message = custom_messages.get(travel_type) or custom_messages.get('default')
                    if message:
                        messages.append(message)
                        continue
                
                # Default message
                policy_label = policy_result['policy_label']
                result = policy_result['result']
                
                if result == 'APPROVAL_REQUIRED':
                    messages.append(f"Approval required due to policy: {policy_label}")
                elif result == 'OUT_OF_POLICY':
                    messages.append(f"This booking is out of policy: {policy_label}")
                elif result == 'BOOKING_BLOCKED':
                    messages.append(f"Booking blocked by policy: {policy_label}")
        
        return messages
    
    def _collect_approvers(self, policy_results: List[Dict[str, Any]]) -> List[str]:
        """Collect required approvers for policies that need approval"""
        approvers = []
        
        for policy_result in policy_results:
            if policy_result['result'] == 'APPROVAL_REQUIRED':
                policy_id = policy_result['policy_id']
                
                # Get approvers for this policy
                from app.models.policy_approver import PolicyApprover
                policy_approvers = PolicyApprover.find_by_policy_id(UUID(policy_id))
                
                for approver in policy_approvers:
                    if str(approver.user_id) not in approvers:
                        approvers.append(str(approver.user_id))
        
        return approvers
    
    def _determine_travel_type(self, travel_data: Dict[str, Any]) -> str:
        """Determine travel type from travel data"""
        if 'train' in travel_data:
            return 'train'
        elif 'flight' in travel_data:
            return 'flight'
        elif 'hotel' in travel_data:
            return 'hotel'
        elif 'car' in travel_data:
            return 'car'
        else:
            return 'default'