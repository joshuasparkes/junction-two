#!/usr/bin/env python3
"""Advanced test script for policy engine - test full workflow"""

import sys
import os
import uuid
import json
import requests
import time

# Add project to path
sys.path.append(os.getcwd())

BASE_URL = "http://localhost:5001"

def test_full_workflow():
    """Test complete policy creation and evaluation workflow"""
    
    print("🚀 Testing Full Policy Engine Workflow...")
    
    # Step 1: Create a policy
    print("\n📝 Step 1: Creating a policy")
    org_id = "4ff9e8ea-9dec-4b90-95f2-a3cd667ac75c"
    
    policy_data = {
        "org_id": org_id,
        "label": "Executive Rail Travel Policy",
        "type": "TRAVEL",
        "active": True,
        "action": "APPROVE",
        "enforce_approval": False
    }
    
    try:
        # Note: This will fail due to UUID issues, but let's see how far we get
        response = requests.post(f"{BASE_URL}/api/v1/policies/", json=policy_data)
        if response.status_code == 201:
            policy = response.json()
            policy_id = policy['id']
            print(f"✅ Policy created: {policy['label']}")
            
            # Step 2: Add rules to the policy
            print("\n⚙️  Step 2: Adding rules to policy")
            
            rules_to_create = [
                {
                    "policy_id": policy_id,
                    "code": "train_max_od_price",
                    "action": "APPROVAL_REQUIRED",
                    "vars": {"max_price": 300, "currency": "EUR"},
                    "active": True
                },
                {
                    "policy_id": policy_id,
                    "code": "train_class_max", 
                    "action": "BLOCK",
                    "vars": {"max_class": "FIRST"},
                    "active": True
                }
            ]
            
            for rule_data in rules_to_create:
                rule_response = requests.post(f"{BASE_URL}/api/v1/policy-rules/", json=rule_data)
                if rule_response.status_code == 201:
                    rule = rule_response.json()
                    print(f"✅ Rule created: {rule['code']}")
                else:
                    print(f"❌ Rule creation failed: {rule_response.status_code}")
            
            # Step 3: Test policy evaluation scenarios
            print("\n🔍 Step 3: Testing policy evaluation scenarios")
            
            test_scenarios = [
                {
                    "name": "Compliant train booking",
                    "data": {
                        "train": {
                            "price": 250,
                            "currency": "EUR",
                            "class": "STANDARD",
                            "operator": "EUROSTAR",
                            "departure_date": "2024-07-01T09:00:00Z"
                        }
                    },
                    "expected": "IN_POLICY"
                },
                {
                    "name": "Expensive train booking (needs approval)",
                    "data": {
                        "train": {
                            "price": 350,
                            "currency": "EUR", 
                            "class": "STANDARD",
                            "operator": "EUROSTAR",
                            "departure_date": "2024-07-01T09:00:00Z"
                        }
                    },
                    "expected": "APPROVAL_REQUIRED"
                },
                {
                    "name": "Premium class booking (blocked)",
                    "data": {
                        "train": {
                            "price": 200,
                            "currency": "EUR",
                            "class": "BUSINESS",
                            "operator": "EUROSTAR", 
                            "departure_date": "2024-07-01T09:00:00Z"
                        }
                    },
                    "expected": "BOOKING_BLOCKED"
                }
            ]
            
            user_id = str(uuid.uuid4())
            
            # First assign policy to user (this would need user management endpoint)
            print(f"   Using test user: {user_id}")
            
            for scenario in test_scenarios:
                print(f"\n   Testing: {scenario['name']}")
                
                evaluation_request = {
                    "travel_data": scenario['data'],
                    "org_id": org_id,
                    "user_id": user_id
                }
                
                eval_response = requests.post(
                    f"{BASE_URL}/api/v1/policy-evaluation/evaluate",
                    json=evaluation_request
                )
                
                if eval_response.status_code == 200:
                    result = eval_response.json()
                    actual_result = result['result']
                    print(f"   Result: {actual_result}")
                    
                    if actual_result == scenario['expected']:
                        print("   ✅ Expected result!")
                    else:
                        print(f"   ⚠️  Expected {scenario['expected']}, got {actual_result}")
                else:
                    print(f"   ❌ Evaluation failed: {eval_response.status_code}")
            
        else:
            print(f"❌ Policy creation failed: {response.status_code}")
            print(f"   Response: {response.text[:500]}")
            
            # Let's still test with no policies (should return NOT_SPECIFIED)
            print("\n🔍 Testing evaluation with no policies...")
            evaluation_request = {
                "travel_data": {
                    "train": {
                        "price": 150,
                        "currency": "EUR",
                        "class": "STANDARD"
                    }
                },
                "org_id": org_id,
                "user_id": str(uuid.uuid4())
            }
            
            eval_response = requests.post(
                f"{BASE_URL}/api/v1/policy-evaluation/evaluate",
                json=evaluation_request
            )
            
            if eval_response.status_code == 200:
                result = eval_response.json()
                print(f"✅ No policy result: {result['result']} (expected: NOT_SPECIFIED)")
            else:
                print(f"❌ Evaluation failed: {eval_response.status_code}")
                
    except Exception as e:
        print(f"❌ Error in workflow: {e}")
    
    print("\n🎉 Workflow test completed!")

if __name__ == "__main__":
    test_full_workflow()