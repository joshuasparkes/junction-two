from sqlalchemy import Column, String, Boolean, JSON, ForeignKey, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.mixins import TimestampMixin, BaseModel

class PolicyRule(BaseModel, TimestampMixin):
    __tablename__ = 'policy_rules'
    
    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    policy_id = Column(UUID(as_uuid=True), ForeignKey('policies.id'), nullable=False)
    code = Column(String(64), nullable=False)  # Rule specification type
    action = Column(String(32), nullable=False)  # HIDE, BLOCK, APPROVE, OUT_OF_POLICY
    vars = Column(JSON)  # Rule parameters
    active = Column(Boolean, nullable=False, default=True)
    
    # Relationships
    policy = relationship("Policy", back_populates="rules")
    exceptions = relationship("PolicyRuleException", back_populates="rule", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f'<PolicyRule {self.code}>'
    
    @classmethod
    def find_by_policy_id(cls, policy_id):
        """Find all rules for a policy"""
        return cls.query.filter_by(policy_id=policy_id, active=True).all()
    
    @classmethod
    def find_by_code(cls, code):
        """Find all rules by specification code"""
        return cls.query.filter_by(code=code, active=True).all()