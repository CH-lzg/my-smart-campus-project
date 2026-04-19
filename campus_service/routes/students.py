from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Student

students_bp = Blueprint('students', __name__)

@students_bp.route('', methods=['GET'])
@jwt_required()
def get_students():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    search = request.args.get('search', '')

    query = Student.query

    if search:
        query = query.filter(
            db.or_(
                Student.name.like(f'%{search}%'),
                Student.student_id.like(f'%{search}%'),
                Student.major.like(f'%{search}%')
            )
        )

    pagination = query.order_by(Student.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    return jsonify({
        'students': [s.to_dict() for s in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    }), 200

@students_bp.route('/<int:id>', methods=['GET'])
@jwt_required()
def get_student(id):
    student = Student.query.get(id)
    if not student:
        return jsonify({'error': 'Student not found'}), 404
    return jsonify(student.to_dict()), 200

@students_bp.route('', methods=['POST'])
@jwt_required()
def create_student():
    data = request.get_json()

    if not data:
        return jsonify({'error': 'No data provided'}), 400

    required_fields = ['student_id', 'name', 'gender', 'age', 'major', 'grade']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400

    if Student.query.filter_by(student_id=data['student_id']).first():
        return jsonify({'error': 'Student ID already exists'}), 409

    student = Student(
        student_id=data['student_id'],
        name=data['name'],
        gender=data['gender'],
        age=data['age'],
        major=data['major'],
        grade=data['grade'],
        email=data.get('email'),
        phone=data.get('phone')
    )

    try:
        db.session.add(student)
        db.session.commit()
        return jsonify({
            'message': 'Student created successfully',
            'student': student.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@students_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_student(id):
    student = Student.query.get(id)
    if not student:
        return jsonify({'error': 'Student not found'}), 404

    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    if 'student_id' in data and data['student_id'] != student.student_id:
        if Student.query.filter_by(student_id=data['student_id']).first():
            return jsonify({'error': 'Student ID already exists'}), 409

    try:
        if 'student_id' in data:
            student.student_id = data['student_id']
        if 'name' in data:
            student.name = data['name']
        if 'gender' in data:
            student.gender = data['gender']
        if 'age' in data:
            student.age = data['age']
        if 'major' in data:
            student.major = data['major']
        if 'grade' in data:
            student.grade = data['grade']
        if 'email' in data:
            student.email = data['email']
        if 'phone' in data:
            student.phone = data['phone']

        db.session.commit()
        return jsonify({
            'message': 'Student updated successfully',
            'student': student.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@students_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_student(id):
    student = Student.query.get(id)
    if not student:
        return jsonify({'error': 'Student not found'}), 404

    try:
        db.session.delete(student)
        db.session.commit()
        return jsonify({'message': 'Student deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
