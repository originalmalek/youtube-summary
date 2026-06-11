import asyncio
import aiohttp
import json

async def test_text_summary():
    # Test text - should be more than 100 characters
    test_text = '''
    Artificial Intelligence (AI) is rapidly transforming various industries and aspects of our daily lives. 
    From healthcare to transportation, AI systems are being deployed to solve complex problems and improve 
    efficiency. Machine learning algorithms can now diagnose diseases, predict weather patterns, and even 
    compose music. However, this technological advancement also raises important ethical questions about 
    privacy, job displacement, and the need for responsible AI development. As we move forward, it's 
    crucial to balance innovation with careful consideration of AI's societal impact.
    '''
    
    # First, we need to login to get auth token
    async with aiohttp.ClientSession() as session:
        # Login (you'll need valid credentials)
        login_data = {
            'username': 'test@example.com',  # Replace with valid credentials
            'password': 'testpassword'       # Replace with valid credentials
        }
        
        try:
            # Login endpoint
            async with session.post(
                'http://localhost:8001/auth/login',
                json=login_data
            ) as response:
                if response.status == 200:
                    auth_data = await response.json()
                    access_token = auth_data['access_token']
                    print('✓ Login successful')
                else:
                    print(f'✗ Login failed: {await response.text()}')
                    return
            
            # Test text summary endpoint
            headers = {
                'Authorization': f'Bearer {access_token}'
            }
            
            summary_data = {
                'text': test_text.strip(),
                'language': 'English'
            }
            
            async with session.post(
                'http://localhost:8001/summary/summary_text',
                json=summary_data,
                headers=headers
            ) as response:
                if response.status == 200:
                    result = await response.json()
                    print(f'✓ Text summary task created: {result}')
                    
                    # Check task status
                    task_id = result['task_id']
                    await asyncio.sleep(5)  # Wait for processing
                    
                    async with session.get(
                        f'http://localhost:8001/summary/task/{task_id}/status',
                        headers=headers
                    ) as status_response:
                        if status_response.status == 200:
                            status = await status_response.json()
                            print(f'✓ Task status: {json.dumps(status, indent=2)}')
                        else:
                            print(f'✗ Failed to get task status: {await status_response.text()}')
                            
                else:
                    print(f'✗ Text summary failed: {await response.text()}')
                    
        except Exception as e:
            print(f'✗ Error: {str(e)}')

if __name__ == '__main__':
    asyncio.run(test_text_summary())