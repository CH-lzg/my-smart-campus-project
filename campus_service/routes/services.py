from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models import db, CampusService

services_bp = Blueprint('services', __name__)

@services_bp.route('', methods=['GET'])
@jwt_required()
def get_services():
    service_type = request.args.get('type', '')

    query = CampusService.query

    if service_type:
        query = query.filter(CampusService.service_type == service_type)

    services = query.order_by(CampusService.service_type, CampusService.name).all()

    grouped = {}
    for service in services:
        if service.service_type not in grouped:
            grouped[service.service_type] = []
        grouped[service.service_type].append(service.to_dict())

    return jsonify({
        'services': [s.to_dict() for s in services],
        'grouped': grouped
    }), 200

@services_bp.route('/<int:id>', methods=['GET'])
@jwt_required()
def get_service(id):
    service = CampusService.query.get(id)
    if not service:
        return jsonify({'error': 'Service not found'}), 404
    return jsonify(service.to_dict()), 200

@services_bp.route('', methods=['POST'])
@jwt_required()
def create_service():
    data = request.get_json()

    if not data:
        return jsonify({'error': 'No data provided'}), 400

    required_fields = ['name', 'service_type']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400

    service = CampusService(
        name=data['name'],
        service_type=data['service_type'],
        description=data.get('description'),
        location=data.get('location'),
        open_time=data.get('open_time'),
        contact=data.get('contact')
    )

    try:
        db.session.add(service)
        db.session.commit()
        return jsonify({
            'message': 'Service created successfully',
            'service': service.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@services_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_service(id):
    service = CampusService.query.get(id)
    if not service:
        return jsonify({'error': 'Service not found'}), 404

    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    try:
        if 'name' in data:
            service.name = data['name']
        if 'service_type' in data:
            service.service_type = data['service_type']
        if 'description' in data:
            service.description = data['description']
        if 'location' in data:
            service.location = data['location']
        if 'open_time' in data:
            service.open_time = data['open_time']
        if 'contact' in data:
            service.contact = data['contact']

        db.session.commit()
        return jsonify({
            'message': 'Service updated successfully',
            'service': service.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@services_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_service(id):
    service = CampusService.query.get(id)
    if not service:
        return jsonify({'error': 'Service not found'}), 404

    try:
        db.session.delete(service)
        db.session.commit()
        return jsonify({'message': 'Service deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
