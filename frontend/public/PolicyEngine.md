# Travel Policy Engine - Complete Implementation Guide

## Overview

The Travel Policy Engine is a comprehensive business rules engine that evaluates travel bookings (flights, hotels, cars, trains) against organizational policies. It enforces approval workflows, price limits, class restrictions, and other business rules with support for exceptions and complex multi-level policies.

## Current Architecture (Java/Spring)

### Core Components

1. **Policy Management Service**: Handles CRUD operations for policies, rules, and exceptions
2. **Policy Evaluation Engine**: Evaluates travel options against active policies
3. **Context System**: Provides runtime context for policy evaluation
4. **Rule Specifications**: Pluggable rule implementations for different travel types
5. **Approval Workflow**: Manages approval requirements and notifications

### Data Model

#### Policy Hierarchy
```
Organization
├── Policy (travel_policy)
    ├── PolicyRule (policy_rule)
        ├── PolicyRuleException (policy_rule_exception)
```

#### Core Entities

**Policy**
- `org_id`: Organization identifier
- `label`: Human-readable policy name
- `type`: ORG or TRAVEL policy type
- `active`: Policy activation status
- `action`: Action when policy fails (HIDE, BLOCK, APPROVE, OUT_OF_POLICY)
- `enforce_approval`: Force approval requirement
- `message_for_reservation`: Custom messages per reservation type (JSONB)
- User assignments and counts

**PolicyRule**
- `code`: Rule specification type (enum)
- `policy_id`: Parent policy
- `action`: Action when rule fails
- `vars`: Rule parameters (JSONB)
- `active`: Rule activation status

**PolicyRuleException**
- `code`: Exception rule specification
- `policy_rule_id`: Parent rule
- `vars`: Exception parameters (JSONB)
- `active`: Exception activation status

### Database Schema

#### Primary Tables
```sql
-- Main policy table
CREATE TABLE policy (
    id BIGINT PRIMARY KEY,
    created_on BIGINT NOT NULL,
    nms BIGINT NOT NULL,
    label VARCHAR(512) NOT NULL,
    org_id BIGINT NOT NULL,
    type VARCHAR(32) NOT NULL,
    active BOOLEAN NOT NULL,
    exclude_restricted_fares BOOLEAN NOT NULL DEFAULT FALSE,
    refundable_fares_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    message_for_reservation JSONB,
    action VARCHAR(32) NOT NULL DEFAULT 'OUT_OF_POLICY',
    enforce_approval BOOLEAN NOT NULL DEFAULT FALSE,
    user_count BIGINT DEFAULT 0,
    guest_count BIGINT DEFAULT 0,
    approver_count BIGINT DEFAULT 0
);

-- Policy rules table
CREATE TABLE policy_rule (
    id BIGINT PRIMARY KEY,
    created_on BIGINT NOT NULL,
    nms BIGINT NOT NULL,
    code VARCHAR(64) NOT NULL,
    action VARCHAR(32) NOT NULL,
    policy_id BIGINT NOT NULL,
    vars JSONB,
    active BOOLEAN NOT NULL
);

-- Rule exceptions table
CREATE TABLE policy_rule_exception (
    id BIGINT PRIMARY KEY,
    created_on BIGINT NOT NULL,
    nms BIGINT NOT NULL,
    code VARCHAR(64) NOT NULL,
    policy_rule_id BIGINT NOT NULL,
    vars JSONB,
    active BOOLEAN NOT NULL
);

-- Policy approvers
CREATE TABLE policy_approver (
    id BIGINT PRIMARY KEY,
    org_user_id BIGINT NOT NULL,
    policy_id BIGINT NOT NULL
);

-- User policy assignments (in org_user table)
-- org_user.policy_ids JSONB array

-- Location-based policies
CREATE TABLE policy_city (
    id BIGINT,
    code VARCHAR(3) NOT NULL,
    name VARCHAR(200) NOT NULL
);

-- Airline preferences
CREATE TABLE org_airline_pref (
    id BIGINT PRIMARY KEY,
    org_id BIGINT NOT NULL,
    airline_code VARCHAR(10) NOT NULL,
    policy_id BIGINT NOT NULL,
    preference_level INT NOT NULL DEFAULT 0
);
```

### API Endpoints

