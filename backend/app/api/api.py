from fastapi import APIRouter

from app.api.auth.router import router as auth_router
from app.api.organizations.router import router as organizations_router
from app.api.trips.router import router as trips_router
from app.api.places.router import router as places_router
from app.api.trains.router import router as trains_router

api_router = APIRouter()
api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(organizations_router, prefix="/organizations", tags=["organizations"])
api_router.include_router(trips_router, prefix="/trips", tags=["trips"])
api_router.include_router(places_router, prefix="/places", tags=["places"])
api_router.include_router(trains_router, prefix="/trains", tags=["trains"])
