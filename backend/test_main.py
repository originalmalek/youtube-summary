from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr

app = FastAPI(title='YouTube Summary API - Test Version')

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:3000'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

class UserCreate(BaseModel):
    username: EmailStr
    password: str

class RegisterResponse(BaseModel):
    confirm_url: str

@app.get('/')
async def root():
    return {'message': 'YouTube Summary API is running'}

@app.post('/auth/register', response_model=RegisterResponse)
async def register(user: UserCreate):
    # Simple test response
    return {
        'confirm_url': f'http://localhost:3000/verify-email/test-token-for-{user.username}'
    }

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=8000)