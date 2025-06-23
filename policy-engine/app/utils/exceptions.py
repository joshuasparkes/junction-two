"""Custom exceptions for the policy engine"""

class PolicyEngineError(Exception):
    """Base exception for policy engine errors"""
    pass

class PolicyNotFoundError(PolicyEngineError):
    """Raised when a policy is not found"""
    pass

class ValidationError(PolicyEngineError):
    """Raised when data validation fails"""
    pass

class PolicyEvaluationError(PolicyEngineError):
    """Raised when policy evaluation fails"""
    pass

class RuleSpecificationError(PolicyEngineError):
    """Raised when rule specification is invalid"""
    pass

class CurrencyConversionError(PolicyEngineError):
    """Raised when currency conversion fails"""
    pass