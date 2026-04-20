import os

def count_lines(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        return len(lines)
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return 0

def main():
    files = [
        'app.py',
        'config.py',
        'init_db.py',
        'delete_student.py',
        'models/__init__.py',
        'routes/__init__.py',
        'routes/auth.py',
        'routes/students.py',
        'routes/courses.py',
        'routes/scores.py',
        'routes/dashboard.py',
        'routes/analytics.py',
        'routes/services.py',
        'static/css/style.css',
        'static/js/app.js',
        'static/js/student_app.js',
        'templates/dashboard.html',
        'templates/login.html',
        'templates/student_dashboard.html',
        'templates/student_login.html',
        'templates/student_register.html'
    ]
    
    total_lines = 0
    for file in files:
        file_path = os.path.join(os.getcwd(), file)
        if os.path.exists(file_path):
            lines = count_lines(file_path)
            total_lines += lines
            print(f"{file}: {lines} 行")
        else:
            print(f"{file}: 文件不存在")
    
    print(f"\n总计: {total_lines} 行")

if __name__ == '__main__':
    main()