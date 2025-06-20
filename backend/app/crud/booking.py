from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.booking import Booking
from app.crud.base import CRUDBase


class CRUDBooking(CRUDBase[Booking, Dict[str, Any], Dict[str, Any]]):
    def create_booking(
        self,
        db: Session,
        *,
        junction_booking_id: str,
        trip_id: int,
        user_id: int,
        organization_id: int,
        total_amount: str,
        currency: str = "EUR",
        junction_response: Dict[str, Any],
        passengers_data: List[Dict[str, Any]],
        trips_data: List[Dict[str, Any]],
        price_breakdown: List[Dict[str, Any]] = None,
        fulfillment_info: List[Dict[str, Any]] = None,
    ) -> Booking:
        db_obj = Booking(
            junction_booking_id=junction_booking_id,
            trip_id=trip_id,
            user_id=user_id,
            organization_id=organization_id,
            total_amount=total_amount,
            currency=currency,
            status="pending-payment",
            junction_response=junction_response,
            passengers_data=passengers_data,
            trips_data=trips_data,
            price_breakdown=price_breakdown or [],
            fulfillment_info=fulfillment_info or [],
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_by_junction_id(self, db: Session, *, junction_booking_id: str) -> Optional[Booking]:
        return db.query(Booking).filter(Booking.junction_booking_id == junction_booking_id).first()

    def get_by_trip_id(self, db: Session, *, trip_id: int) -> List[Booking]:
        return db.query(Booking).filter(Booking.trip_id == trip_id).all()

    def get_by_user_id(self, db: Session, *, user_id: int) -> List[Booking]:
        return db.query(Booking).filter(Booking.user_id == user_id).all()

    def update_status(
        self, db: Session, *, booking_id: int, status: str
    ) -> Optional[Booking]:
        booking = db.query(Booking).filter(Booking.id == booking_id).first()
        if booking:
            booking.status = status
            db.commit()
            db.refresh(booking)
        return booking

    def update_ticket_info(
        self,
        db: Session,
        *,
        booking_id: int,
        confirmation_number: str = None,
        ticket_url: str = None,
        collection_reference: str = None,
        delivery_option: str = None,
    ) -> Optional[Booking]:
        booking = db.query(Booking).filter(Booking.id == booking_id).first()
        if booking:
            if confirmation_number:
                booking.confirmation_number = confirmation_number
            if ticket_url:
                booking.ticket_url = ticket_url
            if collection_reference:
                booking.collection_reference = collection_reference
            if delivery_option:
                booking.delivery_option = delivery_option
            db.commit()
            db.refresh(booking)
        return booking


booking = CRUDBooking(Booking)