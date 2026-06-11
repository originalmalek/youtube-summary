from motor.motor_asyncio import AsyncIOMotorClient
from .config import settings

# Global variables for database connection
client: AsyncIOMotorClient = None
db = None
users_collection = None
summaries_collection = None

def init_database():
    '''Initialize database connection'''
    global client, db, users_collection, summaries_collection

    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.DATABASE_NAME]
    users_collection = db['users']
    summaries_collection = db['summaries']


def get_users_collection():
    '''Get users collection'''
    return users_collection


def get_database():
    '''Get database instance'''
    return db


async def get_user_by_username(username: str):
    '''Get user by username'''
    return await users_collection.find_one({'username': username})


async def get_user_by_id(user_id: str):
    '''Get user by ID'''
    from bson import ObjectId
    try:
        return await users_collection.find_one({'_id': ObjectId(user_id)})
    except Exception:
        return None


async def connect_to_mongo():
    '''Connect to MongoDB on application startup'''
    init_database()
    # Test the connection
    try:
        await client.admin.command('ping')
        print('✅ Successfully connected to MongoDB')
    except Exception as e:
        print(f'❌ Error connecting to MongoDB: {e}')

async def close_mongo_connection():
    '''Close MongoDB connection on application shutdown'''
    if client:
        client.close()
        print('✅ MongoDB connection closed')


def get_summaries_collection():
    '''Get summaries collection'''
    return summaries_collection


async def create_summary_record(summary_data: dict):
    '''Create a summary record'''
    from datetime import datetime, timezone
    from models.models import SummaryStatus
    
    summary_data['created_at'] = datetime.now(timezone.utc)
    # Ensure status field is present with default value
    if 'status' not in summary_data:
        summary_data['status'] = SummaryStatus.active
    
    result = await summaries_collection.insert_one(summary_data)
    return str(result.inserted_id)


async def get_user_summaries(user_id: str, limit: int = 20, status: str = 'active', offset: int = 0):
    '''Get user summaries by status with pagination (excluding deleted)'''
    # Simple query - just filter by user_id and status
    query = {'user_id': user_id, 'status': status}
    
    cursor = summaries_collection.find(query).sort('created_at', -1).skip(offset).limit(limit)
    summaries = []
    async for summary in cursor:
        summary['id'] = str(summary['_id'])
        del summary['_id']
        summaries.append(summary)
    return summaries


async def get_user_summaries_count(user_id: str, status: str = 'active'):
    '''Get count of user summaries by status'''
    query = {'user_id': user_id, 'status': status}
    return await summaries_collection.count_documents(query)


async def get_summary_by_id(summary_id: str, include_deleted: bool = False):
    '''Get summary by ID (excluding deleted by default)'''
    from bson import ObjectId
    try:
        query = {'_id': ObjectId(summary_id)}
        if not include_deleted:
            query['status'] = {'$ne': 'deleted'}
        
        summary = await summaries_collection.find_one(query)
        if summary:
            summary['id'] = str(summary['_id'])
            del summary['_id']
            return summary
    except Exception:
        return None


async def update_summary_status(summary_id: str, new_status: str):
    '''Update summary status'''
    from bson import ObjectId
    try:
        result = await summaries_collection.update_one(
            {'_id': ObjectId(summary_id)},
            {'$set': {'status': new_status}}
        )
        return result.modified_count > 0
    except Exception:
        return False


async def enable_summary_sharing(summary_id: str, share_id: str):
    '''Enable sharing for a summary with unique share_id'''
    from bson import ObjectId
    try:
        result = await summaries_collection.update_one(
            {'_id': ObjectId(summary_id)},
            {'$set': {'is_shared': True, 'share_id': share_id}}
        )
        return result.modified_count > 0
    except Exception:
        return False


async def disable_summary_sharing(summary_id: str):
    '''Disable sharing for a summary'''
    from bson import ObjectId
    try:
        result = await summaries_collection.update_one(
            {'_id': ObjectId(summary_id)},
            {'$set': {'is_shared': False}, '$unset': {'share_id': ''}}
        )
        return result.modified_count > 0
    except Exception:
        return False


async def get_summary_by_share_id(share_id: str):
    '''Get a shared summary by share_id'''
    try:
        summary = await summaries_collection.find_one({
            'share_id': share_id,
            'is_shared': True,
            'status': {'$ne': 'deleted'}
        })
        if summary:
            summary['id'] = str(summary['_id'])
            del summary['_id']
            return summary
        return None
    except Exception:
        return None
