from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models import db, Score, Student, Course

scores_bp = Blueprint('scores', __name__)

@scores_bp.route('', methods=['GET'])
@jwt_required()
def get_scores():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    semester = request.args.get('semester', '')
    student_id = request.args.get('student_id', type=int)
    course_id = request.args.get('course_id', type=int)

    query = Score.query

    if semester:
        query = query.filter(Score.semester == semester)
    if student_id:
        query = query.filter(Score.student_id == student_id)
    if course_id:
        query = query.filter(Score.course_id == course_id)

    pagination = query.order_by(Score.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    return jsonify({
        'scores': [s.to_dict() for s in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    }), 200

@scores_bp.route('/<int:id>', methods=['GET'])
@jwt_required()
def get_score(id):
    score = Score.query.get(id)
    if not score:
        return jsonify({'error': 'Score not found'}), 404
    return jsonify(score.to_dict()), 200

@scores_bp.route('', methods=['POST'])
@jwt_required()
def create_score():
    data = request.get_json()

    if not data:
        return jsonify({'error': 'No data provided'}), 400

    required_fields = ['student_id', 'course_id', 'score', 'semester']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400

    student = Student.query.get(data['student_id'])
    if not student:
        return jsonify({'error': 'Student not found'}), 404

    course = Course.query.get(data['course_id'])
    if not course:
        return jsonify({'error': 'Course not found'}), 404

    existing = Score.query.filter_by(
        student_id=data['student_id'],
        course_id=data['course_id'],
        semester=data['semester']
    ).first()
    if existing:
        return jsonify({'error': 'Score already exists for this student, course and semester'}), 409

    score = Score(
        student_id=data['student_id'],
        course_id=data['course_id'],
        score=data['score'],
        semester=data['semester']
    )

    try:
        db.session.add(score)
        db.session.commit()
        return jsonify({
            'message': 'Score created successfully',
            'score': score.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@scores_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_score(id):
    score = Score.query.get(id)
    if not score:
        return jsonify({'error': 'Score not found'}), 404

    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    try:
        if 'score' in data:
            score.score = data['score']
        if 'semester' in data:
            score.semester = data['semester']

        db.session.commit()
        return jsonify({
            'message': 'Score updated successfully',
            'score': score.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@scores_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_score(id):
    score = Score.query.get(id)
    if not score:
        return jsonify({'error': 'Score not found'}), 404

    try:
        db.session.delete(score)
        db.session.commit()
        return jsonify({'message': 'Score deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
