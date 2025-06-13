from typing import Any, Dict, Optional, Union, List

from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models.organization import Organization
from app.schemas.organization import OrganizationCreate, OrganizationUpdate


class CRUDOrganization(CRUDBase[Organization, OrganizationCreate, OrganizationUpdate]):
    def get_by_name(self, db: Session, *, name: str) -> Optional[Organization]:
        return db.query(Organization).filter(Organization.name == name).first()

    def create_with_owner(
        self, db: Session, *, obj_in: OrganizationCreate, owner_id: int
    ) -> Organization:
        db_obj = Organization(
            name=obj_in.name,
            description=obj_in.description,
            contact_email=obj_in.contact_email,
            contact_phone=obj_in.contact_phone,
            logo_url=obj_in.logo_url,
            primary_color=obj_in.primary_color,
            secondary_color=obj_in.secondary_color,
            is_active=obj_in.is_active,
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_multi_by_owner(
        self, db: Session, *, owner_id: int, skip: int = 0, limit: int = 100
    ) -> List[Organization]:
        # In a real application, you would filter by owner_id
        # For now, we'll just return all organizations
        return db.query(Organization).offset(skip).limit(limit).all()


organization = CRUDOrganization(Organization)
