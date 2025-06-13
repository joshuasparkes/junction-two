from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps

router = APIRouter()


@router.get("/", response_model=List[schemas.Organization])
def read_organizations(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve organizations.
    """
    if crud.user.is_superuser(current_user):
        organizations = crud.organization.get_multi(db, skip=skip, limit=limit)
    else:
        organizations = crud.organization.get_multi_by_owner(
            db=db, owner_id=current_user.id, skip=skip, limit=limit
        )
    return organizations


@router.post("/", response_model=schemas.Organization)
def create_organization(
    *,
    db: Session = Depends(deps.get_db),
    organization_in: schemas.OrganizationCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new organization.
    """
    organization = crud.organization.create_with_owner(
        db=db, obj_in=organization_in, owner_id=current_user.id
    )
    return organization


@router.get("/{id}", response_model=schemas.Organization)
def read_organization(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get organization by ID.
    """
    organization = crud.organization.get(db=db, id=id)
    if not organization:
        raise HTTPException(status_code=404, detail="Organization not found")
    # In a real application, you would check if the user has permission to access this organization
    return organization


@router.put("/{id}", response_model=schemas.Organization)
def update_organization(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    organization_in: schemas.OrganizationUpdate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update an organization.
    """
    organization = crud.organization.get(db=db, id=id)
    if not organization:
        raise HTTPException(status_code=404, detail="Organization not found")
    # In a real application, you would check if the user has permission to update this organization
    organization = crud.organization.update(db=db, db_obj=organization, obj_in=organization_in)
    return organization


@router.delete("/{id}", response_model=schemas.Organization)
def delete_organization(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: models.User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Delete an organization.
    """
    organization = crud.organization.get(db=db, id=id)
    if not organization:
        raise HTTPException(status_code=404, detail="Organization not found")
    organization = crud.organization.remove(db=db, id=id)
    return organization
