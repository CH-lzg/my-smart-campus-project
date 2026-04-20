from flask import Flask, render_template
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import config
from models import db

def create_app(config_name='default'):
    app = Flask(__name__)
    app.config.from_object(config[config_name])

    CORS(app, resources={r"/api/*": {"origins": "*"}})
    JWTManager(app)
    db.init_app(app)

    from routes import (
        auth_bp, students_bp, courses_bp, scores_bp,
        dashboard_bp, analytics_bp, services_bp
    )

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(students_bp, url_prefix='/api/students')
    app.register_blueprint(courses_bp, url_prefix='/api/courses')
    app.register_blueprint(scores_bp, url_prefix='/api/scores')
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')
    app.register_blueprint(analytics_bp, url_prefix='/api/analytics')
    app.register_blueprint(services_bp, url_prefix='/api/services')

    @app.route('/')
    def index():
        return render_template('index.html')

    @app.route('/login')
    def login_page():
        return render_template('login.html')

    @app.route('/register')
    def register_page():
        return render_template('register.html')

    @app.route('/dashboard')
    def dashboard_page():
        return render_template('dashboard.html')

    @app.route('/student/login')
    def student_login_page():
        return render_template('student_login.html')

    @app.route('/student/register')
    def student_register_page():
        return render_template('student_register.html')

    @app.route('/student/dashboard')
    def student_dashboard_page():
        return render_template('student_dashboard.html')

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=5000)
