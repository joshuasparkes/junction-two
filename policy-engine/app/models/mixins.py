from datetime import datetime
from sqlalchemy import Column, DateTime
from sqlalchemy.ext.declarative import declared_attr
from app import db

class TimestampMixin:
    """Adds created_at and updated_at timestamp fields"""
    
    @declared_attr
    def created_at(cls):
        return Column(DateTime, default=datetime.utcnow, nullable=False)
    
    @declared_attr  
    def updated_at(cls):
        return Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

class BaseModel(db.Model):
    """Base model class that includes CRUD convenience methods"""
    
    __abstract__ = True
    
    def save(self):
        """Save the record to the database"""
        db.session.add(self)
        db.session.commit()
        return self
    
    def delete(self):
        """Delete the record from the database"""
        db.session.delete(self)
        db.session.commit()
        return True
    
    def update(self, **kwargs):
        """Update the record with the given attributes"""
        for key, value in kwargs.items():
            if hasattr(self, key):
                setattr(self, key, value)
        db.session.commit()
        return self
    
    @classmethod
    def find_by_id(cls, id):
        """Find a record by ID"""
        return cls.query.get(id)
    
    @classmethod
    def find_all(cls):
        """Find all records"""
        return cls.query.all()
    
    def to_dict(self):
        """Convert model to dictionary"""
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}