#### Policy Management
- `POST /org/policy/create` - Create new policy
- `POST /org/policy/update` - Update existing policy
- `POST /org/policy/delete` - Delete policy
- `GET /org/policy/get?id={policyId}` - Get specific policy
- `GET /org/policy/list?orgId={orgId}` - List organization policies

#### Policy Rules
- `POST /org/policy/rule/create` - Create policy rule
- `POST /org/policy/rule/update` - Update policy rule
- `POST /org/policy/rule/delete` - Delete policy rule
- `GET /org/policy/rule/get?id={ruleId}` - Get policy rule
- `GET /org/policy/rule/specs/list` - List available rule specifications

#### Policy Rule Exceptions
- `POST /org/policy/rule/exception/create` - Create rule exception
- `POST /org/policy/rule/exception/update` - Update rule exception
- `POST /org/policy/rule/exception/delete` - Delete rule exception
- `GET /org/policy/rule/exception/get?id={exceptionId}` - Get rule exception

#### User Policy Management
- `POST /org/user/policy/add` - Add policies to users
- `POST /org/user/policy/delete` - Remove policies from users
- `GET /org/user/policy/get?userId={userId}` - Get user's policies
- `GET /org/user/policy/listOrgUsers?policyId={policyId}` - List users by policy

#### Policy Evaluation
- `POST /travel/policy/evaluate` - Evaluate travel options against policies
- `GET /travel/policy/info` - Get policy information for travel searches

### Rule Specifications

#### Flight Rules
- `flight_class_max`: Maximum cabin class (Economy, Premium, Business, First)
- `flight_fare_type_max`: Maximum fare type restriction
- `flight_long_od_price`: Long-haul price limits
- `advanced_purchase`: Advance purchase requirements
- `flight_lowest_logical`: Require lowest logical fare
- `flight_refundable_fares`: Refundable fare requirements

#### Hotel Rules
- `hotel_price_max`: Maximum price per night
- `hotel_max_rating`: Maximum hotel rating
- `hotel_min_rating`: Minimum hotel rating
- `hotel_has_preference`: Preferred hotel chains

#### Car Rules
- `car_max_price_per_day`: Maximum daily rate
- `car_max_fare_type`: Maximum car class
- `car_has_preference`: Preferred car rental companies

#### Train Rules
- `train_max_od_price`: Maximum origin-destination price
- `train_advanced_purchase`: Advance purchase requirements

### Policy Evaluation Engine

#### Results Hierarchy (Most to Least Restrictive)
1. `HIDDEN` - Completely hide the option
2. `BOOKING_BLOCKED` - Show but prevent booking
3. `APPROVAL_REQUIRED` - Require manager approval
4. `OUT_OF_POLICY` - Mark as out of policy but allow booking
5. `IN_POLICY` - Fully compliant
6. `NOT_SPECIFIED` - No policy applies

#### Policy Actions
- `HIDE` → `HIDDEN`
- `BLOCK` → `BOOKING_BLOCKED`
- `APPROVE` → `APPROVAL_REQUIRED`
- `OUT_OF_POLICY` → `OUT_OF_POLICY`

#### Evaluation Flow
1. **Context Building**: Load organization policies and user assignments
2. **Rule Matrix**: Group rules by specification type
3. **Rule Evaluation**: Execute rules with exceptions
4. **Result Combination**: Apply most restrictive result across all rules
5. **Approval Enforcement**: Handle organization-level approval requirements

### Integration Points

The policy engine integrates with:
- **Flight Search**: Filters flight results and applies policy flags
- **Hotel Search**: Filters hotel options and room types
- **Car Rental**: Filters car options and pricing
- **Train Search**: Filters train fares and classes
- **Booking Process**: Enforces approval workflows
- **User Management**: Manages policy assignments
- **Currency Exchange**: Handles multi-currency price comparisons

---

## Flask Microservice Implementation Guide

### Technology Stack

**Backend Framework**: Flask + Flask-RESTful
**Database**: PostgreSQL with SQLAlchemy ORM
**API Documentation**: Flask-RESTX (Swagger/OpenAPI)
**Authentication**: JWT tokens
**Task Queue**: Celery + Redis (for async operations)
**Caching**: Redis
**Testing**: pytest + Factory Boy
**Containerization**: Docker + Docker Compose

### Project Structure

