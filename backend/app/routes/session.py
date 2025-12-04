"""
Protected routes for user session data
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.models import User, UserSession
from app.auth.dependencies import get_current_user
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/session", tags=["Session"])

class SessionData(BaseModel):
    session_data: dict

class SessionResponse(BaseModel):
    id: str
    session_data: dict
    updated_at: str
    
    class Config:
        from_attributes = True

@router.get("", response_model=Optional[SessionResponse])
async def get_session(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get user's CGPA session data
    """
    session = db.query(UserSession).filter(
        UserSession.user_id == current_user.id
    ).first()
    
    if not session:
        return None
    
    return {
        "id": session.id,
        "session_data": session.session_data,
        "updated_at": session.updated_at.isoformat()
    }

@router.post("", response_model=SessionResponse, status_code=status.HTTP_200_OK)
async def save_session(
    data: SessionData,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Save or update user's CGPA session data
    """
    # Check if session exists
    session = db.query(UserSession).filter(
        UserSession.user_id == current_user.id
    ).first()
    
    if session:
        # Update existing session
        session.session_data = data.session_data
        from datetime import datetime
        session.updated_at = datetime.utcnow()
    else:
        # Create new session
        session = UserSession(
            user_id=current_user.id,
            session_data=data.session_data
        )
        db.add(session)
    
    db.commit()
    db.refresh(session)
    
    return {
        "id": session.id,
        "session_data": session.session_data,
        "updated_at": session.updated_at.isoformat()
    }

@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
async def delete_session(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete user's CGPA session data
    """
    session = db.query(UserSession).filter(
        UserSession.user_id == current_user.id
    ).first()
    
    if session:
        db.delete(session)
        db.commit()
    
    return None
