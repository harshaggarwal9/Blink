from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.models.user import User
from app.models.message import Message
from app.core.security import get_current_user
from app.schema.message import MessageCreate, MessageRead
from app.schema.user import UserRead

router = APIRouter(tags=["messages"])


@router.get("/users", response_model=list[UserRead])
def get_users(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    users = db.query(User).filter(User.id != current_user.id).all()
    return users


@router.get("/{user_id}", response_model=List[MessageRead])
def get_messages(user_id: int,db: Session = Depends(get_db),current_user: User = Depends(get_current_user)):
    messages = db.query(Message).filter(
            ((Message.sender_id == current_user.id) & (Message.receiver_id == user_id))
            |
            ((Message.sender_id == user_id) & (Message.receiver_id == current_user.id))).order_by(Message.created_at.asc()).all()

    return messages

@router.post("/send/{user_id}", response_model=MessageRead)
def send_message(user_id: int,message: MessageCreate,db: Session = Depends(get_db),current_user: User = Depends(get_current_user)):

    receiver = db.query(User).filter(User.id == user_id).first()
    if not receiver:
        raise HTTPException(status_code=404, detail="User not found")

    if not message.text and not message.image:
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    new_message = Message(
        sender_id=current_user.id,
        receiver_id=user_id,
        text=message.text,
        image=message.image,
    )
    db.add(new_message)
    db.commit()
    db.refresh(new_message)

    return new_message
