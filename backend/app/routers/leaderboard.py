from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from typing import List
from app.core.database import get_db
from app.models.game import Game
from app.models.user import User
from app.schemas.leaderboard import LeaderboardResponse, LeaderboardEntry

router = APIRouter(prefix="/leaderboard", tags=["leaderboard"])


@router.get("/{game_mode}", response_model=LeaderboardResponse)
def get_leaderboard(
    game_mode: str,
    difficulty: str = "medium",
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get leaderboard for a specific game mode and difficulty"""
    # Query top scores
    top_games = (
        db.query(Game, User)
        .join(User, Game.user_id == User.id)
        .filter(Game.game_mode == game_mode)
        .filter(Game.difficulty == difficulty)
        .filter(Game.completed == True)
        .order_by(desc(Game.score))
        .limit(limit)
        .all()
    )

    entries = []
    for rank, (game, user) in enumerate(top_games, start=1):
        entries.append(
            LeaderboardEntry(
                rank=rank,
                username=user.username,
                score=game.score,
                accuracy=game.accuracy,
                game_mode=game.game_mode,
                difficulty=game.difficulty,
                shots_made=game.shots_made,
                shots_taken=game.shots_taken,
                max_streak=game.max_streak
            )
        )

    return LeaderboardResponse(
        game_mode=game_mode,
        difficulty=difficulty,
        entries=entries
    )


@router.get("/global/top-players")
def get_top_players(limit: int = 50, db: Session = Depends(get_db)):
    """Get top players overall by total score"""
    top_users = (
        db.query(User)
        .order_by(desc(User.total_score))
        .limit(limit)
        .all()
    )

    return [
        {
            "rank": rank,
            "username": user.username,
            "total_score": user.total_score,
            "total_games": user.total_games,
            "accuracy": user.accuracy,
            "best_streak": user.best_streak
        }
        for rank, user in enumerate(top_users, start=1)
    ]
