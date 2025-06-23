from flask_restx import Namespace, Resource, fields
from flask import request
from app.models.policy import Policy
from app.services.policy_service import PolicyService

api = Namespace('policies', description='Policy management operations')

# API Models for documentation
policy_model = api.model('Policy', {
    'id': fields.String(readonly=True, description='Policy UUID'),
    'org_id': fields.String(required=True, description='Organization UUID'),
    'label': fields.String(required=True, max_length=512, description='Policy name'),
    'type': fields.String(required=True, enum=['ORG', 'TRAVEL'], description='Policy type'),
    'active': fields.Boolean(default=True, description='Policy is active'),
    'action': fields.String(enum=['HIDE', 'BLOCK', 'APPROVE', 'OUT_OF_POLICY'], description='Default action'),
    'enforce_approval': fields.Boolean(default=False, description='Always require approval'),
    'message_for_reservation': fields.Raw(description='Custom messages per reservation type'),
    'exclude_restricted_fares': fields.Boolean(default=False),
    'refundable_fares_enabled': fields.Boolean(default=False),
    'user_count': fields.String(readonly=True),
    'guest_count': fields.String(readonly=True),
    'approver_count': fields.String(readonly=True),
    'created_at': fields.DateTime(readonly=True),
    'updated_at': fields.DateTime(readonly=True),
})

policy_create_model = api.model('PolicyCreate', {
    'org_id': fields.String(required=True, description='Organization UUID'),
    'label': fields.String(required=True, max_length=512, description='Policy name'),
    'type': fields.String(required=True, enum=['ORG', 'TRAVEL'], description='Policy type'),
    'active': fields.Boolean(default=True, description='Policy is active'),
    'action': fields.String(enum=['HIDE', 'BLOCK', 'APPROVE', 'OUT_OF_POLICY'], description='Default action'),
    'enforce_approval': fields.Boolean(default=False, description='Always require approval'),
    'message_for_reservation': fields.Raw(description='Custom messages per reservation type'),
    'exclude_restricted_fares': fields.Boolean(default=False),
    'refundable_fares_enabled': fields.Boolean(default=False),
})

@api.route('/')
class PolicyList(Resource):
    @api.marshal_list_with(policy_model)
    @api.doc('list_policies')
    @api.param('org_id', 'Organization ID to filter policies')
    def get(self):
        """List policies for organization"""
        org_id = request.args.get('org_id')
        if org_id:
            return PolicyService.get_policies_by_org(org_id)
        return PolicyService.get_all_policies()
    
    @api.expect(policy_create_model)
    @api.marshal_with(policy_model, code=201)
    @api.doc('create_policy')
    def post(self):
        """Create a new policy"""
        return PolicyService.create_policy(api.payload), 201

@api.route('/<string:policy_id>')
@api.param('policy_id', 'Policy UUID')
class PolicyItem(Resource):
    @api.marshal_with(policy_model)
    @api.doc('get_policy')
    def get(self, policy_id):
        """Get specific policy"""
        return PolicyService.get_policy(policy_id)
    
    @api.expect(policy_create_model)
    @api.marshal_with(policy_model)
    @api.doc('update_policy')
    def put(self, policy_id):
        """Update policy"""
        return PolicyService.update_policy(policy_id, api.payload)
    
    @api.doc('delete_policy')
    def delete(self, policy_id):
        """Delete policy"""
        PolicyService.delete_policy(policy_id)
        return '', 204