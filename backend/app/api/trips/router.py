from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps

router = APIRouter()


@router.get("/", response_model=List[schemas.Trip])
def read_trips(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve trips.
    """
    if crud.user.is_superuser(current_user):
        trips = crud.trip.get_multi(db, skip=skip, limit=limit)
    else:
        trips = crud.trip.get_multi_by_owner(
            db=db, owner_id=current_user.id, skip=skip, limit=limit
        )
    return trips


@router.post("/", response_model=schemas.Trip)
def create_trip(
    *,
    db: Session = Depends(deps.get_db),
    trip_in: schemas.TripCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new trip.
    """
    trip = crud.trip.create_with_owner(
        db=db, obj_in=trip_in, owner_id=current_user.id
    )
    return trip


@router.get("/{id}", response_model=schemas.Trip)
def read_trip(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get trip by ID.
    """
    trip = crud.trip.get(db=db, id=id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    if not crud.user.is_superuser(current_user) and (trip.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    return trip


@router.put("/{id}", response_model=schemas.Trip)
def update_trip(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    trip_in: schemas.TripUpdate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update a trip.
    """
    trip = crud.trip.get(db=db, id=id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    if not crud.user.is_superuser(current_user) and (trip.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    trip = crud.trip.update(db=db, db_obj=trip, obj_in=trip_in)
    return trip


@router.delete("/{id}", response_model=schemas.Trip)
def delete_trip(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete a trip.
    """
    trip = crud.trip.get(db=db, id=id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    if not crud.user.is_superuser(current_user) and (trip.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    trip = crud.trip.remove(db=db, id=id)
    return trip


@router.post("/{id}/travelers", response_model=schemas.Trip)
def add_traveler(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    traveler_in: schemas.TripTravelerCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Add a traveler to a trip.
    """
    trip = crud.trip.get(db=db, id=id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    if not crud.user.is_superuser(current_user) and (trip.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    crud.trip.add_traveler(db=db, trip_id=id, user_id=traveler_in.user_id)
    return trip


@router.delete("/{id}/travelers/{user_id}", response_model=schemas.Trip)
def remove_traveler(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    user_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Remove a traveler from a trip.
    """
    trip = crud.trip.get(db=db, id=id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    if not crud.user.is_superuser(current_user) and (trip.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    crud.trip.remove_traveler(db=db, trip_id=id, user_id=user_id)
    return trip


@router.post("/{id}/arrangers", response_model=schemas.Trip)
def add_arranger(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    arranger_in: schemas.TripArrangerCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Add an arranger to a trip.
    """
    trip = crud.trip.get(db=db, id=id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    if not crud.user.is_superuser(current_user) and (trip.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    crud.trip.add_arranger(db=db, trip_id=id, user_id=arranger_in.user_id)
    return trip


@router.delete("/{id}/arrangers/{user_id}", response_model=schemas.Trip)
def remove_arranger(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    user_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Remove an arranger from a trip.
    """
    trip = crud.trip.get(db=db, id=id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    if not crud.user.is_superuser(current_user) and (trip.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    crud.trip.remove_arranger(db=db, trip_id=id, user_id=user_id)
    return trip


@router.post("/{id}/bookers", response_model=schemas.Trip)
def add_booker(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    booker_in: schemas.TripBookerCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Add a booker to a trip.
    """
    trip = crud.trip.get(db=db, id=id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    if not crud.user.is_superuser(current_user) and (trip.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    crud.trip.add_booker(db=db, trip_id=id, user_id=booker_in.user_id)
    return trip


@router.delete("/{id}/bookers/{user_id}", response_model=schemas.Trip)
def remove_booker(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    user_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Remove a booker from a trip.
    """
    trip = crud.trip.get(db=db, id=id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    if not crud.user.is_superuser(current_user) and (trip.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    crud.trip.remove_booker(db=db, trip_id=id, user_id=user_id)
    return trip
