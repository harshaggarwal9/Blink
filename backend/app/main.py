from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.base import Base
from app.db.session import engine
from app.routes import auth, message, ws

app = FastAPI(title="Chat App",version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://blinkf.onrender.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)


app.include_router(auth.router, prefix="/api/auth")
app.include_router(message.router, prefix="/api/messages")
app.include_router(ws.router)

@app.get("/")
def root():
    return {"status": "FastAPI Chat Server is running 🚀"}
