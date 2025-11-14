from pydantic import BaseModel
from typing import List


class LeaderboardEntry(BaseModel):
    rank: int
    username: str
    score: int
    accuracy: float
    game_mode: str
    difficulty: str
    shots_made: int
    shots_taken: int
    max_streak: int

    class Config:
        from_attributes = True


class LeaderboardResponse(BaseModel):
    game_mode: str
    difficulty: str
    entries: List[LeaderboardEntry]
