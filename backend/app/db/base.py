# Import all the models, so that Base has them before being
# imported by Alembic
from app.db.base_class import Base  # noqa
from app.models.user import User  # noqa
from app.models.organization import Organization  # noqa
from app.models.trip import Trip, TripTraveler, TripArranger, TripBooker  # noqa
from app.models.booking import Booking  # noqa
