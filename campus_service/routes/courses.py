from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models import db, Course

courses_bp = Blueprint('courses', __name__)

@courses_bp.route('', methods=['GET'])
@jwt_required()
def get_courses():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    search = request.args.get('search', '')

    query = Course.query

    if search:
        query = query.filter(
            db.or_(
                Course.name.like(f'%{search}%'),
                Course.course_id.like(f'%{search}%'),
                Course.teacher.like(f'%{search}%')
            )
        )

    pagination = query.order_by(Course.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    return jsonify({
        'courses': [c.to_dict() for c in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    }), 200

@courses_bp.route('/<int:id>', methods=['GET'])
@jwt_required()
def get_course(id):
    course = Course.query.get(id)
    if not course:
        return jsonify({'error': 'Course not found'}), 404
    return jsonify(course.to_dict()), 200

@courses_bp.route('', methods=['POST'])
@jwt_required()
def create_course():
    data = request.get_json()

    if not data:
        return jsonify({'error': 'No data provided'}), 400

    required_fields = ['course_id', 'name', 'credits', 'teacher']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400

    if Course.query.filter_by(course_id=data['course_id']).first():
        return jsonify({'error': 'Course ID already exists'}), 409

    course = Course(
        course_id=data['course_id'],
        name=data['name'],
        credits=data['credits'],
        teacher=data['teacher'],
        location=data.get('location'),
        max_students=data.get('max_students', 50)
    )

    try:
        db.session.add(course)
        db.session.commit()
        return jsonify({
            'message': 'Course created successfully',
            'course': course.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@courses_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_course(id):
    course = Course.query.get(id)
    if not course:
        return jsonify({'error': 'Course not found'}), 404

    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    if 'course_id' in data and data['course_id'] != course.course_id:
        if Course.query.filter_by(course_id=data['course_id']).first():
            return jsonify({'error': 'Course ID already exists'}), 409

    try:
        if 'course_id' in data:
            course.course_id = data['course_id']
        if 'name' in data:
            course.name = data['name']
        if 'credits' in data:
            course.credits = data['credits']
        if 'teacher' in data:
            course.teacher = data['teacher']
        if 'location' in data:
            course.location = data['location']
        if 'max_students' in data:
            course.max_students = data['max_students']

        db.session.commit()
        return jsonify({
            'message': 'Course updated successfully',
            'course': course.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@courses_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_course(id):
    course = Course.query.get(id)
    if not course:
        return jsonify({'error': 'Course not found'}), 404

    try:
        db.session.delete(course)
        db.session.commit()
        return jsonify({'message': 'Course deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