```
policy-engine/
├── app/
│   ├── __init__.py
│   ├── config.py
│   ├── models/
│   │   ├── __init__.py
│   │   ├── policy.py
│   │   ├── policy_rule.py
│   │   ├── policy_rule_exception.py
│   │   └── mixins.py
│   ├── api/
│   │   ├── __init__.py
│   │   ├── v1/
│   │   │   ├── __init__.py
│   │   │   ├── policies.py
│   │   │   ├── policy_rules.py
│   │   │   ├── policy_exceptions.py
│   │   │   ├── user_policies.py
│   │   │   └── policy_evaluation.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── policy_service.py
│   │   ├── evaluation_service.py
│   │   ├── rule_engine.py
│   │   └── context_service.py
│   ├── rules/
│   │   ├── __init__.py
│   │   ├── base.py
│   │   ├── flight_rules.py
│   │   ├── hotel_rules.py
│   │   ├── car_rules.py
│   │   └── train_rules.py
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── currency.py
│   │   ├── validators.py
│   │   └── exceptions.py
│   └── schemas/
│       ├── __init__.py
│       ├── policy_schemas.py
│       ├── rule_schemas.py
│       └── evaluation_schemas.py
├── migrations/
├── tests/
├── docker/
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
└── run.py
```

### Core Models (SQLAlchemy)

```python
# app/models/policy.py
from sqlalchemy import Column, Integer, String, Boolean, JSON, BigInteger, ForeignKey
from sqlalchemy.orm import relationship
from app.models.mixins import TimestampMixin, BaseModel

class Policy(BaseModel, TimestampMixin):
    __tablename__ = 'policy'
    
    id = Column(BigInteger, primary_key=True)
    org_id = Column(BigInteger, nullable=False, index=True)
    label = Column(String(512), nullable=False)
    type = Column(String(32), nullable=False)  # ORG, TRAVEL
    active = Column(Boolean, nullable=False, default=True)
    action = Column(String(32), nullable=False, default='OUT_OF_POLICY')
    enforce_approval = Column(Boolean, nullable=False, default=False)
    message_for_reservation = Column(JSON)
    exclude_restricted_fares = Column(Boolean, nullable=False, default=False)
    refundable_fares_enabled = Column(Boolean, nullable=False, default=False)
    user_count = Column(BigInteger, default=0)
    guest_count = Column(BigInteger, default=0)
    approver_count = Column(BigInteger, default=0)
    
    # Relationships
    rules = relationship("PolicyRule", back_populates="policy", cascade="all, delete-orphan")
    approvers = relationship("PolicyApprover", back_populates="policy", cascade="all, delete-orphan")

class PolicyRule(BaseModel, TimestampMixin):
    __tablename__ = 'policy_rule'
    
    id = Column(BigInteger, primary_key=True)
    code = Column(String(64), nullable=False)
    action = Column(String(32), nullable=False)
    policy_id = Column(BigInteger, ForeignKey('policy.id'), nullable=False)
    vars = Column(JSON)
    active = Column(Boolean, nullable=False, default=True)
    
    # Relationships
    policy = relationship("Policy", back_populates="rules")
    exceptions = relationship("PolicyRuleException", back_populates="rule", cascade="all, delete-orphan")

class PolicyRuleException(BaseModel, TimestampMixin):
    __tablename__ = 'policy_rule_exception'
    
    id = Column(BigInteger, primary_key=True)
    code = Column(String(64), nullable=False)
    policy_rule_id = Column(BigInteger, ForeignKey('policy_rule.id'), nullable=False)
    vars = Column(JSON)
    active = Column(Boolean, nullable=False, default=True)
    
    # Relationships
    rule = relationship("PolicyRule", back_populates="exceptions")
```

### API Endpoints (Flask-RESTX)

