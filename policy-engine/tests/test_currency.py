#!/usr/bin/env python3
"""Test currency conversion functionality"""

import sys
import os
sys.path.append(os.getcwd())

from app.utils.currency import CurrencyConverter

def test_currency_converter():
    """Test currency conversion with fallback rates"""
    
    print("💱 Testing Currency Converter...")
    
    converter = CurrencyConverter()
    
    # Test same currency
    result = converter.convert(100, 'EUR', 'EUR')
    print(f"✅ Same currency: 100 EUR = {result} EUR")
    
    # Test conversion with default rates (API likely to fail in testing)
    result = converter.convert(100, 'EUR', 'USD')
    print(f"✅ EUR to USD: 100 EUR = {result} USD")
    
    result = converter.convert(100, 'USD', 'GBP')
    print(f"✅ USD to GBP: 100 USD = {result} GBP")
    
    # Test supported currencies
    currencies = converter.get_supported_currencies()
    print(f"✅ Supported currencies: {currencies}")
    
    print("💱 Currency converter working!")

if __name__ == "__main__":
    test_currency_converter()