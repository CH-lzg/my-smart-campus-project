from app import create_app
from models import db, User

def update_admin():
    app = create_app()
    with app.app_context():
        print("Updating admin user...")
        
        # 查找现有的admin用户
        admin = User.query.filter_by(username='admin').first()
        
        if admin:
            # 更新用户名和密码
            admin.username = '2310401100'
            admin.set_password('112700')
            
            try:
                db.session.commit()
                print("Admin user updated successfully!")
                print(f"New username: {admin.username}")
                print("New password: 112700")
            except Exception as e:
                db.session.rollback()
                print(f"Error updating admin user: {e}")
        else:
            print("Admin user not found!")

if __name__ == '__main__':
    update_admin()