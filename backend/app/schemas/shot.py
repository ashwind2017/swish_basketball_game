from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime


class ShotCreate(BaseModel):
    game_id: int
    angle: float
    power: float
    release_x: float
    release_y: float
    made: bool
    shot_type: Optional[str] = None
    distance: Optional[float] = None
    trajectory: Optional[List[Dict[str, float]]] = None
    shot_number: int


class ShotResponse(BaseModel):
    id: int
    user_id: int
    game_id: int
    angle: float
    power: float
    release_x: float
    release_y: float
    made: bool
    shot_type: Optional[str]
    distance: Optional[float]
    shot_number: int
    timestamp: datetime

    class Config:
        from_attributes = True


class ShotWithTrajectory(ShotResponse):
    trajectory: Optional[List[Dict[str, float]]]
