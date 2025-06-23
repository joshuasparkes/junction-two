#!/usr/bin/env python3
"""Test policy engine integration with frontend"""

import sys
import os
import requests
import json

BASE_URL = "http://localhost:5001"

def test_frontend_integration():
    """Test the exact API calls the frontend will make"""
    
    print("🔗 Testing Frontend Integration...")
    
    # Test 1: Health check
    print("\n1️⃣ Health Check")
    try:
        response = requests.get(f"{BASE_URL}/docs/")
        print(f"✅ API Documentation: {response.status_code}")
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return
    
    # Test 2: Get rule specifications (used by frontend policy creation)
    print("\n2️⃣ Rule Specifications")
    try:
        response = requests.get(f"{BASE_URL}/api/v1/policy-rules/specs?travel_type=TRAIN")
        if response.status_code == 200:
            specs = response.json()
            print(f"✅ Found {len(specs)} train rule types")
            for spec in specs:
                print(f"   - {spec['code']}: {spec['name']}")
        else:
            print(f"❌ Failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test 3: Policy evaluation (used by train search)
    print("\n3️⃣ Policy Evaluation (Train Search Integration)")
    try:
        # Simulate what the frontend PolicyComplianceBadge component sends
        evaluation_request = {
            "travel_data": {
                "train": {
                    "price": 150,
                    "currency": "EUR",
                    "class": "STANDARD",
                    "operator": "EUROSTAR",
                    "departure_date": "2024-07-01T09:00:00Z"
                },
                "origin": "LDN",
                "destination": "PAR"
            },
            "org_id": "4ff9e8ea-9dec-4b90-95f2-a3cd667ac75c",
            "user_id": "test-user-id"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/v1/policy-evaluation/evaluate",
            json=evaluation_request
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Evaluation Result: {result['result']}")
            print(f"   Policies Evaluated: {result['policies_evaluated']}")
            print(f"   Messages: {result['messages']}")
            
            # Test different scenarios
            test_scenarios = [
                {"price": 50, "expected": "Should be IN_POLICY or NOT_SPECIFIED"},
                {"price": 500, "expected": "Might require APPROVAL or be OUT_OF_POLICY"},
            ]
            
            for scenario in test_scenarios:
                eval_req = evaluation_request.copy()
                eval_req["travel_data"]["train"]["price"] = scenario["price"]
                
                resp = requests.post(f"{BASE_URL}/api/v1/policy-evaluation/evaluate", json=eval_req)
                if resp.status_code == 200:
                    res = resp.json()
                    print(f"   €{scenario['price']}: {res['result']} - {scenario['expected']}")
                    
        else:
            print(f"❌ Evaluation failed: {response.status_code}")
            print(f"   Response: {response.text[:200]}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test 4: Frontend policy service connectivity
    print("\n4️⃣ Frontend Policy Service Test")
    try:
        # Test the endpoint the frontend PolicyService.getPolicies() calls
        org_id = "4ff9e8ea-9dec-4b90-95f2-a3cd667ac75c"
        response = requests.get(f"{BASE_URL}/api/v1/policies/?org_id={org_id}")
        
        if response.status_code == 200:
            policies = response.json()
            print(f"✅ Found {len(policies)} policies for organization")
            for policy in policies:
                print(f"   - {policy['label']}: {policy['action']} ({policy['type']})")
        else:
            print(f"❌ Policy fetch failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    print("\n🎉 Integration test completed!")
    print("\n📋 Next Steps:")
    print("1. Run the SQL in create-policy-tables.sql in Supabase")
    print("2. Start the frontend React app")
    print("3. Go to Travel Manager → Policies to create policies")
    print("4. Search trains on Book Travel to see policy badges")

if __name__ == "__main__":
    test_frontend_integration()