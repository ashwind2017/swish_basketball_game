from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List
from app.core.database import get_db
from app.models.game import Game
from app.models.user import User
from app.schemas.game import GameCreate, GameUpdate, GameResponse, GameWithShots

router = APIRouter(prefix="/games", tags=["games"])


@router.post("/", response_model=GameResponse, status_code=201)
def create_game(game: GameCreate, user_id: int, db: Session = Depends(get_db)):
    """Start a new game"""
    # Verify user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db_game = Game(
        user_id=user_id,
        game_mode=game.game_mode,
        difficulty=game.difficulty
    )
    db.add(db_game)
    db.commit()
    db.refresh(db_game)
    return db_game


@router.get("/{game_id}", response_model=GameWithShots)
def get_game(game_id: int, db: Session = Depends(get_db)):
    """Get game by ID with all shots"""
    game = db.query(Game).filter(Game.id == game_id).first()
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    return game


@router.patch("/{game_id}", response_model=GameResponse)
def update_game(game_id: int, game_update: GameUpdate, db: Session = Depends(get_db)):
    """Update game state"""
    game = db.query(Game).filter(Game.id == game_id).first()
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    # Update fields
    for field, value in game_update.model_dump(exclude_unset=True).items():
        setattr(game, field, value)

    # If game is completed, update user stats
    if game_update.completed and not game.completed:
        user = game.user
        user.total_games += 1
        user.total_shots += game.shots_taken
        user.total_makes += game.shots_made
        user.total_score += game.score
        if game.max_streak > user.best_streak:
            user.best_streak = game.max_streak

    db.commit()
    db.refresh(game)
    return game


@router.get("/user/{user_id}", response_model=List[GameResponse])
def get_user_games(
    user_id: int,
    game_mode: str = None,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """Get all games for a user"""
    query = db.query(Game).filter(Game.user_id == user_id)

    if game_mode:
        query = query.filter(Game.game_mode == game_mode)

    games = query.order_by(desc(Game.created_at)).limit(limit).all()
    return games


@router.delete("/{game_id}")
def delete_game(game_id: int, db: Session = Depends(get_db)):
    """Delete a game"""
    game = db.query(Game).filter(Game.id == game_id).first()
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    db.delete(game)
    db.commit()
    return {"message": "Game deleted successfully"}
