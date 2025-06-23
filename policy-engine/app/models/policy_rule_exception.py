from sqlalchemy import Column, String, Boolean, JSON, ForeignKey, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.mixins import TimestampMixin, BaseModel

class PolicyRuleException(BaseModel, TimestampMixin):
    __tablename__ = 'policy_rule_exceptions'
    
    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    policy_rule_id = Column(UUID(as_uuid=True), ForeignKey('policy_rules.id'), nullable=False)
    code = Column(String(64), nullable=False)  # Exception specification type
    vars = Column(JSON)  # Exception parameters
    active = Column(Boolean, nullable=False, default=True)
    
    # Relationships
    rule = relationship("PolicyRule", back_populates="exceptions")
    
    def __repr__(self):
        return f'<PolicyRuleException {self.code}>'
    
    @classmethod
    def find_by_rule_id(cls, rule_id):
        """Find all exceptions for a rule"""
        return cls.query.filter_by(policy_rule_id=rule_id, active=True).all()