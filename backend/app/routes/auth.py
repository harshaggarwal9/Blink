from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from typing import Annotated

from app.db.session import get_db
from app.models.user import User
from app.schema.user import UserCreate
from app.schema.token import Token
from app.core.security import hash_password, verify_password, create_access_token

router = APIRouter(tags=["auth"])

db_dep = Annotated[Session, Depends(get_db)]


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(user: UserCreate, db: db_dep):
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    db_user = User(
        email=user.email,
        full_name=user.full_name,
        hashed_password=hash_password(user.password),
        profile_pic=user.profile_pic,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return {"message": "User registered successfully"}


@router.post("/token", response_model=Token)
def login(db: db_dep,form_data: Annotated[OAuth2PasswordRequestForm, Depends()]):
    user = db.query(User).filter(User.email == form_data.username).first()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token(
        email=user.email,
        user_id=user.id,
        role="user",
    )

    return {"access_token": access_token,"token_type": "bearer"}
