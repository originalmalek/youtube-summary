"""
Migration script to add user_type field to existing users
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from utils.config import settings
from models.models import UserType


async def migrate_users():
    """Add user_type field to all existing users"""
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.DATABASE_NAME]
    users_collection = db['users']
    
    # Update all users without user_type field
    result = await users_collection.update_many(
        {'user_type': {'$exists': False}},
        {'$set': {'user_type': UserType.free.value}}
    )
    
    print(f"Updated {result.modified_count} users with user_type='free'")
    
    # Count users by type
    free_count = await users_collection.count_documents({'user_type': UserType.free.value})
    premium_count = await users_collection.count_documents({'user_type': UserType.premium.value})
    
    print(f"Total users by type:")
    print(f"  Free: {free_count}")
    print(f"  Premium: {premium_count}")
    
    client.close()


if __name__ == "__main__":
    asyncio.run(migrate_users())