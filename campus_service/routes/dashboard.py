from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from models import db, Student, Course, Score, CampusService
from sqlalchemy import func

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_stats():
    total_students = Student.query.count()
    total_courses = Course.query.count()

    avg_score_result = db.session.query(func.avg(Score.score)).scalar()
    average_score = round(avg_score_result, 2) if avg_score_result else 0

    pass_count = db.session.query(func.count(Score.id)).filter(Score.score >= 60).scalar()
    total_scores = Score.query.count()
    pass_rate = round((pass_count / total_scores * 100), 2) if total_scores > 0 else 0

    total_services = CampusService.query.count()

    return jsonify({
        'total_students': total_students,
        'total_courses': total_courses,
        'average_score': average_score,
        'pass_rate': pass_rate,
        'total_services': total_services
    }), 200
