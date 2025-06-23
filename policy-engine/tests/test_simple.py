#!/usr/bin/env python3
"""Simple test script for policy engine API"""

import sys
import os
import uuid
import json
import requests
import time

# Add project to path
sys.path.append(os.getcwd())

# Start the server in background
import subprocess
import signal

def test_policy_engine():
    """Test the policy engine API endpoints"""
    
    BASE_URL = "http://localhost:5001"
    
    print("🧪 Testing Policy Engine API...")
    
    # Wait for server to be ready
    print("⏳ Waiting for server...")
    for i in range(10):
        try:
            response = requests.get(f"{BASE_URL}/docs/")
            if response.status_code == 200:
                print("✅ Server is ready!")
                break
        except:
            time.sleep(1)
    else:
        print("❌ Server not responding")
        return False
    
    # Test 1: Get rule specifications
    print("\n📋 Test 1: Get rule specifications")
    try:
        response = requests.get(f"{BASE_URL}/api/v1/policy-rules/specs")
        if response.status_code == 200:
            specs = response.json()
            print(f"✅ Found {len(specs)} rule specifications")
            for spec in specs[:2]:  # Show first 2
                print(f"   - {spec['name']}: {spec['description']}")
        else:
            print(f"❌ Failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test 2: List policies (should be empty)
    print("\n📝 Test 2: List policies")
    try:
        response = requests.get(f"{BASE_URL}/api/v1/policies/")
        if response.status_code == 200:
            policies = response.json()
            print(f"✅ Found {len(policies)} policies")
        else:
            print(f"❌ Failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test 3: Test evaluation with sample data
    print("\n🔍 Test 3: Policy evaluation")
    try:
        evaluation_data = {
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
            "user_id": "00000000-0000-0000-0000-000000000001"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/v1/policy-evaluation/evaluate",
            json=evaluation_data
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Evaluation result: {result['result']}")
            print(f"   Policies evaluated: {result['policies_evaluated']}")
        else:
            print(f"❌ Failed: {response.status_code} - {response.text[:200]}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    print("\n🎉 Test completed!")
    return True

if __name__ == "__main__":
    test_policy_engine()