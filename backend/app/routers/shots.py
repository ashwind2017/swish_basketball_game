from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.shot import Shot
from app.models.game import Game
from app.schemas.shot import ShotCreate, ShotResponse, ShotWithTrajectory

router = APIRouter(prefix="/shots", tags=["shots"])


@router.post("/", response_model=ShotResponse, status_code=201)
def create_shot(shot: ShotCreate, db: Session = Depends(get_db)):
    """Record a shot"""
    # Verify game exists
    game = db.query(Game).filter(Game.id == shot.game_id).first()
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    db_shot = Shot(
        user_id=game.user_id,
        game_id=shot.game_id,
        angle=shot.angle,
        power=shot.power,
        release_x=shot.release_x,
        release_y=shot.release_y,
        made=shot.made,
        shot_type=shot.shot_type,
        distance=shot.distance,
        trajectory=shot.trajectory,
        shot_number=shot.shot_number
    )
    db.add(db_shot)
    db.commit()
    db.refresh(db_shot)
    return db_shot


@router.get("/{shot_id}", response_model=ShotWithTrajectory)
def get_shot(shot_id: int, db: Session = Depends(get_db)):
    """Get shot by ID with trajectory"""
    shot = db.query(Shot).filter(Shot.id == shot_id).first()
    if not shot:
        raise HTTPException(status_code=404, detail="Shot not found")
    return shot


@router.get("/game/{game_id}", response_model=List[ShotResponse])
def get_game_shots(game_id: int, db: Session = Depends(get_db)):
    """Get all shots for a game"""
    shots = db.query(Shot).filter(Shot.game_id == game_id).order_by(Shot.shot_number).all()
    return shots


@router.get("/user/{user_id}/chart")
def get_shot_chart(user_id: int, game_mode: str = None, db: Session = Depends(get_db)):
    """Get shot chart data for visualization"""
    query = db.query(Shot).filter(Shot.user_id == user_id)

    if game_mode:
        query = query.join(Game).filter(Game.game_mode == game_mode)

    shots = query.all()

    # Group shots by location buckets for heat map
    shot_chart = {
        "total_shots": len(shots),
        "made": sum(1 for s in shots if s.made),
        "missed": sum(1 for s in shots if not s.made),
        "by_position": []
    }

    for shot in shots:
        shot_chart["by_position"].append({
            "x": shot.release_x,
            "y": shot.release_y,
            "made": shot.made,
            "shot_type": shot.shot_type
        })

    return shot_chart
