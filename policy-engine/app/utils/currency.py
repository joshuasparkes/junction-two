"""Currency conversion utilities for policy engine"""

import requests
from typing import Dict, Optional
from datetime import datetime, timedelta
from app.utils.exceptions import CurrencyConversionError

class CurrencyConverter:
    """Handles currency conversion for policy evaluation"""
    
    def __init__(self):
        self.base_url = "https://api.exchangerate-api.com/v4/latest"
        self.cache = {}
        self.cache_expiry = timedelta(hours=1)
        
        # Default exchange rates (fallback if API fails)
        self.default_rates = {
            'EUR': {'USD': 1.10, 'GBP': 0.85, 'EUR': 1.0},
            'USD': {'EUR': 0.91, 'GBP': 0.77, 'USD': 1.0},
            'GBP': {'USD': 1.30, 'EUR': 1.18, 'GBP': 1.0}
        }
    
    def get_exchange_rate(self, from_currency: str, to_currency: str) -> float:
        """Get exchange rate between two currencies"""
        if from_currency == to_currency:
            return 1.0
        
        # Check cache first
        cache_key = f"{from_currency}_{to_currency}"
        if cache_key in self.cache:
            cached_data = self.cache[cache_key]
            if datetime.now() - cached_data['timestamp'] < self.cache_expiry:
                return cached_data['rate']
        
        try:
            # Try to fetch from API
            response = requests.get(f"{self.base_url}/{from_currency}", timeout=5)
            response.raise_for_status()
            
            data = response.json()
            rates = data.get('rates', {})
            
            if to_currency not in rates:
                raise CurrencyConversionError(f"Currency {to_currency} not supported")
            
            rate = rates[to_currency]
            
            # Cache the result
            self.cache[cache_key] = {
                'rate': rate,
                'timestamp': datetime.now()
            }
            
            return rate
            
        except (requests.RequestException, KeyError) as e:
            # Fallback to default rates
            if from_currency in self.default_rates and to_currency in self.default_rates[from_currency]:
                rate = self.default_rates[from_currency][to_currency]
                
                # Cache the fallback rate
                self.cache[cache_key] = {
                    'rate': rate,
                    'timestamp': datetime.now()
                }
                
                return rate
            
            raise CurrencyConversionError(f"Failed to get exchange rate for {from_currency} to {to_currency}: {e}")
    
    def convert(self, amount: float, from_currency: str, to_currency: str = 'EUR') -> float:
        """Convert amount from one currency to another"""
        if not amount or amount <= 0:
            return 0.0
        
        rate = self.get_exchange_rate(from_currency, to_currency)
        return round(amount * rate, 2)
    
    def convert_to_base_currency(self, amount: float, currency: str, base_currency: str = 'EUR') -> float:
        """Convert amount to base currency for comparison"""
        return self.convert(amount, currency, base_currency)
    
    def get_supported_currencies(self) -> list:
        """Get list of supported currencies"""
        return ['EUR', 'USD', 'GBP', 'CHF', 'SEK', 'NOK', 'DKK', 'PLN', 'CZK', 'HUF']