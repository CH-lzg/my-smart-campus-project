from app import create_app
from models import db, User, Student

def delete_student(student_id):
    app = create_app()
    with app.app_context():
        print(f"删除学号为 {student_id} 的学生信息...")
        
        # 删除User记录
        user = User.query.filter_by(username=student_id).first()
        if user:
            db.session.delete(user)
            print(f"已删除User记录: {user.username}")
        else:
            print(f"未找到User记录: {student_id}")
        
        # 删除Student记录
        student = Student.query.filter_by(student_id=student_id).first()
        if student:
            db.session.delete(student)
            print(f"已删除Student记录: {student.student_id} - {student.name}")
        else:
            print(f"未找到Student记录: {student_id}")
        
        # 提交更改
        db.session.commit()
        print("删除操作完成！")

if __name__ == '__main__':
    delete_student('2310401126')