from flask_restx import Namespace, Resource, fields
from flask import request
from app.services.policy_service import PolicyService

api = Namespace('policy-rules', description='Policy rules management operations')

# API Models
rule_model = api.model('PolicyRule', {
    'id': fields.String(readonly=True, description='Rule UUID'),
    'policy_id': fields.String(required=True, description='Policy UUID'),
    'code': fields.String(required=True, description='Rule specification code'),
    'action': fields.String(required=True, enum=['HIDE', 'BLOCK', 'APPROVE', 'OUT_OF_POLICY']),
    'vars': fields.Raw(description='Rule parameters as JSON'),
    'active': fields.Boolean(default=True),
    'created_at': fields.DateTime(readonly=True),
    'updated_at': fields.DateTime(readonly=True),
})

rule_create_model = api.model('PolicyRuleCreate', {
    'policy_id': fields.String(required=True, description='Policy UUID'),
    'code': fields.String(required=True, description='Rule specification code'),
    'action': fields.String(required=True, enum=['HIDE', 'BLOCK', 'APPROVE', 'OUT_OF_POLICY']),
    'vars': fields.Raw(description='Rule parameters as JSON'),
    'active': fields.Boolean(default=True),
})

rule_spec_model = api.model('RuleSpecification', {
    'code': fields.String(description='Rule specification code'),
    'name': fields.String(description='Human readable name'),
    'description': fields.String(description='Rule description'),
    'travel_type': fields.String(enum=['TRAIN', 'FLIGHT', 'HOTEL', 'CAR']),
    'parameters': fields.Raw(description='Expected parameters schema'),
})

@api.route('/')
class PolicyRuleList(Resource):
    @api.marshal_list_with(rule_model)
    @api.doc('list_policy_rules')
    @api.param('policy_id', 'Policy ID to filter rules')
    def get(self):
        """List policy rules"""
        policy_id = request.args.get('policy_id')
        if policy_id:
            return PolicyService.get_rules_by_policy(policy_id)
        return PolicyService.get_all_rules()
    
    @api.expect(rule_create_model)
    @api.marshal_with(rule_model, code=201)
    @api.doc('create_policy_rule')
    def post(self):
        """Create a new policy rule"""
        return PolicyService.create_rule(api.payload), 201

@api.route('/<string:rule_id>')
@api.param('rule_id', 'Rule UUID')
class PolicyRuleItem(Resource):
    @api.marshal_with(rule_model)
    @api.doc('get_policy_rule')
    def get(self, rule_id):
        """Get specific policy rule"""
        return PolicyService.get_rule(rule_id)
    
    @api.expect(rule_create_model)
    @api.marshal_with(rule_model)
    @api.doc('update_policy_rule')
    def put(self, rule_id):
        """Update policy rule"""
        return PolicyService.update_rule(rule_id, api.payload)
    
    @api.doc('delete_policy_rule')
    def delete(self, rule_id):
        """Delete policy rule"""
        PolicyService.delete_rule(rule_id)
        return '', 204

@api.route('/specs')
class RuleSpecificationList(Resource):
    @api.marshal_list_with(rule_spec_model)
    @api.doc('list_rule_specifications')
    @api.param('travel_type', 'Filter by travel type (TRAIN, FLIGHT, HOTEL, CAR)')
    def get(self):
        """List available rule specifications"""
        travel_type = request.args.get('travel_type')
        return PolicyService.get_rule_specifications(travel_type)