from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime


class GameCreate(BaseModel):
    game_mode: str  # classic, time_attack, streak, distance
    difficulty: str = "medium"


class GameUpdate(BaseModel):
    score: Optional[int] = None
    shots_taken: Optional[int] = None
    shots_made: Optional[int] = None
    streak: Optional[int] = None
    max_streak: Optional[int] = None
    duration: Optional[float] = None
    completed: Optional[bool] = None
    game_data: Optional[Dict[str, Any]] = None


class GameResponse(BaseModel):
    id: int
    user_id: int
    game_mode: str
    score: int
    shots_taken: int
    shots_made: int
    streak: int
    max_streak: int
    duration: Optional[float]
    difficulty: str
    completed: bool
    accuracy: float
    created_at: datetime

    class Config:
        from_attributes = True


class GameWithShots(GameResponse):
    shots: List["ShotResponse"]


# Import here to avoid circular dependency
from .shot import ShotResponse
GameWithShots.model_rebuild()
