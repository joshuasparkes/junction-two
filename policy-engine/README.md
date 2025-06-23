# Travel Policy Engine

A Flask microservice for managing and evaluating travel policies against rail bookings.

## Features

- **Policy Management**: Create, update, delete travel policies via web UI
- **Rule Engine**: Flexible rule system for different travel types
- **Policy Evaluation**: Real-time evaluation during travel search
- **Rail Support**: 6 comprehensive rules for train travel (price limits, advance purchase, class restrictions, etc.)
- **Currency Conversion**: Multi-currency support for international travel
- **Approval Workflows**: Configurable approval requirements with approver management
- **Frontend Integration**: Seamless integration with React travel booking platform

## Quick Start

### 1. Setup Environment

```bash
# Clone and navigate to policy engine
cd policy-engine

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure Database

```bash
# Copy environment file
cp .env.example .env

# Edit .env with your Supabase database URL
DATABASE_URL=postgresql://user:pass@your-supabase-host:5432/postgres

# Create policy tables in Supabase
# Run the SQL in ../frontend/create-policy-tables.sql
```

### 3. Run the Service

```bash
# Development mode (runs on port 5001)
python run.py

# Or with gunicorn (production)
gunicorn --bind 0.0.0.0:5001 run:app
```

### 4. Access API Documentation

Visit `http://localhost:5001/docs/` for interactive Swagger documentation.

## API Endpoints

### Policy Management
- `GET /api/v1/policies/` - List policies
- `POST /api/v1/policies/` - Create policy
- `GET /api/v1/policies/{id}` - Get policy
- `PUT /api/v1/policies/{id}` - Update policy
- `DELETE /api/v1/policies/{id}` - Delete policy

### Policy Rules
- `GET /api/v1/policy-rules/` - List rules
- `POST /api/v1/policy-rules/` - Create rule
- `GET /api/v1/policy-rules/specs` - List rule specifications

### Policy Evaluation
- `POST /api/v1/policy-evaluation/evaluate` - Evaluate travel data
- `GET /api/v1/policy-evaluation/info` - Get policy info

## Example: Evaluating Train Travel

```bash
curl -X POST http://localhost:5001/api/v1/policy-evaluation/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "travel_data": {
      "train": {
        "price": 150,
        "currency": "EUR",
        "class": "STANDARD",
        "operator": "EUROSTAR",
        "departure_date": "2024-02-01T09:00:00Z"
      },
      "origin": "LDN",
      "destination": "PAR"
    },
    "org_id": "4ff9e8ea-9dec-4b90-95f2-a3cd667ac75c",
    "user_id": "user-uuid-here"
  }'
```

## Rule Specifications

### Train Rules
- `train_max_od_price` - Maximum price per journey
- `train_advanced_purchase` - Advance booking requirements
- `train_class_max` - Maximum class restrictions
- `train_operator_preference` - Operator preferences/restrictions
- `train_route_restriction` - Route-based restrictions

## Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build

# Or just the policy engine
docker build -t policy-engine .
docker run -p 5001:5001 policy-engine
```

## Testing

```bash
# Run tests
pytest

# With coverage
pytest --cov=app tests/
```

## Development

The service follows a modular architecture:

- `app/models/` - SQLAlchemy models
- `app/api/` - REST API endpoints  
- `app/services/` - Business logic
- `app/rules/` - Rule specifications
- `app/utils/` - Utilities (currency, exceptions)

### Adding New Rules

1. Create rule class in `app/services/rule_engine.py`
2. Register in `RuleRegistry`
3. Add specification to `PolicyService.get_rule_specifications()`
4. Add tests

## Integration

### **Current Frontend Integration**

The policy engine is fully integrated with the Junction Two travel platform:

- **Policy Management UI** - Create/edit policies in Travel Manager
- **Real-time Evaluation** - Policy badges on train search results  
- **Policy Filtering** - Hidden offers automatically filtered out
- **Approval Workflow** - Configurable approval requirements

### **Technical Integration**

- **Database**: Supabase PostgreSQL with Row Level Security
- **Authentication**: Integrated with existing auth system
- **Travel Search**: Real-time policy evaluation during booking
- **Approval System**: Policy approver management (backend ready, frontend pending)

### **Demo Workflow**

1. **Create Policy**: Travel Manager → Policies → Create Policy
2. **Add Rules**: Configure price limits, class restrictions, etc.
3. **Search Trains**: Book Travel → Rail search shows policy badges
4. **Policy Compliance**: See real-time compliance status on results