```python
# app/api/v1/policies.py
from flask_restx import Namespace, Resource, fields
from flask import request
from app.services.policy_service import PolicyService

api = Namespace('policies', description='Policy management operations')

policy_model = api.model('Policy', {
    'id': fields.Integer(readonly=True),
    'org_id': fields.Integer(required=True),
    'label': fields.String(required=True, max_length=512),
    'type': fields.String(required=True, enum=['ORG', 'TRAVEL']),
    'active': fields.Boolean(default=True),
    'action': fields.String(enum=['HIDE', 'BLOCK', 'APPROVE', 'OUT_OF_POLICY']),
    'enforce_approval': fields.Boolean(default=False),
    'message_for_reservation': fields.Raw(),
})

@api.route('/')
class PolicyList(Resource):
    @api.marshal_list_with(policy_model)
    def get(self):
        """List policies for organization"""
        org_id = request.args.get('orgId', type=int)
        return PolicyService.get_policies_by_org(org_id)
    
    @api.expect(policy_model)
    @api.marshal_with(policy_model, code=201)
    def post(self):
        """Create a new policy"""
        return PolicyService.create_policy(api.payload), 201

@api.route('/<int:policy_id>')
class PolicyItem(Resource):
    @api.marshal_with(policy_model)
    def get(self, policy_id):
        """Get specific policy"""
        return PolicyService.get_policy(policy_id)
    
    @api.expect(policy_model)
    @api.marshal_with(policy_model)
    def put(self, policy_id):
        """Update policy"""
        return PolicyService.update_policy(policy_id, api.payload)
    
    def delete(self, policy_id):
        """Delete policy"""
        PolicyService.delete_policy(policy_id)
        return '', 204
```

### Rule Engine Implementation

```python
# app/services/rule_engine.py
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from app.utils.currency import CurrencyConverter

class PolicyContext:
    def __init__(self, travel_data: Dict[str, Any], org_id: int, user_id: int):
        self.travel_data = travel_data
        self.org_id = org_id
        self.user_id = user_id
        self.currency_converter = CurrencyConverter()
    
    def get_parameter(self, key: str, default=None):
        return self.travel_data.get(key, default)
    
    def exchange_currency(self, amount: float, from_currency: str, to_currency: str = 'USD'):
        return self.currency_converter.convert(amount, from_currency, to_currency)

class RuleSpecification(ABC):
    @abstractmethod
    def apply(self, context: PolicyContext, rule_vars: Dict[str, Any]) -> Optional[bool]:
        """
        Apply rule to context
        Returns: True (compliant), False (violation), None (not applicable)
        """
        pass

class FlightMaxClassRule(RuleSpecification):
    def apply(self, context: PolicyContext, rule_vars: Dict[str, Any]) -> Optional[bool]:
        max_class = rule_vars.get('flightClass')
        flight_data = context.get_parameter('flight')
        
        if not max_class or not flight_data:
            return None
            
        cabin_class_order = ['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST']
        max_class_index = cabin_class_order.index(max_class)
        
        for segment in flight_data.get('segments', []):
            cabin = segment.get('cabin', 'ECONOMY')
            if cabin_class_order.index(cabin) > max_class_index:
                return False
        
        return True

class HotelMaxPriceRule(RuleSpecification):
    def apply(self, context: PolicyContext, rule_vars: Dict[str, Any]) -> Optional[bool]:
        max_price = rule_vars.get('price')
        hotel_data = context.get_parameter('hotel')
        
        if not max_price or not hotel_data:
            return None
            
        room_price = hotel_data.get('price_per_night', 0)
        room_currency = hotel_data.get('currency', 'USD')
        
        converted_price = context.exchange_currency(room_price, room_currency)
        return converted_price <= max_price
```

### Policy Evaluation Service

