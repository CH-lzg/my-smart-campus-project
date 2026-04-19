import io
import base64
from flask import Blueprint, jsonify, send_file
from flask_jwt_extended import jwt_required
from models import db, Score, Student, Course
from sqlalchemy import func
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/score-distribution', methods=['GET'])
@jwt_required()
def score_distribution():
    scores = db.session.query(Score.score).all()
    score_list = [s[0] for s in scores]

    if not score_list:
        return jsonify({
            'distribution': [],
            'image': None,
            'stats': {'avg': 0, 'max': 0, 'min': 0, 'pass_rate': 0}
        }), 200

    fig, ax = plt.subplots(figsize=(10, 6))
    bins = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
    ax.hist(score_list, bins=bins, color='#667eea', edgecolor='white', alpha=0.8)
    ax.set_xlabel('Score', fontsize=12)
    ax.set_ylabel('Number of Students', fontsize=12)
    ax.set_title('Score Distribution', fontsize=14, fontweight='bold')
    ax.set_xticks(bins)
    ax.grid(axis='y', alpha=0.3)

    img_buffer = io.BytesIO()
    plt.savefig(img_buffer, format='png', bbox_inches='tight', dpi=100)
    img_buffer.seek(0)
    img_base64 = base64.b64encode(img_buffer.getvalue()).decode()
    plt.close()

    avg_score = round(np.mean(score_list), 2)
    max_score = round(np.max(score_list), 2)
    min_score = round(np.min(score_list), 2)
    pass_count = len([s for s in score_list if s >= 60])
    pass_rate = round((pass_count / len(score_list) * 100), 2)

    ranges = {
        '0-59': len([s for s in score_list if s < 60]),
        '60-69': len([s for s in score_list if 60 <= s < 70]),
        '70-79': len([s for s in score_list if 70 <= s < 80]),
        '80-89': len([s for s in score_list if 80 <= s < 90]),
        '90-100': len([s for s in score_list if s >= 90])
    }

    return jsonify({
        'distribution': ranges,
        'image': f'data:image/png;base64,{img_base64}',
        'stats': {
            'avg': avg_score,
            'max': max_score,
            'min': min_score,
            'pass_rate': pass_rate
        }
    }), 200

@analytics_bp.route('/gpa-ranking', methods=['GET'])
@jwt_required()
def gpa_ranking():
    limit = 10
    student_scores = db.session.query(
        Student.id,
        Student.name,
        Student.student_id,
        func.avg(Score.score).label('avg_score')
    ).join(Score).group_by(Student.id).order_by(func.avg(Score.score).desc()).limit(limit).all()

    rankings = [{
        'rank': i + 1,
        'student_id': s.student_id,
        'name': s.name,
        'gpa': round(s.avg_score, 2)
    } for i, s in enumerate(student_scores)]

    if rankings:
        fig, ax = plt.subplots(figsize=(10, 6))
        names = [r['name'][:8] for r in rankings]
        gpas = [r['gpa'] for r in rankings]
        colors = plt.cm.RdYlGn([g/100 for g in gpas])

        bars = ax.barh(names[::-1], gpas[::-1], color=colors[::-1], edgecolor='white')
        ax.set_xlabel('Average Score (GPA)', fontsize=12)
        ax.set_title('Top 10 Students by GPA', fontsize=14, fontweight='bold')
        ax.set_xlim(0, 100)

        for bar, gpa in zip(bars, gpas[::-1]):
            ax.text(bar.get_width() + 1, bar.get_y() + bar.get_height()/2,
                   f'{gpa}', va='center', fontsize=10)

        plt.tight_layout()
        img_buffer = io.BytesIO()
        plt.savefig(img_buffer, format='png', bbox_inches='tight', dpi=100)
        img_buffer.seek(0)
        img_base64 = base64.b64encode(img_buffer.getvalue()).decode()
        plt.close()
    else:
        img_base64 = None

    return jsonify({
        'rankings': rankings,
        'image': f'data:image/png;base64,{img_base64}' if img_base64 else None
    }), 200

