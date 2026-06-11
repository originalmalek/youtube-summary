"""
Migration: Add usage limits fields to existing users
Run this script once to update all existing users with the new usage limit fields
"""

import asyncio
from datetime import datetime, timedelta
import sys
from pathlib import Path

# Add parent directory to path so we can import from backend
sys.path.insert(0, str(Path(__file__).parent.parent))

from motor.motor_asyncio import AsyncIOMotorClient
from utils.config import settings
from utils.subscription_plans import SUBSCRIPTION_PLANS


async def migrate_users():
    """Add usage limit fields to all existing users"""

    # Connect to MongoDB
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.DATABASE_NAME]
    users_collection = db['users']

    print("Starting migration: Adding usage limits to existing users...")

    # Get all users
    users_cursor = users_collection.find({})
    users = await users_cursor.to_list(length=None)

    print(f"Found {len(users)} users to migrate")

    updated_count = 0
    skipped_count = 0

    for user in users:
        user_id = str(user['_id'])

        # Skip if user already has the new fields
        if 'summaries_limit' in user:
            print(f"  Skipping user {user.get('username', user_id)}: already has usage limits")
            skipped_count += 1
            continue

        # Get user's plan type
        user_type = user.get('user_type', 'free')

        # Get limit for this plan
        plan = SUBSCRIPTION_PLANS.get(user_type, SUBSCRIPTION_PLANS['free'])
        limit = plan['features']['summaries_per_month']

        # Determine reset date
        created_at = user.get('created_at', datetime.utcnow())

        # For paid users, check if they have an active subscription
        # If yes, use subscription start date, otherwise use creation date
        if user_type != 'free':
            # Check subscriptions collection
            subscriptions_collection = db['subscriptions']
            subscription = await subscriptions_collection.find_one({
                'user_id': user_id,
                'status': 'active'
            })

            if subscription:
                reset_date = subscription['current_period_end']
                print(f"  Using subscription period end for user {user.get('username', user_id)}")
            else:
                # No active subscription, use registration date + 30 days
                reset_date = created_at + timedelta(days=30)
                print(f"  Using registration date + 30 days for user {user.get('username', user_id)}")
        else:
            # Free user: use registration date + 30 days
            reset_date = created_at + timedelta(days=30)

        # Update user document
        result = await users_collection.update_one(
            {'_id': user['_id']},
            {
                '$set': {
                    'summaries_used': 0,  # Start fresh
                    'summaries_limit': limit,
                    'limit_reset_date': reset_date
                }
            }
        )

        if result.modified_count > 0:
            print(f"  ✓ Updated user {user.get('username', user_id)}: limit={limit}, reset={reset_date.strftime('%Y-%m-%d')}")
            updated_count += 1
        else:
            print(f"  ✗ Failed to update user {user.get('username', user_id)}")

    print(f"\nMigration complete!")
    print(f"  Updated: {updated_count} users")
    print(f"  Skipped: {skipped_count} users (already migrated)")
    print(f"  Total: {len(users)} users")

    # Close connection
    client.close()


if __name__ == '__main__':
    print("=" * 60)
    print("USAGE LIMITS MIGRATION")
    print("=" * 60)
    print()
    print("This script will add the following fields to all users:")
    print("  - summaries_used: 0")
    print("  - summaries_limit: based on user_type")
    print("  - limit_reset_date: based on subscription or registration")
    print()

    confirm = input("Do you want to proceed? (yes/no): ")

    if confirm.lower() in ['yes', 'y']:
        asyncio.run(migrate_users())
    else:
        print("Migration cancelled.")
