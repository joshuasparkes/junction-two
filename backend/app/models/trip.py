from datetime import datetime
from sqlalchemy import Boolean, Column, String, Integer, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class Trip(Base):
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean(), default=True)
    
    # Status can be: draft, pending_approval, approved, rejected, cancelled, completed
    status = Column(String, default="draft")
    
    # Relationships
    organization_id = Column(Integer, ForeignKey("organization.id"), nullable=True)
    organization = relationship("Organization", back_populates="trips")
    
    owner_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    owner = relationship("User", back_populates="owned_trips", foreign_keys=[owner_id])
    
    # Many-to-many relationship with travelers (users)
    travelers = relationship(
        "User",
        secondary="trip_traveler",
        back_populates="trips_as_traveler"
    )
    
    # Many-to-many relationship with arrangers (users)
    arrangers = relationship(
        "User",
        secondary="trip_arranger",
        back_populates="trips_as_arranger"
    )
    
    # Many-to-many relationship with bookers (users)
    bookers = relationship(
        "User",
        secondary="trip_booker",
        back_populates="trips_as_booker"
    )
    
    # One-to-many relationship with bookings
    # flight_bookings = relationship("FlightBooking", back_populates="trip")
    # hotel_bookings = relationship("HotelBooking", back_populates="trip")
    # car_bookings = relationship("CarBooking", back_populates="trip")
    # train_bookings = relationship("TrainBooking", back_populates="trip")
    
    def __repr__(self):
        return f"<Trip {self.name}>"


# Association tables for many-to-many relationships
class TripTraveler(Base):
    __tablename__ = "trip_traveler"
    
    trip_id = Column(Integer, ForeignKey("trip.id"), primary_key=True)
    user_id = Column(Integer, ForeignKey("user.id"), primary_key=True)


class TripArranger(Base):
    __tablename__ = "trip_arranger"
    
    trip_id = Column(Integer, ForeignKey("trip.id"), primary_key=True)
    user_id = Column(Integer, ForeignKey("user.id"), primary_key=True)


class TripBooker(Base):
    __tablename__ = "trip_booker"
    
    trip_id = Column(Integer, ForeignKey("trip.id"), primary_key=True)
    user_id = Column(Integer, ForeignKey("user.id"), primary_key=True)
