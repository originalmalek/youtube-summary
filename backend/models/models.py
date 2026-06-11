from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional
from enum import Enum


class UserType(str, Enum):
    free = 'free'
    premium = 'premium'
    premium_plus = 'premium_plus'


class UserCreate(BaseModel):
    username: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    refresh_token: str


class RefreshRequest(BaseModel):
    refresh_token: str


class RegisterResponse(BaseModel):
    confirm_url: str
    email_task_id: str


class ResendEmailRequest(BaseModel):
    username: EmailStr


class PasswordResetRequest(BaseModel):
    username: EmailStr


class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str


class SummaryType(str, Enum):
    youtube = 'youtube'
    file = 'file'
    text = 'text'


class SummaryStatus(str, Enum):
    active = 'active'
    archived = 'archived'
    deleted = 'deleted'


class SummaryFormat(str, Enum):
    standard = 'standard'
    bullets = 'bullets'
    takeaways = 'takeaways'
    executive = 'executive'
    qa = 'qa'
    action_items = 'action_items'
    pros_cons = 'pros_cons'
    timeline = 'timeline'
    study_guide = 'study_guide'


class SummaryBase(BaseModel):
    summary_type: SummaryType
    source_url: Optional[str] = None
    source_content: str
    summary_text: str
    language: str = 'English'
    format_type: SummaryFormat = SummaryFormat.standard
    status: SummaryStatus = SummaryStatus.active


class SummaryCreate(SummaryBase):
    user_id: str


class SummaryResponse(SummaryBase):
    id: str
    user_id: str
    created_at: datetime
    is_shared: bool = False
    share_id: Optional[str] = None
    
    class Config:
        from_attributes = True


class TextSummaryRequest(BaseModel):
    text: str
    language: str = 'English'
    format_type: SummaryFormat = SummaryFormat.standard


class ShareResponse(BaseModel):
    share_url: str
    share_id: str


class SharedSummaryResponse(BaseModel):
    summary_text: str
    summary_type: SummaryType
    format_type: SummaryFormat = SummaryFormat.standard
    language: str = 'English'
    created_at: datetime
    source_url: Optional[str] = None