```python
# app/services/evaluation_service.py
from typing import List, Dict, Any
from app.models.policy import Policy
from app.services.rule_engine import PolicyContext, RuleSpecification
from app.utils.exceptions import PolicyEvaluationError

class PolicyEvaluationService:
    def __init__(self):
        self.rule_registry = self._load_rule_registry()
    
    def evaluate_policies(self, travel_data: Dict[str, Any], org_id: int, user_id: int) -> Dict[str, Any]:
        """Evaluate travel data against user's policies"""
        try:
            # Create evaluation context
            context = PolicyContext(travel_data, org_id, user_id)
            
            # Get applicable policies
            policies = self._get_user_policies(user_id, org_id)
            
            # Evaluate each policy
            results = []
            for policy in policies:
                result = self._evaluate_policy(context, policy)
                results.append(result)
            
            # Combine results (most restrictive wins)
            final_result = self._combine_results(results)
            
            return {
                'result': final_result,
                'policies_evaluated': len(policies),
                'details': results
            }
            
        except Exception as e:
            raise PolicyEvaluationError(f"Policy evaluation failed: {str(e)}")
    
    def _evaluate_policy(self, context: PolicyContext, policy: Policy) -> Dict[str, Any]:
        """Evaluate a single policy"""
        rule_results = []
        
        for rule in policy.rules:
            if not rule.active:
                continue
                
            # Get rule specification
            rule_spec = self.rule_registry.get(rule.code)
            if not rule_spec:
                continue
            
            # Apply rule
            rule_result = rule_spec.apply(context, rule.vars or {})
            
            # Check exceptions
            if rule_result is False:
                for exception in rule.exceptions:
                    if not exception.active:
                        continue
                    
                    exc_spec = self.rule_registry.get(exception.code)
                    if exc_spec and exc_spec.apply(context, exception.vars or {}):
                        rule_result = True
                        break
            
            rule_results.append({
                'rule_id': rule.id,
                'rule_code': rule.code,
                'result': rule_result,
                'action': rule.action
            })
        
        # Determine policy result
        policy_result = self._determine_policy_result(rule_results, policy)
        
        return {
            'policy_id': policy.id,
            'policy_label': policy.label,
            'result': policy_result,
            'rule_results': rule_results
        }
    
    def _determine_policy_result(self, rule_results: List[Dict], policy: Policy) -> str:
        """Determine overall policy result from rule results"""
        # If any rule fails, apply the policy action
        for rule_result in rule_results:
            if rule_result['result'] is False:
                return self._map_action_to_result(policy.action)
        
        # If organization enforces approval, require approval
        if policy.enforce_approval:
            return 'APPROVAL_REQUIRED'
        
        return 'IN_POLICY'
    
    def _map_action_to_result(self, action: str) -> str:
        """Map policy action to evaluation result"""
        mapping = {
            'HIDE': 'HIDDEN',
            'BLOCK': 'BOOKING_BLOCKED',
            'APPROVE': 'APPROVAL_REQUIRED',
            'OUT_OF_POLICY': 'OUT_OF_POLICY'
        }
        return mapping.get(action, 'OUT_OF_POLICY')
```

### API Testing Examples

```python
# tests/test_policy_api.py
import pytest
from app import create_app
from app.models import Policy

@pytest.fixture
def client():
    app = create_app('testing')
    with app.test_client() as client:
        yield client

def test_create_policy(client):
    policy_data = {
        'org_id': 1,
        'label': 'Executive Travel Policy',
        'type': 'TRAVEL',
        'active': True,
        'action': 'APPROVE',
        'enforce_approval': True
    }
    
    response = client.post('/api/v1/policies/', json=policy_data)
    assert response.status_code == 201
    
    data = response.get_json()
    assert data['label'] == 'Executive Travel Policy'
    assert data['action'] == 'APPROVE'

def test_evaluate_policy(client):
    travel_data = {
        'flight': {
            'segments': [
                {'cabin': 'BUSINESS', 'price': 2500, 'currency': 'USD'}
            ]
        }
    }
    
    response = client.post('/api/v1/policy-evaluation/', json={
        'travel_data': travel_data,
        'org_id': 1,
        'user_id': 123
    })
    
    assert response.status_code == 200
    data = response.get_json()
    assert 'result' in data
    assert 'policies_evaluated' in data
```

### Docker Configuration

```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "run:app"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  policy-engine:
    build: .
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=postgresql://user:password@postgres:5432/policy_engine
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=policy_engine
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

### Migration Strategy

1. **Phase 1**: Set up Flask microservice with core models
2. **Phase 2**: Implement policy CRUD operations
3. **Phase 3**: Build rule engine and evaluation service
4. **Phase 4**: Add user management and approval workflows
5. **Phase 5**: Implement caching and performance optimization
6. **Phase 6**: Add monitoring and logging
7. **Phase 7**: Deploy and migrate data from existing system

### Performance Considerations

- **Caching**: Cache frequently accessed policies and rules in Redis
- **Database Indexing**: Index on org_id, user_id, and policy_id columns
- **Async Processing**: Use Celery for complex policy evaluations
- **Connection Pooling**: Use SQLAlchemy connection pooling
- **Rate Limiting**: Implement API rate limiting with Flask-Limiter

This guide provides everything needed to rebuild the Policy Engine as a modern Flask microservice while maintaining the same functionality and API compatibility.