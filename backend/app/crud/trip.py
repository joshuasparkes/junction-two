from typing import Any, Dict, Optional, Union, List

from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models.trip import Trip, TripTraveler, TripArranger, TripBooker
from app.schemas.trip import TripCreate, TripUpdate


class CRUDTrip(CRUDBase[Trip, TripCreate, TripUpdate]):
    def create_with_owner(
        self, db: Session, *, obj_in: TripCreate, owner_id: int
    ) -> Trip:
        obj_in_data = obj_in.dict()
        if obj_in.owner_id is None:
            obj_in_data["owner_id"] = owner_id
        db_obj = Trip(**obj_in_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_multi_by_owner(
        self, db: Session, *, owner_id: int, skip: int = 0, limit: int = 100
    ) -> List[Trip]:
        return (
            db.query(self.model)
            .filter(Trip.owner_id == owner_id)
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_multi_by_organization(
        self, db: Session, *, organization_id: int, skip: int = 0, limit: int = 100
    ) -> List[Trip]:
        return (
            db.query(self.model)
            .filter(Trip.organization_id == organization_id)
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def add_traveler(self, db: Session, *, trip_id: int, user_id: int) -> TripTraveler:
        db_obj = TripTraveler(trip_id=trip_id, user_id=user_id)
        db.add(db_obj)
        db.commit()
        return db_obj
    
    def remove_traveler(self, db: Session, *, trip_id: int, user_id: int) -> None:
        db_obj = db.query(TripTraveler).filter(
            TripTraveler.trip_id == trip_id,
            TripTraveler.user_id == user_id
        ).first()
        if db_obj:
            db.delete(db_obj)
            db.commit()
    
    def add_arranger(self, db: Session, *, trip_id: int, user_id: int) -> TripArranger:
        db_obj = TripArranger(trip_id=trip_id, user_id=user_id)
        db.add(db_obj)
        db.commit()
        return db_obj
    
    def remove_arranger(self, db: Session, *, trip_id: int, user_id: int) -> None:
        db_obj = db.query(TripArranger).filter(
            TripArranger.trip_id == trip_id,
            TripArranger.user_id == user_id
        ).first()
        if db_obj:
            db.delete(db_obj)
            db.commit()
    
    def add_booker(self, db: Session, *, trip_id: int, user_id: int) -> TripBooker:
        db_obj = TripBooker(trip_id=trip_id, user_id=user_id)
        db.add(db_obj)
        db.commit()
        return db_obj
    
    def remove_booker(self, db: Session, *, trip_id: int, user_id: int) -> None:
        db_obj = db.query(TripBooker).filter(
            TripBooker.trip_id == trip_id,
            TripBooker.user_id == user_id
        ).first()
        if db_obj:
            db.delete(db_obj)
            db.commit()


trip = CRUDTrip(Trip)
