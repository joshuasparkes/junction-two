"""Rule engine for policy evaluation"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

class PolicyContext:
    """Context for policy evaluation containing travel data and utilities"""
    
    def __init__(self, travel_data: Dict[str, Any], org_id: str, user_id: str, currency_converter):
        self.travel_data = travel_data
        self.org_id = org_id
        self.user_id = user_id
        self.currency_converter = currency_converter
    
    def get_parameter(self, key: str, default=None):
        """Get parameter from travel data"""
        return self.travel_data.get(key, default)
    
    def exchange_currency(self, amount: float, from_currency: str, to_currency: str = 'EUR') -> float:
        """Convert currency amount"""
        return self.currency_converter.convert(amount, from_currency, to_currency)

class RuleSpecification(ABC):
    """Abstract base class for rule specifications"""
    
    @abstractmethod
    def apply(self, context: PolicyContext, rule_vars: Dict[str, Any]) -> Optional[bool]:
        """
        Apply rule to context
        
        Args:
            context: PolicyContext with travel data
            rule_vars: Rule parameters from policy configuration
            
        Returns:
            True: Rule compliant (passes)
            False: Rule violation (fails)
            None: Rule not applicable
        """
        pass

class TrainMaxPriceRule(RuleSpecification):
    """Rule to enforce maximum price for train journeys"""
    
    def apply(self, context: PolicyContext, rule_vars: Dict[str, Any]) -> Optional[bool]:
        max_price = rule_vars.get('max_price')
        currency = rule_vars.get('currency', 'EUR')
        trip_type = rule_vars.get('trip_type', 'one_way')
        
        train_data = context.get_parameter('train')
        
        if not max_price or not train_data:
            logger.debug("TrainMaxPriceRule: Missing max_price or train data")
            return None
        
        try:
            # Get price from train data
            total_price = 0
            train_currency = 'EUR'
            
            if isinstance(train_data, dict):
                # Handle different price structures
                if 'price' in train_data:
                    total_price = float(train_data['price'])
                    train_currency = train_data.get('currency', 'EUR')
                elif 'total_amount' in train_data:
                    total_price = float(train_data['total_amount'])
                    train_currency = train_data.get('currency', 'EUR')
                elif 'segments' in train_data:
                    # Sum up segment prices
                    for segment in train_data['segments']:
                        segment_price = float(segment.get('price', 0))
                        total_price += segment_price
                    train_currency = train_data.get('currency', 'EUR')
            
            if total_price <= 0:
                logger.debug("TrainMaxPriceRule: No valid price found")
                return None
            
            # Convert to policy currency for comparison
            converted_price = context.exchange_currency(total_price, train_currency, currency)
            
            # For round trip, might need to consider different logic
            if trip_type == 'round_trip' and 'return_price' in train_data:
                return_price = float(train_data['return_price'])
                converted_return = context.exchange_currency(return_price, train_currency, currency)
                converted_price += converted_return
            
            result = converted_price <= max_price
            logger.debug(f"TrainMaxPriceRule: {converted_price} {currency} <= {max_price} {currency} = {result}")
            
            return result
            
        except (ValueError, TypeError) as e:
            logger.error(f"TrainMaxPriceRule error: {e}")
            return None

class TrainAdvancePurchaseRule(RuleSpecification):
    """Rule to enforce advance purchase requirements"""
    
    def apply(self, context: PolicyContext, rule_vars: Dict[str, Any]) -> Optional[bool]:
        min_days = rule_vars.get('min_days')
        exclude_same_day = rule_vars.get('exclude_same_day', False)
        
        train_data = context.get_parameter('train')
        
        if min_days is None or not train_data:
            return None
        
        try:
            # Get departure date
            departure_date = None
            if 'departure_date' in train_data:
                departure_date = datetime.fromisoformat(train_data['departure_date'].replace('Z', '+00:00'))
            elif 'departure_time' in train_data:
                departure_date = datetime.fromisoformat(train_data['departure_time'].replace('Z', '+00:00'))
            
            if not departure_date:
                logger.debug("TrainAdvancePurchaseRule: No departure date found")
                return None
            
            # Calculate days until departure
            now = datetime.utcnow()
            days_until_departure = (departure_date - now).days
            
            # Same day booking check
            if exclude_same_day and days_until_departure == 0:
                logger.debug("TrainAdvancePurchaseRule: Same day booking excluded")
                return False
            
            result = days_until_departure >= min_days
            logger.debug(f"TrainAdvancePurchaseRule: {days_until_departure} days >= {min_days} days = {result}")
            
            return result
            
        except (ValueError, TypeError) as e:
            logger.error(f"TrainAdvancePurchaseRule error: {e}")
            return None

class TrainClassMaxRule(RuleSpecification):
    """Rule to enforce maximum train class/fare type"""
    
    def apply(self, context: PolicyContext, rule_vars: Dict[str, Any]) -> Optional[bool]:
        max_class = rule_vars.get('max_class')
        exclude_premium = rule_vars.get('exclude_premium', False)
        
        train_data = context.get_parameter('train')
        
        if not max_class or not train_data:
            return None
        
        try:
            # Define class hierarchy (lower number = lower class)
            class_hierarchy = {
                'STANDARD': 1,
                'COMFORT': 2,
                'FIRST': 3,
                'BUSINESS': 4,
                'PREMIUM': 5
            }
            
            max_class_level = class_hierarchy.get(max_class.upper(), 1)
            
            # Check class from train data
            train_class = None
            if 'class' in train_data:
                train_class = train_data['class']
            elif 'fare_class' in train_data:
                train_class = train_data['fare_class']
            elif 'segments' in train_data:
                # Check all segments
                for segment in train_data['segments']:
                    segment_class = segment.get('class') or segment.get('fare_class')
                    if segment_class:
                        train_class = segment_class
                        break
            
            if not train_class:
                logger.debug("TrainClassMaxRule: No class information found")
                return None
            
            train_class_level = class_hierarchy.get(train_class.upper(), 1)
            
            # Premium exclusion check
            if exclude_premium and train_class.upper() == 'PREMIUM':
                logger.debug("TrainClassMaxRule: Premium class excluded")
                return False
            
            result = train_class_level <= max_class_level
            logger.debug(f"TrainClassMaxRule: {train_class} (level {train_class_level}) <= {max_class} (level {max_class_level}) = {result}")
            
            return result
            
        except (ValueError, TypeError) as e:
            logger.error(f"TrainClassMaxRule error: {e}")
            return None

class TrainOperatorPreferenceRule(RuleSpecification):
    """Rule to enforce train operator preferences"""
    
    def apply(self, context: PolicyContext, rule_vars: Dict[str, Any]) -> Optional[bool]:
        preferred_operators = rule_vars.get('preferred_operators', [])
        restricted_operators = rule_vars.get('restricted_operators', [])
        preference_level = rule_vars.get('preference_level', 'PREFERRED')
        
        train_data = context.get_parameter('train')
        
        if not train_data:
            return None
        
        try:
            # Get operator from train data
            operator = None
            if 'operator' in train_data:
                operator = train_data['operator']
            elif 'carrier' in train_data:
                operator = train_data['carrier']
            elif 'segments' in train_data:
                # Check first segment operator
                for segment in train_data['segments']:
                    segment_operator = segment.get('operator') or segment.get('carrier')
                    if segment_operator:
                        operator = segment_operator
                        break
            
            if not operator:
                logger.debug("TrainOperatorPreferenceRule: No operator information found")
                return None
            
            operator_code = operator.upper() if isinstance(operator, str) else str(operator).upper()
            
            # Check restricted operators first
            if restricted_operators and operator_code in [op.upper() for op in restricted_operators]:
                logger.debug(f"TrainOperatorPreferenceRule: Operator {operator_code} is restricted")
                return False
            
            # Check preference level
            if preference_level == 'REQUIRED' and preferred_operators:
                result = operator_code in [op.upper() for op in preferred_operators]
                logger.debug(f"TrainOperatorPreferenceRule: Required operator check: {operator_code} in {preferred_operators} = {result}")
                return result
            
            elif preference_level == 'AVOID' and preferred_operators:
                result = operator_code not in [op.upper() for op in preferred_operators]
                logger.debug(f"TrainOperatorPreferenceRule: Avoid operator check: {operator_code} not in {preferred_operators} = {result}")
                return result
            
            # For 'PREFERRED' level, always pass (just informational)
            logger.debug(f"TrainOperatorPreferenceRule: Preference level {preference_level}, passing")
            return True
            
        except (ValueError, TypeError) as e:
            logger.error(f"TrainOperatorPreferenceRule error: {e}")
            return None

class TrainRouteRestrictionRule(RuleSpecification):
    """Rule to enforce route restrictions"""
    
    def apply(self, context: PolicyContext, rule_vars: Dict[str, Any]) -> Optional[bool]:
        allowed_routes = rule_vars.get('allowed_routes', [])
        restricted_routes = rule_vars.get('restricted_routes', [])
        allowed_countries = rule_vars.get('allowed_countries', [])
        
        train_data = context.get_parameter('train')
        
        if not train_data:
            return None
        
        try:
            # Get origin and destination
            origin = context.get_parameter('origin')
            destination = context.get_parameter('destination')
            
            if not origin or not destination:
                # Try to get from train data
                origin = train_data.get('origin') or train_data.get('departure_station')
                destination = train_data.get('destination') or train_data.get('arrival_station')
            
            if not origin or not destination:
                logger.debug("TrainRouteRestrictionRule: No origin/destination found")
                return None
            
            route = f"{origin}_{destination}"
            
            # Check restricted routes
            if restricted_routes:
                for restricted_route in restricted_routes:
                    if isinstance(restricted_route, dict):
                        restricted_origin = restricted_route.get('origin')
                        restricted_dest = restricted_route.get('destination')
                        if origin == restricted_origin and destination == restricted_dest:
                            logger.debug(f"TrainRouteRestrictionRule: Route {route} is restricted")
                            return False
                    elif route == restricted_route:
                        logger.debug(f"TrainRouteRestrictionRule: Route {route} is restricted")
                        return False
            
            # Check allowed routes
            if allowed_routes:
                route_allowed = False
                for allowed_route in allowed_routes:
                    if isinstance(allowed_route, dict):
                        allowed_origin = allowed_route.get('origin')
                        allowed_dest = allowed_route.get('destination')
                        if origin == allowed_origin and destination == allowed_dest:
                            route_allowed = True
                            break
                    elif route == allowed_route:
                        route_allowed = True
                        break
                
                if not route_allowed:
                    logger.debug(f"TrainRouteRestrictionRule: Route {route} not in allowed routes")
                    return False
            
            # Check allowed countries (simplified - would need country mapping)
            if allowed_countries:
                # This would require a station->country mapping
                # For now, just pass
                logger.debug("TrainRouteRestrictionRule: Country restrictions not implemented")
                pass
            
            logger.debug(f"TrainRouteRestrictionRule: Route {route} is allowed")
            return True
            
        except (ValueError, TypeError) as e:
            logger.error(f"TrainRouteRestrictionRule error: {e}")
            return None

class RuleRegistry:
    """Registry for rule specifications"""
    
    def __init__(self):
        self.rules = {
            # Train rules
            'train_max_od_price': TrainMaxPriceRule(),
            'train_advanced_purchase': TrainAdvancePurchaseRule(),
            'train_class_max': TrainClassMaxRule(),
            'train_operator_preference': TrainOperatorPreferenceRule(),
            'train_route_restriction': TrainRouteRestrictionRule(),
        }
    
    def get_rule_spec(self, rule_code: str) -> Optional[RuleSpecification]:
        """Get rule specification by code"""
        return self.rules.get(rule_code)
    
    def register_rule(self, code: str, rule_spec: RuleSpecification):
        """Register a new rule specification"""
        self.rules[code] = rule_spec
    
    def list_rules(self) -> list:
        """List all available rule codes"""
        return list(self.rules.keys())