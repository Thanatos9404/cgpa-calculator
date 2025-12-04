"""
Protected routes for peer comparison data
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.models import User, Peer
from app.auth.dependencies import get_current_user
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/peers", tags=["Peers"])

class PeerCreate(BaseModel):
    name: str
    cgpa: Optional[str] = None
    semesters: Optional[list] = None

class PeerResponse(BaseModel):
    id: str
    name: str
    cgpa: Optional[str]
    semesters: Optional[list]
    created_at: str
    
    class Config:
        from_attributes = True

@router.get("", response_model=List[PeerResponse])
async def get_peers(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all peers for the current user
    """
    peers = db.query(Peer).filter(Peer.user_id == current_user.id).all()
    
    return [
        {
            "id": peer.id,
            "name": peer.name,
            "cgpa": peer.cgpa,
            "semesters": peer.semesters,
            "created_at": peer.created_at.isoformat()
        }
        for peer in peers
    ]

@router.post("", response_model=PeerResponse, status_code=status.HTTP_201_CREATED)
async def create_peer(
    peer_data: PeerCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Add a new peer for comparison
    """
    new_peer = Peer(
        user_id=current_user.id,
        name=peer_data.name,
        cgpa=peer_data.cgpa,
        semesters=peer_data.semesters
    )
    
    db.add(new_peer)
    db.commit()
    db.refresh(new_peer)
    
    return {
        "id": new_peer.id,
        "name": new_peer.name,
        "cgpa": new_peer.cgpa,
        "semesters": new_peer.semesters,
        "created_at": new_peer.created_at.isoformat()
    }

@router.delete("/{peer_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_peer(
    peer_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a peer
    """
    peer = db.query(Peer).filter(
        Peer.id == peer_id,
        Peer.user_id == current_user.id
    ).first()
    
    if not peer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Peer not found"
        )
    
    db.delete(peer)
    db.commit()
    
    return None
