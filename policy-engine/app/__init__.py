from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_restx import Api
from app.config import Config

db = SQLAlchemy()
migrate = Migrate()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    
    # Configure CORS to allow frontend requests
    CORS(app, resources={
        r"/api/*": {
            "origins": ["http://localhost:3000", "http://127.0.0.1:3000"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })
    
    # Initialize API
    api = Api(
        app,
        version='1.0',
        title='Travel Policy Engine API',
        description='Policy management and evaluation for travel bookings',
        doc='/docs/'
    )
    
    # Register blueprints/namespaces
    from app.api.v1 import policies, policy_rules, policy_evaluation, approval_requests
    api.add_namespace(policies.api, path='/api/v1/policies')
    api.add_namespace(policy_rules.api, path='/api/v1/policy-rules')
    api.add_namespace(policy_evaluation.api, path='/api/v1/policy-evaluation')
    api.add_namespace(approval_requests.approval_requests_ns, path='/api/v1/approval-requests')
    
    return app