@analytics_bp.route('/course-comparison', methods=['GET'])
@jwt_required()
def course_comparison():
    course_stats = db.session.query(
        Course.id,
        Course.name,
        Course.course_id,
        func.avg(Score.score).label('avg_score'),
        func.count(Score.id).label('student_count')
    ).outerjoin(Score).group_by(Course.id).all()

    comparisons = [{
        'course_id': c.course_id,
        'name': c.name,
        'avg_score': round(c.avg_score, 2) if c.avg_score else 0,
        'student_count': c.student_count
    } for c in course_stats if c.avg_score]

    if comparisons:
        fig, ax = plt.subplots(figsize=(12, 6))
        courses = [c['name'][:15] for c in comparisons]
        avg_scores = [c['avg_score'] for c in comparisons]
        colors = ['#667eea' if s >= 60 else '#f5365c' for s in avg_scores]

        bars = ax.bar(courses, avg_scores, color=colors, edgecolor='white', alpha=0.8)
        ax.set_xlabel('Course', fontsize=12)
        ax.set_ylabel('Average Score', fontsize=12)
        ax.set_title('Course Average Score Comparison', fontsize=14, fontweight='bold')
        ax.axhline(y=60, color='orange', linestyle='--', linewidth=2, label='Pass Line (60)')
        ax.legend()

        for bar, score in zip(bars, avg_scores):
            ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 1,
                   f'{score}', ha='center', va='bottom', fontsize=9)

        plt.xticks(rotation=45, ha='right')
        plt.tight_layout()
        img_buffer = io.BytesIO()
        plt.savefig(img_buffer, format='png', bbox_inches='tight', dpi=100)
        img_buffer.seek(0)
        img_base64 = base64.b64encode(img_buffer.getvalue()).decode()
        plt.close()
    else:
        img_base64 = None

    return jsonify({
        'comparisons': comparisons,
        'image': f'data:image/png;base64,{img_base64}' if img_base64 else None
    }), 200

@analytics_bp.route('/attendance', methods=['GET'])
@jwt_required()
def attendance_stats():
    scores = db.session.query(Score.score).all()
    score_list = [s[0] for s in scores]

    if not score_list:
        return jsonify({
            'attendance': [],
            'image': None
        }), 200

    excellent = len([s for s in score_list if s >= 90])
    good = len([s for s in score_list if 75 <= s < 90])
    fair = len([s for s in score_list if 60 <= s < 75])
    poor = len([s for s in score_list if s < 60])

    fig, ax = plt.subplots(figsize=(8, 8))
    sizes = [excellent, good, fair, poor]
    labels = ['Excellent (90+)', 'Good (75-89)', 'Fair (60-74)', 'Poor (<60)']
    colors = ['#2ecc71', '#667eea', '#f39c12', '#e74c3c']
    explode = (0.05, 0, 0, 0)

    if sum(sizes) > 0:
        ax.pie(sizes, explode=explode, labels=labels, colors=colors,
               autopct='%1.1f%%', shadow=True, startangle=90)
        ax.set_title('Score Distribution (Attendance Rate)', fontsize=14, fontweight='bold')
    else:
        ax.text(0.5, 0.5, 'No Data Available', ha='center', va='center', fontsize=14)

    plt.tight_layout()
    img_buffer = io.BytesIO()
    plt.savefig(img_buffer, format='png', bbox_inches='tight', dpi=100)
    img_buffer.seek(0)
    img_base64 = base64.b64encode(img_buffer.getvalue()).decode()
    plt.close()

    return jsonify({
        'attendance': {
            'excellent': excellent,
            'good': good,
            'fair': fair,
            'poor': poor
        },
        'image': f'data:image/png;base64,{img_base64}'
    }), 200

@analytics_bp.route('/summary', methods=['GET'])
@jwt_required()
def analytics_summary():
    scores = db.session.query(Score.score).all()
    score_list = [s[0] for s in scores] if scores else []

    if not score_list:
        return jsonify({
            'total_scores': 0,
            'avg_score': 0,
            'max_score': 0,
            'min_score': 0,
            'pass_rate': 0,
            'excellent_rate': 0
        }), 200

    avg_score = round(np.mean(score_list), 2)
    max_score = round(np.max(score_list), 2)
    min_score = round(np.min(score_list), 2)
    pass_count = len([s for s in score_list if s >= 60])
    excellent_count = len([s for s in score_list if s >= 90])
    pass_rate = round((pass_count / len(score_list) * 100), 2)
    excellent_rate = round((excellent_count / len(score_list) * 100), 2)

    return jsonify({
        'total_scores': len(score_list),
        'avg_score': avg_score,
        'max_score': max_score,
        'min_score': min_score,
        'pass_rate': pass_rate,
        'excellent_rate': excellent_rate
    }), 200
