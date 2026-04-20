from .auth import auth_bp
from .students import students_bp
from .courses import courses_bp
from .scores import scores_bp
from .dashboard import dashboard_bp
from .analytics import analytics_bp
from .services import services_bp

__all__ = [
    'auth_bp',
    'students_bp',
    'courses_bp',
    'scores_bp',
    'dashboard_bp',
    'analytics_bp',
    'services_bp'
]
