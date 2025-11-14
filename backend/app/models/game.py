from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, Boolean, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class Game(Base):
    __tablename__ = "games"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    game_mode = Column(String, nullable=False)  # classic, time_attack, streak, distance
    score = Column(Integer, default=0)
    shots_taken = Column(Integer, default=0)
    shots_made = Column(Integer, default=0)
    streak = Column(Integer, default=0)
    max_streak = Column(Integer, default=0)
    duration = Column(Float, nullable=True)  # Duration in seconds for time attack
    difficulty = Column(String, default="medium")  # easy, medium, hard
    completed = Column(Boolean, default=False)
    game_data = Column(JSON, nullable=True)  # Store additional game state
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="games")
    shots = relationship("Shot", back_populates="game", cascade="all, delete-orphan")

    @property
    def accuracy(self) -> float:
        if self.shots_taken == 0:
            return 0.0
        return round((self.shots_made / self.shots_taken) * 100, 2)
