"""
Subscription plans configuration for payment system
Centralized configuration for pricing, features, and limits
"""

SUBSCRIPTION_PLANS = {
    'free': {
        'name': 'Free',
        'price': 0,
        'currency': 'EUR',
        'interval': 'month',
        'recurring': False,
        'features': {
            'summaries_per_month': 5,
            'formats': ['standard', 'bullets', 'takeaways'],
            'max_file_size_mb': 1,
            'priority_support': False
        }
    },
    'monthly_basic_eur': {
        'name': 'Basic Monthly',
        'price': 15,
        'currency': 'EUR',
        'interval': 'month',
        'recurring': True,
        'features': {
            'summaries_per_month': 200,
            'formats': 'all',
            'max_file_size_mb': 10,
            'priority_support': False
        }
    },
    'monthly_premium_eur': {
        'name': 'Premium Monthly',
        'price': 30,
        'currency': 'EUR',
        'interval': 'month',
        'recurring': True,
        'features': {
            'summaries_per_month': 1000,
            'formats': 'all',
            'max_file_size_mb': 50,
            'priority_support': True,
            'api_access': True
        }
    },
    'yearly_basic_eur': {
        'name': 'Basic Yearly',
        'price': 120,  # Discount from €15×12=€180
        'currency': 'EUR',
        'interval': 'year',
        'recurring': True,
        'features': {
            'summaries_per_month': 200,
            'formats': 'all',
            'max_file_size_mb': 10,
            'priority_support': False
        }
    },
    'yearly_premium_eur': {
        'name': 'Premium Yearly',
        'price': 240,  # Discount from €30×12=€360
        'currency': 'EUR',
        'interval': 'year',
        'recurring': True,
        'features': {
            'summaries_per_month': 1000,
            'formats': 'all',
            'max_file_size_mb': 50,
            'priority_support': True,
            'api_access': True
        }
    }
}
