"""API endpoints for approval requests"""

from flask import request
from flask_restx import Resource, fields, Namespace
from datetime import datetime
from uuid import UUID, uuid4
import logging

from app import db
from app.models.approval_request import ApprovalRequest
from app.utils.exceptions import PolicyEvaluationError
from sqlalchemy.exc import OperationalError

logger = logging.getLogger(__name__)

approval_requests_ns = Namespace('approval-requests', description='Approval request operations')

# Request/Response models for Swagger documentation
approval_request_model = approval_requests_ns.model('ApprovalRequest', {
    'id': fields.String(description='Approval request ID'),
    'org_id': fields.String(description='Organization ID'),
    'user_id': fields.String(description='Requesting user ID'),
    'travel_data': fields.Raw(description='Travel booking data'),
    'policy_evaluation': fields.Raw(description='Policy evaluation result'),
    'status': fields.String(description='Request status', enum=['PENDING', 'APPROVED', 'REJECTED']),
    'approver_id': fields.String(description='Approver user ID'),
    'reason': fields.String(description='Approval/rejection reason'),
    'created_at': fields.DateTime(description='Request creation time'),
    'updated_at': fields.DateTime(description='Last update time')
})

create_approval_request_model = approval_requests_ns.model('CreateApprovalRequest', {
    'org_id': fields.String(required=True, description='Organization ID'),
    'user_id': fields.String(required=True, description='Requesting user ID'),
    'travel_data': fields.Raw(required=True, description='Travel booking data'),
    'policy_evaluation': fields.Raw(required=True, description='Policy evaluation result')
})

process_approval_model = approval_requests_ns.model('ProcessApproval', {
    'action': fields.String(required=True, description='Approval action', enum=['APPROVE', 'REJECT']),
    'reason': fields.String(description='Reason for approval/rejection'),
    'approver_id': fields.String(required=True, description='Approver user ID')
})

def _get_demo_approval_requests(org_id, user_id=None, approver_id=None, status=None):
    """Return demo approval request data when database is unavailable"""
    demo_requests = [
        {
            'id': str(uuid4()),
            'org_id': org_id,
            'user_id': str(uuid4()),
            'travel_data': {
                'origin': 'London',
                'destination': 'Paris',
                'departure_date': '2024-02-15',
                'return_date': '2024-02-17',
                'traveler_count': 1,
                'trip_type': 'round_trip'
            },
            'policy_evaluation': {
                'result': 'OUT_OF_POLICY',
                'violations': ['Price exceeds maximum limit'],
                'approvers': [str(uuid4())]
            },
            'status': 'PENDING',
            'approver_id': str(uuid4()),
            'reason': '',
            'created_at': datetime.utcnow().isoformat() + 'Z',
            'updated_at': datetime.utcnow().isoformat() + 'Z'
        },
        {
            'id': str(uuid4()),
            'org_id': org_id,
            'user_id': str(uuid4()),
            'travel_data': {
                'origin': 'Manchester',
                'destination': 'Edinburgh',
                'departure_date': '2024-02-20',
                'return_date': '2024-02-22',
                'traveler_count': 2,
                'trip_type': 'round_trip'
            },
            'policy_evaluation': {
                'result': 'REQUIRES_APPROVAL',
                'violations': ['Premium class selected'],
                'approvers': [str(uuid4())]
            },
            'status': 'APPROVED',
            'approver_id': str(uuid4()),
            'reason': 'Business meeting approved',
            'created_at': datetime.utcnow().isoformat() + 'Z',
            'updated_at': datetime.utcnow().isoformat() + 'Z'
        }
    ]
    
    # Apply filters
    filtered_requests = demo_requests
    
    if user_id:
        filtered_requests = [r for r in filtered_requests if r['user_id'] == user_id]
    
    if approver_id:
        filtered_requests = [r for r in filtered_requests if r['approver_id'] == approver_id]
    
    if status:
        filtered_requests = [r for r in filtered_requests if r['status'] == status]
    
    return filtered_requests


