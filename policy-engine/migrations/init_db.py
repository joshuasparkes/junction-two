"""Database initialization script for policy engine"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app, db
from app.models import Policy, PolicyRule, PolicyRuleException, PolicyApprover, UserPolicyAssignment

def init_database():
    """Initialize database with tables"""
    app = create_app()
    
    with app.app_context():
        # Create all tables
        db.create_all()
        print("Database tables created successfully!")
        
        # Create some sample data for testing
        create_sample_data()

def create_sample_data():
    """Create sample policies for testing"""
    try:
        # Check if data already exists
        if Policy.query.first():
            print("Sample data already exists, skipping...")
            return
        
        # Sample organization ID (replace with your actual org ID)
        from uuid import UUID
        sample_org_id = UUID("4ff9e8ea-9dec-4b90-95f2-a3cd667ac75c")
        
        # Create a sample policy
        policy = Policy(
            org_id=sample_org_id,
            label="Standard Rail Travel Policy",
            type="TRAVEL",
            active=True,
            action="OUT_OF_POLICY",
            enforce_approval=False,
            exclude_restricted_fares=False,
            refundable_fares_enabled=False
        )
        policy.save()
        
        # Create sample rules
        rules_data = [
            {
                'code': 'train_max_od_price',
                'action': 'APPROVE',
                'vars': {'max_price': 200, 'currency': 'EUR', 'trip_type': 'one_way'}
            },
            {
                'code': 'train_advanced_purchase',
                'action': 'OUT_OF_POLICY',
                'vars': {'min_days': 1, 'exclude_same_day': True}
            },
            {
                'code': 'train_class_max',
                'action': 'BLOCK',
                'vars': {'max_class': 'FIRST', 'exclude_premium': False}
            }
        ]
        
        for rule_data in rules_data:
            rule = PolicyRule(
                policy_id=policy.id,
                code=rule_data['code'],
                action=rule_data['action'],
                vars=rule_data['vars'],
                active=True
            )
            rule.save()
        
        print(f"Sample policy created: {policy.label}")
        print(f"Sample rules created: {len(rules_data)}")
        
    except Exception as e:
        print(f"Error creating sample data: {e}")

if __name__ == '__main__':
    init_database()