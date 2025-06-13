from sqlalchemy import Boolean, Column, String, Integer, ForeignKey
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class User(Base):
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    first_name = Column(String)
    last_name = Column(String)
    phone = Column(String)
    is_active = Column(Boolean(), default=True)
    is_superuser = Column(Boolean(), default=False)
    
    # Relationships
    organization_id = Column(Integer, ForeignKey("organization.id"), nullable=True)
    organization = relationship("Organization", back_populates="users")
    
    # Trip relationships
    owned_trips = relationship("Trip", back_populates="owner", foreign_keys="[Trip.owner_id]")
    trips_as_traveler = relationship("Trip", secondary="trip_traveler", back_populates="travelers")
    trips_as_arranger = relationship("Trip", secondary="trip_arranger", back_populates="arrangers")
    trips_as_booker = relationship("Trip", secondary="trip_booker", back_populates="bookers")
    
    @property
    def full_name(self) -> str:
        """
        Returns the user's full name
        """
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        if self.first_name:
            return self.first_name
        return ""
