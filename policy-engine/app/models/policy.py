from sqlalchemy import Column, String, Boolean, JSON, text
from sqlalchemy.dialects.postgresql import UUID
import uuid
from sqlalchemy.orm import relationship
from app.models.mixins import TimestampMixin, BaseModel

class Policy(BaseModel, TimestampMixin):
    __tablename__ = 'policies'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    label = Column(String(512), nullable=False)
    type = Column(String(32), nullable=False, default='TRAVEL')  # TRAVEL, ORG
    active = Column(Boolean, nullable=False, default=True)
    action = Column(String(32), nullable=False, default='OUT_OF_POLICY')  # HIDE, BLOCK, APPROVE, OUT_OF_POLICY
    enforce_approval = Column(Boolean, nullable=False, default=False)
    message_for_reservation = Column(JSON)
    exclude_restricted_fares = Column(Boolean, nullable=False, default=False)
    refundable_fares_enabled = Column(Boolean, nullable=False, default=False)
    user_count = Column(String, default='0')  # Using String to match BigInt
    guest_count = Column(String, default='0')
    approver_count = Column(String, default='0')
    
    # Relationships
    rules = relationship("PolicyRule", back_populates="policy", cascade="all, delete-orphan")
    approvers = relationship("PolicyApprover", back_populates="policy", cascade="all, delete-orphan")
    user_assignments = relationship("UserPolicyAssignment", back_populates="policy", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f'<Policy {self.label}>'
    
    @classmethod
    def find_by_org_id(cls, org_id):
        """Find all policies for an organization"""
        return cls.query.filter_by(org_id=org_id, active=True).all()
    
    @classmethod
    def find_active_policies(cls):
        """Find all active policies"""
        return cls.query.filter_by(active=True).all()