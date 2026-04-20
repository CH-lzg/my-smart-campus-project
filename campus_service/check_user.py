from app import create_app
from models import db, User

def check_users():
    app = create_app()
    with app.app_context():
        print("Checking users in database...")
        users = User.query.all()
        print(f"Total users: {len(users)}")
        
        for user in users:
            print(f"\nUser: {user.username}")
            print(f"Name: {user.name}")
            print(f"Email: {user.email}")
            print(f"Role: {user.role}")
            print(f"Password hash: {user.password_hash}")

if __name__ == '__main__':
    check_users()