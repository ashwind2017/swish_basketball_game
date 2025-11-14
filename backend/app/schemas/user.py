from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    username: str
    email: Optional[str] = None


class UserCreate(UserBase):
    password: Optional[str] = None


class UserResponse(UserBase):
    id: int
    created_at: datetime
    total_games: int
    total_shots: int
    total_makes: int
    best_streak: int
    total_score: int
    accuracy: float

    class Config:
        from_attributes = True


class UserStats(BaseModel):
    total_games: int
    total_shots: int
    total_makes: int
    accuracy: float
    best_streak: int
    total_score: int
