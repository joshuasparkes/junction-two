from typing import Optional, List

from pydantic import BaseModel, EmailStr


# Shared properties
class OrganizationBase(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None
    logo_url: Optional[str] = None
    primary_color: Optional[str] = None
    secondary_color: Optional[str] = None
    is_active: Optional[bool] = True


# Properties to receive via API on creation
class OrganizationCreate(OrganizationBase):
    name: str


# Properties to receive via API on update
class OrganizationUpdate(OrganizationBase):
    pass


class OrganizationInDBBase(OrganizationBase):
    id: Optional[int] = None

    class Config:
        from_attributes = True


# Additional properties to return via API
class Organization(OrganizationInDBBase):
    pass


# Additional properties stored in DB
class OrganizationInDB(OrganizationInDBBase):
    pass
