from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, Boolean, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class Shot(Base):
    __tablename__ = "shots"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    game_id = Column(Integer, ForeignKey("games.id"), nullable=False)

    # Shot parameters
    angle = Column(Float, nullable=False)  # Launch angle in degrees
    power = Column(Float, nullable=False)  # Power (0-1)
    release_x = Column(Float, nullable=False)  # Release position X
    release_y = Column(Float, nullable=False)  # Release position Y

    # Shot result
    made = Column(Boolean, nullable=False)
    shot_type = Column(String, nullable=True)  # swish, rim_in, backboard, miss
    distance = Column(Float, nullable=True)  # Distance from hoop center

    # Trajectory data for replay
    trajectory = Column(JSON, nullable=True)  # Array of {x, y, t} points

    # Metadata
    shot_number = Column(Integer, nullable=False)  # Shot number in the game
    timestamp = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="shots")
    game = relationship("Game", back_populates="shots")
