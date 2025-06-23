from flask_restx import Namespace, Resource, fields
from app.services.evaluation_service import PolicyEvaluationService

api = Namespace('policy-evaluation', description='Policy evaluation operations')

# API Models
travel_data_model = api.model('TravelData', {
    'train': fields.Raw(description='Train booking data'),
    'origin': fields.String(description='Origin station code'),
    'destination': fields.String(description='Destination station code'),
    'departure_date': fields.String(description='Departure date'),
    'return_date': fields.String(description='Return date (optional)'),
    'passengers': fields.Raw(description='Passenger information'),
})

evaluation_request_model = api.model('PolicyEvaluationRequest', {
    'travel_data': fields.Nested(travel_data_model, required=True),
    'org_id': fields.String(required=True, description='Organization UUID'),
    'user_id': fields.String(required=True, description='User UUID'),
})

rule_result_model = api.model('RuleResult', {
    'rule_id': fields.String(description='Rule UUID'),
    'rule_code': fields.String(description='Rule specification code'),
    'result': fields.Boolean(description='Rule compliance result'),
    'action': fields.String(description='Rule action'),
})

policy_result_model = api.model('PolicyResult', {
    'policy_id': fields.String(description='Policy UUID'),
    'policy_label': fields.String(description='Policy name'),
    'result': fields.String(description='Policy evaluation result'),
    'rule_results': fields.List(fields.Nested(rule_result_model)),
})

evaluation_response_model = api.model('PolicyEvaluationResponse', {
    'result': fields.String(description='Final evaluation result', enum=[
        'HIDDEN', 'BOOKING_BLOCKED', 'APPROVAL_REQUIRED', 'OUT_OF_POLICY', 'IN_POLICY', 'NOT_SPECIFIED'
    ]),
    'policies_evaluated': fields.Integer(description='Number of policies evaluated'),
    'details': fields.List(fields.Nested(policy_result_model)),
    'messages': fields.List(fields.String, description='Policy violation messages'),
    'approvers': fields.List(fields.String, description='Required approver user IDs'),
})

@api.route('/evaluate')
class PolicyEvaluation(Resource):
    @api.expect(evaluation_request_model)
    @api.marshal_with(evaluation_response_model)
    @api.doc('evaluate_policies')
    def post(self):
        """Evaluate travel data against user's policies"""
        service = PolicyEvaluationService()
        return service.evaluate_policies(
            travel_data=api.payload['travel_data'],
            org_id=api.payload['org_id'],
            user_id=api.payload['user_id']
        )

@api.route('/info')
class PolicyInfo(Resource):
    @api.doc('get_policy_info')
    @api.param('org_id', 'Organization UUID', required=True)
    @api.param('user_id', 'User UUID', required=True)
    def get(self):
        """Get policy information for travel searches"""
        org_id = api.parser().parse_args()['org_id']
        user_id = api.parser().parse_args()['user_id']
        
        service = PolicyEvaluationService()
        return service.get_policy_info(org_id, user_id)