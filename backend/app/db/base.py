# Import all the models, so that Base has them before being
# imported by Alembic
from app.db.base_class import Base  # noqa
# from app.models.user import User  # noqa
# from app.models.organization import Organization  # noqa
# from app.models.trip import Trip  # noqa
# Add more model imports as they are created
