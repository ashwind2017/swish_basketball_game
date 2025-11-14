from sqlalchemy import Column, Integer, String, DateTime, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=True)
    hashed_password = Column(String, nullable=True)  # Optional for quick play
    created_at = Column(DateTime, default=datetime.utcnow)

    # Stats
    total_games = Column(Integer, default=0)
    total_shots = Column(Integer, default=0)
    total_makes = Column(Integer, default=0)
    best_streak = Column(Integer, default=0)
    total_score = Column(Integer, default=0)

    # Relationships
    games = relationship("Game", back_populates="user", cascade="all, delete-orphan")
    shots = relationship("Shot", back_populates="user", cascade="all, delete-orphan")

    @property
    def accuracy(self) -> float:
        if self.total_shots == 0:
            return 0.0
        return round((self.total_makes / self.total_shots) * 100, 2)
