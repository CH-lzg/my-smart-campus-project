# Campus Smart Service & Data Analysis Management System
# 校园智慧服务与数据分析管理系统

## Project Overview | 项目概述

A comprehensive digital campus management platform for universities to manage student information, course grades, campus services, and provide data analytics capabilities.

大学数字化校园管理平台，用于管理学生信息、课程成绩、校园服务等，并提供数据分析功能。

## Tech Stack | 技术架构

- **Frontend**: HTML5 + CSS3 + JavaScript (Vanilla JS)
- **Backend**: Python Flask + Flask-SQLAlchemy
- **Database**: MySQL 8.0
- **Visualization**: Matplotlib
- **Authentication**: JWT (JSON Web Tokens)

## Features | 功能模块

1. **User Authentication | 用户认证**
   - Login/Register | 登录/注册
   - JWT-based authentication | JWT认证
   - Role-based access (Admin/User) | 角色权限

2. **Dashboard | 仪表盘**
   - Statistics overview | 统计概览
   - Quick access | 快速入口

3. **Student Management | 学生管理**
   - List/Add/Edit/Delete students | 列表/添加/编辑/删除

4. **Course Management | 课程管理**
   - Course list and details | 课程列表和详情

5. **Score Management | 成绩管理**
   - Score entry and display | 成绩录入和展示

6. **Data Analytics | 数据分析**
   - Score distribution histogram | 成绩分布直方图
   - GPA ranking bar chart | GPA排名条形图
   - Course average comparison | 课程平均分对比
   - Attendance statistics pie chart | 出勤率饼图

7. **Campus Services | 校园服务**
   - Service information | 服务信息展示
   - Library, Canteen, Dormitory, etc. | 图书馆、食堂、宿舍等

## Project Structure | 项目结构

```
campus_service/
├── app.py                  # Main application entry
├── config.py               # Configuration
├── init_db.py              # Database initialization with sample data
├── requirements.txt        # Python dependencies
├── start.bat               # Windows startup script
├── env.example             # Environment variables example
├── models/
│   └── __init__.py         # Database models
├── routes/
│   ├── __init__.py
│   ├── auth.py             # Authentication routes
│   ├── students.py         # Student management routes
│   ├── courses.py          # Course management routes
│   ├── scores.py           # Score management routes
│   ├── dashboard.py        # Dashboard routes
│   ├── analytics.py        # Analytics routes
│   └── services.py         # Campus services routes
├── templates/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   └── dashboard.html
├── static/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── app.js
│   └── images/
└── sql/
    └── init_database.sql   # SQL for manual database setup
```

## Installation | 安装说明

### Prerequisites | 环境要求

- Python 3.8+
- MySQL 8.0+

### Step 1: Clone or Download | 步骤1: 获取代码

```bash
cd campus_service
```

### Step 2: Install Dependencies | 步骤2: 安装依赖

```bash
pip install -r requirements.txt
```

### Step 3: Configure Database | 步骤3: 配置数据库

Edit `config.py` or create `.env` file:

```env
DATABASE_URL=mysql+pymysql://root:your_password@localhost:3306/campus_db
```

Or modify `config.py`:

```python
SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://root:password@localhost:3306/campus_db'
```

### Step 4: Create Database | 步骤4: 创建数据库

Option A - Using init script (recommended):

```bash
python init_db.py
```

Option B - Using MySQL command line:

```bash
mysql -u root -p < sql/init_database.sql
```

### Step 5: Run Application | 步骤5: 运行应用

```bash
python app.py
```

Or use the startup script (Windows):

```bash
start.bat
```

### Step 6: Access | 步骤6: 访问

Open browser: http://localhost:5000

## Default Login Credentials | 默认登录账号

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| User | user | user123 |

## API Endpoints | API接口

### Authentication | 认证

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Get current user

### Students | 学生管理

- `GET /api/students` - List students
- `POST /api/students` - Add student
- `PUT /api/students/<id>` - Update student
- `DELETE /api/students/<id>` - Delete student

### Courses | 课程管理

- `GET /api/courses` - List courses
- `POST /api/courses` - Add course
- `PUT /api/courses/<id>` - Update course
- `DELETE /api/courses/<id>` - Delete course

### Scores | 成绩管理

- `GET /api/scores` - List scores
- `POST /api/scores` - Add score
- `PUT /api/scores/<id>` - Update score
- `DELETE /api/scores/<id>` - Delete score

### Dashboard | 仪表盘

- `GET /api/dashboard/stats` - Get statistics

### Analytics | 数据分析

- `GET /api/analytics/score-distribution` - Score distribution chart
- `GET /api/analytics/gpa-ranking` - GPA ranking chart
- `GET /api/analytics/course-comparison` - Course comparison chart
- `GET /api/analytics/attendance` - Attendance statistics
- `GET /api/analytics/summary` - Analytics summary

### Campus Services | 校园服务

- `GET /api/services` - List services
- `POST /api/services` - Add service
- `PUT /api/services/<id>` - Update service
- `DELETE /api/services/<id>` - Delete service

## Database Schema | 数据库结构

### users

| Field | Type | Description |
|-------|------|-------------|
| id | INT | Primary key |
| username | VARCHAR(80) | Unique username |
| password_hash | VARCHAR(255) | Hashed password |
| email | VARCHAR(120) | User email |
| role | VARCHAR(20) | Role (admin/user) |
| created_at | DATETIME | Creation timestamp |

### students

| Field | Type | Description |
|-------|------|-------------|
| id | INT | Primary key |
| student_id | VARCHAR(20) | Student number |
| name | VARCHAR(80) | Student name |
| gender | VARCHAR(10) | Gender |
| age | INT | Age |
| major | VARCHAR(80) | Major |
| grade | VARCHAR(20) | Grade |
| email | VARCHAR(120) | Email |
| phone | VARCHAR(20) | Phone |
| created_at | DATETIME | Creation timestamp |

### courses

| Field | Type | Description |
|-------|------|-------------|
| id | INT | Primary key |
| course_id | VARCHAR(20) | Course code |
| name | VARCHAR(120) | Course name |
| credits | FLOAT | Credits |
| teacher | VARCHAR(80) | Teacher |
| location | VARCHAR(120) | Location |
| max_students | INT | Max students |
| created_at | DATETIME | Creation timestamp |

### scores

| Field | Type | Description |
|-------|------|-------------|
| id | INT | Primary key |
| student_id | INT | Foreign key to students |
| course_id | INT | Foreign key to courses |
| score | FLOAT | Score |
| semester | VARCHAR(20) | Semester |
| created_at | DATETIME | Creation timestamp |

### campus_services

| Field | Type | Description |
|-------|------|-------------|
| id | INT | Primary key |
| name | VARCHAR(120) | Service name |
| service_type | VARCHAR(50) | Type |
| description | TEXT | Description |
| location | VARCHAR(200) | Location |
| open_time | VARCHAR(100) | Open hours |
| contact | VARCHAR(50) | Contact |
| created_at | DATETIME | Creation timestamp |

## Interface Design | 界面设计

- Gradient sidebar (Purple theme: #667eea to #764ba2)
- Card-based layout
- Rounded corners (12px)
- Hover effects
- Responsive design

## Troubleshooting | 常见问题

### Database Connection Error

Ensure MySQL is running and credentials are correct in config.py.

### Module Not Found

Run `pip install -r requirements.txt`

### Port Already in Use

Change port in app.py or stop the other application.

## License

MIT License
