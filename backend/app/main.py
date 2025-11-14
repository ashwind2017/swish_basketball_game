from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base
from app.routers import users, games, shots, leaderboard

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Swish API",
    description="Free throw basketball game API",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(users.router)
app.include_router(games.router)
app.include_router(shots.router)
app.include_router(leaderboard.router)


@app.get("/")
def read_root():
    return {
        "message": "Welcome to Swish API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}