@approval_requests_ns.route('/')
class ApprovalRequestListAPI(Resource):
    
    @approval_requests_ns.marshal_list_with(approval_request_model)
    @approval_requests_ns.doc('list_approval_requests')
    @approval_requests_ns.param('org_id', 'Organization ID', required=True)
    @approval_requests_ns.param('user_id', 'User ID (for sent requests)', required=False)
    @approval_requests_ns.param('approver_id', 'Approver ID (for received requests)', required=False)
    @approval_requests_ns.param('status', 'Request status', required=False)
    def get(self):
        """List approval requests"""
        try:
            org_id = request.args.get('org_id')
            user_id = request.args.get('user_id')  # For sent requests
            approver_id = request.args.get('approver_id')  # For received requests
            status = request.args.get('status')
            
            if not org_id:
                return {'error': 'org_id is required'}, 400
            
            query = ApprovalRequest.query.filter_by(org_id=UUID(org_id))
            
            # Filter by user_id for sent requests
            if user_id:
                query = query.filter_by(user_id=UUID(user_id))
            
            # Filter by approver_id for received requests
            if approver_id:
                query = query.filter_by(approver_id=UUID(approver_id))
            
            # Filter by status
            if status:
                query = query.filter_by(status=status)
            
            requests = query.order_by(ApprovalRequest.created_at.desc()).all()
            
            return [request.to_dict() for request in requests]
            
        except OperationalError as e:
            logger.warning(f"Database connection failed, returning demo data: {e}")
            return _get_demo_approval_requests(org_id, user_id, approver_id, status)
        except ValueError as e:
            return {'error': f'Invalid UUID: {str(e)}'}, 400
        except Exception as e:
            logger.error(f"Failed to list approval requests: {e}")
            return {'error': 'Failed to list approval requests'}, 500
    
    @approval_requests_ns.expect(create_approval_request_model)
    @approval_requests_ns.marshal_with(approval_request_model)
    @approval_requests_ns.doc('create_approval_request')
    def post(self):
        """Create a new approval request"""
        try:
            data = request.get_json()
            
            # Validate required fields
            required_fields = ['org_id', 'user_id', 'travel_data', 'policy_evaluation']
            for field in required_fields:
                if field not in data:
                    return {'error': f'{field} is required'}, 400
            
            # Determine approver from policy evaluation
            approver_ids = data['policy_evaluation'].get('approvers', [])
            approver_id = approver_ids[0] if approver_ids else None
            
            approval_request = ApprovalRequest(
                id=uuid4(),
                org_id=UUID(data['org_id']),
                user_id=UUID(data['user_id']),
                travel_data=data['travel_data'],
                policy_evaluation=data['policy_evaluation'],
                approver_id=UUID(approver_id) if approver_id else None,
                status='PENDING'
            )
            
            db.session.add(approval_request)
            db.session.commit()
            
            logger.info(f"Created approval request {approval_request.id}")
            return approval_request.to_dict(), 201
            
        except ValueError as e:
            return {'error': f'Invalid UUID: {str(e)}'}, 400
        except Exception as e:
            logger.error(f"Failed to create approval request: {e}")
            db.session.rollback()
            return {'error': 'Failed to create approval request'}, 500

@approval_requests_ns.route('/<string:request_id>')
class ApprovalRequestAPI(Resource):
    
    @approval_requests_ns.marshal_with(approval_request_model)
    @approval_requests_ns.doc('get_approval_request')
    def get(self, request_id):
        """Get approval request by ID"""
        try:
            approval_request = ApprovalRequest.query.filter_by(id=UUID(request_id)).first()
            
            if not approval_request:
                return {'error': 'Approval request not found'}, 404
            
            return approval_request.to_dict()
            
        except ValueError as e:
            return {'error': f'Invalid UUID: {str(e)}'}, 400
        except Exception as e:
            logger.error(f"Failed to get approval request: {e}")
            return {'error': 'Failed to get approval request'}, 500

@approval_requests_ns.route('/<string:request_id>/process')
class ProcessApprovalAPI(Resource):
    
    @approval_requests_ns.expect(process_approval_model)
    @approval_requests_ns.marshal_with(approval_request_model)
    @approval_requests_ns.doc('process_approval')
    def post(self, request_id):
        """Process approval request (approve or reject)"""
        try:
            data = request.get_json()
            
            # Validate required fields
            if 'action' not in data or 'approver_id' not in data:
                return {'error': 'action and approver_id are required'}, 400
            
            if data['action'] not in ['APPROVE', 'REJECT']:
                return {'error': 'action must be APPROVE or REJECT'}, 400
            
            approval_request = ApprovalRequest.query.filter_by(id=UUID(request_id)).first()
            
            if not approval_request:
                return {'error': 'Approval request not found'}, 404
            
            if approval_request.status != 'PENDING':
                return {'error': 'Request has already been processed'}, 400
            
            # Update the approval request
            approval_request.status = 'APPROVED' if data['action'] == 'APPROVE' else 'REJECTED'
            approval_request.approver_id = UUID(data['approver_id'])
            approval_request.reason = data.get('reason', '')
            approval_request.updated_at = datetime.utcnow()
            
            db.session.commit()
            
            logger.info(f"Processed approval request {request_id}: {approval_request.status}")
            return approval_request.to_dict()
            
        except ValueError as e:
            return {'error': f'Invalid UUID: {str(e)}'}, 400
        except Exception as e:
            logger.error(f"Failed to process approval request: {e}")
            db.session.rollback()
            return {'error': 'Failed to process approval request'}, 500