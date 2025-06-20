from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.db.base_class import Base
from datetime import datetime


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    junction_booking_id = Column(String, unique=True, index=True, nullable=False)  # The ID from Junction API
    trip_id = Column(Integer, ForeignKey("trips.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    
    # Booking details
    status = Column(String, default="pending-payment")  # pending-payment, paid, confirmed, cancelled
    total_amount = Column(String, nullable=False)  # Store as string to preserve decimal precision
    currency = Column(String, default="EUR")
    
    # Junction API response data
    junction_response = Column(JSON)  # Store the full response from Junction API
    passengers_data = Column(JSON)  # Store passenger information
    trips_data = Column(JSON)  # Store trip segments information
    price_breakdown = Column(JSON)  # Store price breakdown
    fulfillment_info = Column(JSON)  # Store fulfillment options
    
    # Ticket information
    confirmation_number = Column(String, nullable=True)
    ticket_url = Column(String, nullable=True)
    collection_reference = Column(String, nullable=True)
    delivery_option = Column(String, nullable=True)  # eTicket, physicalTicket, stationCollection
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    booking_date = Column(DateTime, nullable=True)  # When booking was made with Junction
    
    # Relationships
    trip = relationship("Trip", back_populates="bookings")
    user = relationship("User")
    organization = relationship("Organization")