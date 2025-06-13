from sqlalchemy import Boolean, Column, String, Integer, Text
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class Organization(Base):
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    contact_email = Column(String, nullable=True)
    contact_phone = Column(String, nullable=True)
    logo_url = Column(String, nullable=True)
    primary_color = Column(String, nullable=True)
    secondary_color = Column(String, nullable=True)
    is_active = Column(Boolean(), default=True)
    
    # Relationships
    users = relationship("User", back_populates="organization")
    trips = relationship("Trip", back_populates="organization")
    # travel_policies = relationship("TravelPolicy", back_populates="organization")
    
    def __repr__(self):
        return f"<Organization {self.name}>"
