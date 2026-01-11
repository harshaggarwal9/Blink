from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class MessageCreate(BaseModel):
    text: Optional[str] = None
    image: Optional[str] = None


class MessageRead(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    text: Optional[str]
    image: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
