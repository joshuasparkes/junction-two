"""Approval request model for policy violations requiring approval"""

from sqlalchemy import Column, String, JSON, text
from sqlalchemy.dialects.postgresql import UUID
from app.models.mixins import TimestampMixin, BaseModel

class ApprovalRequest(BaseModel, TimestampMixin):
    __tablename__ = 'approval_requests'
    
    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    org_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)  # Requesting user
    approver_id = Column(UUID(as_uuid=True), nullable=True, index=True)  # Assigned approver
    
    # Request data
    travel_data = Column(JSON, nullable=False)  # Original travel booking data
    policy_evaluation = Column(JSON, nullable=False)  # Policy evaluation result
    
    # Approval status
    status = Column(String(32), nullable=False, default='PENDING')  # PENDING, APPROVED, REJECTED
    reason = Column(String(1000), nullable=True)  # Approval/rejection reason
    
    def __repr__(self):
        return f'<ApprovalRequest id={self.id} status={self.status}>'
    
    def to_dict(self):
        """Convert to dictionary for API responses"""
        return {
            'id': str(self.id),
            'org_id': str(self.org_id),
            'user_id': str(self.user_id),
            'approver_id': str(self.approver_id) if self.approver_id else None,
            'travel_data': self.travel_data,
            'policy_evaluation': self.policy_evaluation,
            'status': self.status,
            'reason': self.reason,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    @classmethod
    def find_by_org_id(cls, org_id):
        """Find all requests for an organization"""
        return cls.query.filter_by(org_id=org_id).all()
    
    @classmethod
    def find_by_user_id(cls, user_id):
        """Find all requests by a user (sent requests)"""
        return cls.query.filter_by(user_id=user_id).all()
    
    @classmethod
    def find_by_approver_id(cls, approver_id):
        """Find all requests assigned to an approver (received requests)"""
        return cls.query.filter_by(approver_id=approver_id).all()
    
    @classmethod
    def find_pending_for_approver(cls, approver_id):
        """Find pending requests for an approver"""
        return cls.query.filter_by(approver_id=approver_id, status='PENDING').all()