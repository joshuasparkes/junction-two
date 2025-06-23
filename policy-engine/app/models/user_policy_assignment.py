from sqlalchemy import Column, ForeignKey, text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.mixins import TimestampMixin, BaseModel

class UserPolicyAssignment(BaseModel, TimestampMixin):
    __tablename__ = 'user_policy_assignments'
    
    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    user_id = Column(UUID(as_uuid=True), nullable=False)  # References auth.users(id)
    policy_id = Column(UUID(as_uuid=True), ForeignKey('policies.id'), nullable=False)
    assigned_by = Column(UUID(as_uuid=True))  # References auth.users(id)
    
    # Relationships
    policy = relationship("Policy", back_populates="user_assignments")
    
    # Constraints
    __table_args__ = (
        UniqueConstraint('user_id', 'policy_id', name='uq_user_policy'),
    )
    
    def __repr__(self):
        return f'<UserPolicyAssignment user_id={self.user_id} policy_id={self.policy_id}>'
    
    @classmethod
    def find_by_user_id(cls, user_id):
        """Find all policy assignments for a user"""
        return cls.query.filter_by(user_id=user_id).all()
    
    @classmethod
    def find_by_policy_id(cls, policy_id):
        """Find all user assignments for a policy"""
        return cls.query.filter_by(policy_id=policy_id).all()
    
    @classmethod
    def get_user_policies(cls, user_id):
        """Get all policies assigned to a user"""
        from app.models.policy import Policy
        return cls.query.join(Policy).filter(
            cls.user_id == user_id,
            Policy.active == True
        ).all()