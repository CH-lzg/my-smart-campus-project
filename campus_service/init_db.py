from app import create_app
from models import db, User

def init_database():
    app = create_app()
    with app.app_context():
        print("Creating database tables...")
        db.create_all()
        print("Tables created successfully!")

        if User.query.count() == 0:
            print("Adding default admin user...")
            admin = User(username='admin', name='管理员', email='admin@campus.edu', role='admin')
            admin.set_password('admin123')
            db.session.add(admin)
            db.session.commit()
            print("Default admin user added!")

        print("\n=== Database initialization complete! ===")
        print("\nDefault login credentials:")
        print("  Admin: username='admin', password='admin123'")
        print("\n数据库已初始化，没有添加任何模拟数据，您可以开始自行填写数据。")

if __name__ == '__main__':
    init_database()
