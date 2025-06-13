from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel


# Shared properties
class TripBase(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    is_active: Optional[bool] = True
    status: Optional[str] = "draft"
    organization_id: Optional[int] = None


# Properties to receive via API on creation
class TripCreate(TripBase):
    name: str
    owner_id: Optional[int] = None


# Properties to receive via API on update
class TripUpdate(TripBase):
    pass


class TripInDBBase(TripBase):
    id: Optional[int] = None
    owner_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Additional properties to return via API
class Trip(TripInDBBase):
    pass


# Additional properties stored in DB
class TripInDB(TripInDBBase):
    pass


# Schema for adding travelers to a trip
class TripTravelerCreate(BaseModel):
    trip_id: int
    user_id: int


# Schema for adding arrangers to a trip
class TripArrangerCreate(BaseModel):
    trip_id: int
    user_id: int


# Schema for adding bookers to a trip
class TripBookerCreate(BaseModel):
    trip_id: int
    user_id: int
