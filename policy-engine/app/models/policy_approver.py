from sqlalchemy import Column, ForeignKey, text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.mixins import TimestampMixin, BaseModel

class PolicyApprover(BaseModel, TimestampMixin):
    __tablename__ = 'policy_approvers'
    
    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    policy_id = Column(UUID(as_uuid=True), ForeignKey('policies.id'), nullable=False)
    user_id = Column(UUID(as_uuid=True), nullable=False)  # References auth.users(id)
    
    # Relationships
    policy = relationship("Policy", back_populates="approvers")
    
    # Constraints
    __table_args__ = (
        UniqueConstraint('policy_id', 'user_id', name='uq_policy_approver'),
    )
    
    def __repr__(self):
        return f'<PolicyApprover policy_id={self.policy_id} user_id={self.user_id}>'
    
    @classmethod
    def find_by_policy_id(cls, policy_id):
        """Find all approvers for a policy"""
        return cls.query.filter_by(policy_id=policy_id).all()
    
    @classmethod
    def find_by_user_id(cls, user_id):
        """Find all policies a user can approve"""
        return cls.query.filter_by(user_id=user_id).all()