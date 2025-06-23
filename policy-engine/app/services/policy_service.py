from typing import List, Dict, Any, Optional
from uuid import UUID
import uuid
from app.models.policy import Policy
from app.models.policy_rule import PolicyRule
from app.models.policy_rule_exception import PolicyRuleException
from app.models.policy_approver import PolicyApprover
from app.models.user_policy_assignment import UserPolicyAssignment
from app.utils.exceptions import PolicyNotFoundError, ValidationError
from sqlalchemy.exc import OperationalError
import logging

logger = logging.getLogger(__name__)

class PolicyService:
    """Service class for policy management operations"""
    
    @staticmethod
    def _get_demo_policies(org_id: str) -> List[Dict[str, Any]]:
        """Return demo policy data when database is unavailable"""
        return [
            {
                'id': str(uuid.uuid4()),
                'org_id': org_id,
                'label': 'Corporate Travel Policy',
                'type': 'TRAVEL',
                'active': True,
                'action': 'OUT_OF_POLICY',
                'enforce_approval': True,
                'message_for_reservation': {'message': 'Please ensure compliance with company travel policy'},
                'exclude_restricted_fares': False,
                'refundable_fares_enabled': True,
                'user_count': '45',
                'guest_count': '0',
                'approver_count': '3',
                'created_at': '2024-01-15T10:00:00Z',
                'updated_at': '2024-01-15T10:00:00Z'
            },
            {
                'id': str(uuid.uuid4()),
                'org_id': org_id,
                'label': 'Executive Travel Policy',
                'type': 'TRAVEL',
                'active': True,
                'action': 'APPROVE',
                'enforce_approval': False,
                'message_for_reservation': {'message': 'Executive level travel approved'},
                'exclude_restricted_fares': True,
                'refundable_fares_enabled': True,
                'user_count': '5',
                'guest_count': '0',
                'approver_count': '1',
                'created_at': '2024-01-10T14:30:00Z',
                'updated_at': '2024-01-10T14:30:00Z'
            }
        ]
    
    @staticmethod
    def get_all_policies() -> List[Policy]:
        """Get all active policies"""
        try:
            return Policy.find_active_policies()
        except OperationalError as e:
            logger.warning(f"Database connection failed, returning demo data: {e}")
            return []
    
    @staticmethod
    def get_policies_by_org(org_id: str) -> List[Dict[str, Any]]:
        """Get all policies for an organization"""
        try:
            org_uuid = UUID(org_id)
            policies = Policy.find_by_org_id(org_uuid)
            return [policy.to_dict() for policy in policies]
        except OperationalError as e:
            logger.warning(f"Database connection failed, returning demo data: {e}")
            return PolicyService._get_demo_policies(org_id)
        except ValueError:
            raise ValidationError(f"Invalid organization ID: {org_id}")
    
    @staticmethod
    def get_policy(policy_id: str) -> Policy:
        """Get a specific policy by ID"""
        try:
            policy_uuid = UUID(policy_id)
            policy = Policy.find_by_id(policy_uuid)
            if not policy:
                raise PolicyNotFoundError(f"Policy not found: {policy_id}")
            return policy
        except ValueError:
            raise ValidationError(f"Invalid policy ID: {policy_id}")
    
    @staticmethod
    def create_policy(policy_data: Dict[str, Any]) -> Policy:
        """Create a new policy"""
        try:
            # Validate organization ID
            org_uuid = UUID(policy_data['org_id'])
            
            policy = Policy(
                org_id=org_uuid,
                label=policy_data['label'],
                type=policy_data.get('type', 'TRAVEL'),
                active=policy_data.get('active', True),
                action=policy_data.get('action', 'OUT_OF_POLICY'),
                enforce_approval=policy_data.get('enforce_approval', False),
                message_for_reservation=policy_data.get('message_for_reservation'),
                exclude_restricted_fares=policy_data.get('exclude_restricted_fares', False),
                refundable_fares_enabled=policy_data.get('refundable_fares_enabled', False)
            )
            
            return policy.save()
            
        except ValueError as e:
            raise ValidationError(f"Invalid data: {e}")
        except Exception as e:
            raise ValidationError(f"Failed to create policy: {e}")
    
    @staticmethod
    def update_policy(policy_id: str, policy_data: Dict[str, Any]) -> Policy:
        """Update an existing policy"""
        policy = PolicyService.get_policy(policy_id)
        
        # Update allowed fields
        updatable_fields = [
            'label', 'type', 'active', 'action', 'enforce_approval',
            'message_for_reservation', 'exclude_restricted_fares', 'refundable_fares_enabled'
        ]
        
        update_data = {k: v for k, v in policy_data.items() if k in updatable_fields}
        
        return policy.update(**update_data)
    
    @staticmethod
    def delete_policy(policy_id: str) -> bool:
        """Delete a policy (soft delete by setting active=False)"""
        policy = PolicyService.get_policy(policy_id)
        policy.update(active=False)
        return True
    
    # Policy Rules Management
    @staticmethod
    def get_all_rules() -> List[PolicyRule]:
        """Get all active policy rules"""
        return PolicyRule.query.filter_by(active=True).all()
    
    @staticmethod
    def get_rules_by_policy(policy_id: str) -> List[PolicyRule]:
        """Get all rules for a specific policy"""
        try:
            policy_uuid = UUID(policy_id)
            return PolicyRule.find_by_policy_id(policy_uuid)
        except ValueError:
            raise ValidationError(f"Invalid policy ID: {policy_id}")
    
    @staticmethod
    def get_rule(rule_id: str) -> PolicyRule:
        """Get a specific rule by ID"""
        try:
            rule_uuid = UUID(rule_id)
            rule = PolicyRule.find_by_id(rule_uuid)
            if not rule:
                raise PolicyNotFoundError(f"Rule not found: {rule_id}")
            return rule
        except ValueError:
            raise ValidationError(f"Invalid rule ID: {rule_id}")
    
    @staticmethod
    def create_rule(rule_data: Dict[str, Any]) -> PolicyRule:
        """Create a new policy rule"""
        try:
            # Validate policy exists
            policy_uuid = UUID(rule_data['policy_id'])
            policy = Policy.find_by_id(policy_uuid)
            if not policy:
                raise PolicyNotFoundError(f"Policy not found: {rule_data['policy_id']}")
            
            rule = PolicyRule(
                policy_id=policy_uuid,
                code=rule_data['code'],
                action=rule_data['action'],
                vars=rule_data.get('vars'),
                active=rule_data.get('active', True)
            )
            
            return rule.save()
            
        except ValueError as e:
            raise ValidationError(f"Invalid data: {e}")
        except Exception as e:
            raise ValidationError(f"Failed to create rule: {e}")
    
    @staticmethod
    def update_rule(rule_id: str, rule_data: Dict[str, Any]) -> PolicyRule:
        """Update an existing policy rule"""
        rule = PolicyService.get_rule(rule_id)
        
        updatable_fields = ['code', 'action', 'vars', 'active']
        update_data = {k: v for k, v in rule_data.items() if k in updatable_fields}
        
        return rule.update(**update_data)
    
    @staticmethod
    def delete_rule(rule_id: str) -> bool:
        """Delete a rule (soft delete by setting active=False)"""
        rule = PolicyService.get_rule(rule_id)
        rule.update(active=False)
        return True
    
    # Rule Specifications
    @staticmethod
    def get_rule_specifications(travel_type: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get available rule specifications"""
        all_specs = [
            # Train-specific rules
            {
                'code': 'train_max_od_price',
                'name': 'Maximum Train Price',
                'description': 'Maximum price allowed for origin-destination train journey',
                'travel_type': 'TRAIN',
                'parameters': {
                    'max_price': {'type': 'number', 'required': True, 'description': 'Maximum price'},
                    'currency': {'type': 'string', 'required': True, 'description': 'Currency code (EUR, USD, GBP)'},
                    'trip_type': {'type': 'string', 'required': False, 'description': 'one_way or round_trip'}
                }
            },
            {
                'code': 'train_advanced_purchase',
                'name': 'Advance Purchase Requirement',
                'description': 'Minimum advance purchase time for train bookings',
                'travel_type': 'TRAIN',
                'parameters': {
                    'min_days': {'type': 'number', 'required': True, 'description': 'Minimum days in advance'},
                    'exclude_same_day': {'type': 'boolean', 'required': False, 'description': 'Exclude same-day bookings'}
                }
            },
            {
                'code': 'train_class_max',
                'name': 'Maximum Train Class',
                'description': 'Maximum allowed train class/fare type',
                'travel_type': 'TRAIN',
                'parameters': {
                    'max_class': {'type': 'string', 'required': True, 'description': 'STANDARD, FIRST, BUSINESS'},
                    'exclude_premium': {'type': 'boolean', 'required': False, 'description': 'Exclude premium services'}
                }
            },
            {
                'code': 'train_operator_preference',
                'name': 'Preferred Train Operators',
                'description': 'Preferred or restricted train operators',
                'travel_type': 'TRAIN',
                'parameters': {
                    'preferred_operators': {'type': 'array', 'required': False, 'description': 'List of preferred operator codes'},
                    'restricted_operators': {'type': 'array', 'required': False, 'description': 'List of restricted operator codes'},
                    'preference_level': {'type': 'string', 'required': True, 'description': 'REQUIRED, PREFERRED, AVOID'}
                }
            },
            {
                'code': 'train_route_restriction',
                'name': 'Route Restrictions',
                'description': 'Restrict specific routes or station pairs',
                'travel_type': 'TRAIN',
                'parameters': {
                    'allowed_routes': {'type': 'array', 'required': False, 'description': 'Allowed origin-destination pairs'},
                    'restricted_routes': {'type': 'array', 'required': False, 'description': 'Restricted origin-destination pairs'},
                    'allowed_countries': {'type': 'array', 'required': False, 'description': 'Allowed country codes'}
                }
            },
            {
                'code': 'train_booking_window',
                'name': 'Booking Time Window',
                'description': 'Restrict booking times to business hours',
                'travel_type': 'TRAIN',
                'parameters': {
                    'start_time': {'type': 'string', 'required': True, 'description': 'Start time (HH:MM)'},
                    'end_time': {'type': 'string', 'required': True, 'description': 'End time (HH:MM)'},
                    'timezone': {'type': 'string', 'required': True, 'description': 'Timezone'},
                    'business_days_only': {'type': 'boolean', 'required': False, 'description': 'Weekdays only'}
                }
            }
        ]
        
        if travel_type:
            return [spec for spec in all_specs if spec['travel_type'] == travel_type.upper()]
        
        return all_specs
    
    # User Policy Assignment Management
    @staticmethod
    def assign_policy_to_user(user_id: str, policy_id: str, assigned_by: str) -> UserPolicyAssignment:
        """Assign a policy to a user"""
        try:
            user_uuid = UUID(user_id)
            policy_uuid = UUID(policy_id)
            assigned_by_uuid = UUID(assigned_by)
            
            # Check if policy exists
            policy = Policy.find_by_id(policy_uuid)
            if not policy:
                raise PolicyNotFoundError(f"Policy not found: {policy_id}")
            
            assignment = UserPolicyAssignment(
                user_id=user_uuid,
                policy_id=policy_uuid,
                assigned_by=assigned_by_uuid
            )
            
            return assignment.save()
            
        except ValueError as e:
            raise ValidationError(f"Invalid UUID: {e}")
        except Exception as e:
            raise ValidationError(f"Failed to assign policy: {e}")
    
    @staticmethod
    def remove_policy_from_user(user_id: str, policy_id: str) -> bool:
        """Remove a policy assignment from a user"""
        try:
            user_uuid = UUID(user_id)
            policy_uuid = UUID(policy_id)
            
            assignment = UserPolicyAssignment.query.filter_by(
                user_id=user_uuid,
                policy_id=policy_uuid
            ).first()
            
            if assignment:
                assignment.delete()
                return True
            
            return False
            
        except ValueError as e:
            raise ValidationError(f"Invalid UUID: {e}")
    
    @staticmethod
    def get_user_policies(user_id: str) -> List[Policy]:
        """Get all policies assigned to a user"""
        try:
            user_uuid = UUID(user_id)
            assignments = UserPolicyAssignment.get_user_policies(user_uuid)
            return [assignment.policy for assignment in assignments]
        except ValueError as e:
            raise ValidationError(f"Invalid user ID: {e}")
    
    @staticmethod
    def get_policy_users(policy_id: str) -> List[UserPolicyAssignment]:
        """Get all users assigned to a policy"""
        try:
            policy_uuid = UUID(policy_id)
            return UserPolicyAssignment.find_by_policy_id(policy_uuid)
        except ValueError as e:
            raise ValidationError(f"Invalid policy ID: {e}")
    
    # Policy Approver Management
    @staticmethod
    def add_policy_approver(policy_id: str, user_id: str) -> PolicyApprover:
        """Add an approver to a policy"""
        try:
            policy_uuid = UUID(policy_id)
            user_uuid = UUID(user_id)
            
            # Check if policy exists
            policy = Policy.find_by_id(policy_uuid)
            if not policy:
                raise PolicyNotFoundError(f"Policy not found: {policy_id}")
            
            approver = PolicyApprover(
                policy_id=policy_uuid,
                user_id=user_uuid
            )
            
            return approver.save()
            
        except ValueError as e:
            raise ValidationError(f"Invalid UUID: {e}")
        except Exception as e:
            raise ValidationError(f"Failed to add approver: {e}")
    
    @staticmethod
    def remove_policy_approver(policy_id: str, user_id: str) -> bool:
        """Remove an approver from a policy"""
        try:
            policy_uuid = UUID(policy_id)
            user_uuid = UUID(user_id)
            
            approver = PolicyApprover.query.filter_by(
                policy_id=policy_uuid,
                user_id=user_uuid
            ).first()
            
            if approver:
                approver.delete()
                return True
            
            return False
            
        except ValueError as e:
            raise ValidationError(f"Invalid UUID: {e}")
    
    @staticmethod
    def get_policy_approvers(policy_id: str) -> List[PolicyApprover]:
        """Get all approvers for a policy"""
        try:
            policy_uuid = UUID(policy_id)
            return PolicyApprover.find_by_policy_id(policy_uuid)
        except ValueError as e:
            raise ValidationError(f"Invalid policy ID: {e}")