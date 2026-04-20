-- ============================================
-- Campus Service Management System Database
-- MySQL 8.0+
-- ============================================

-- Create database
CREATE DATABASE IF NOT EXISTS campus_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE campus_db;

-- ============================================
-- Users Table (用户表)
-- ============================================
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(80) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    role VARCHAR(20) DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Students Table (学生表)
-- ============================================
DROP TABLE IF EXISTS students;
CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(80) NOT NULL,
    gender VARCHAR(10) NOT NULL,
    age INT NOT NULL,
    major VARCHAR(80) NOT NULL,
    grade VARCHAR(20) NOT NULL,
    email VARCHAR(120),
    phone VARCHAR(20),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_student_id (student_id),
    INDEX idx_name (name),
    INDEX idx_major (major)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Courses Table (课程表)
-- ============================================
DROP TABLE IF EXISTS courses;
CREATE TABLE courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(120) NOT NULL,
    credits FLOAT NOT NULL,
    teacher VARCHAR(80) NOT NULL,
    location VARCHAR(120),
    max_students INT DEFAULT 50,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_course_id (course_id),
    INDEX idx_name (name),
    INDEX idx_teacher (teacher)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Scores Table (成绩表)
-- ============================================
DROP TABLE IF EXISTS scores;
CREATE TABLE scores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    score FLOAT NOT NULL,
    semester VARCHAR(20) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    INDEX idx_student_id (student_id),
    INDEX idx_course_id (course_id),
    INDEX idx_semester (semester),
    UNIQUE KEY unique_score (student_id, course_id, semester)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Campus Services Table (校园服务表)
-- ============================================
DROP TABLE IF EXISTS campus_services;
CREATE TABLE campus_services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    service_type VARCHAR(50) NOT NULL,
    description TEXT,
    location VARCHAR(200),
    open_time VARCHAR(100),
    contact VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_service_type (service_type),
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Sample Data - Users
-- ============================================
INSERT INTO users (username, password_hash, email, role) VALUES
('admin', 'pbkdf2:sha256:600000$Xr3jH3Qx$a7c4e8f3b1d9a2c5e7f6g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f3g4h5i6j7k8l9m0n1o2p3q4r5s6t7u8v9w0x1y2z3a4b5c6d7e8f9', 'admin@campus.edu', 'admin'),
('user', 'pbkdf2:sha256:600000$Xr3jH3Qx$a7c4e8f3b1d9a2c5e7f6g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f3g4h5i6j7k8l9m0n1o2p3q4r5s6t7u8v9w0x1y2z3a4b5c6d7e8f9', 'user@campus.edu', 'user');

-- ============================================
-- Sample Data - Students
-- ============================================
INSERT INTO students (student_id, name, gender, age, major, grade, email, phone) VALUES
('S2024001', '张三', 'Male', 20, '计算机科学', '2024', 'zhangsan@campus.edu', '13800138001'),
('S2024002', '李明', 'Female', 19, '数据科学', '2024', 'liming@campus.edu', '13800138002'),
('S2024003', '王芳', 'Female', 21, '软件工程', '2023', 'wangfang@campus.edu', '13800138003'),
('S2024004', '刘强', 'Male', 22, '人工智能', '2022', 'liuqiang@campus.edu', '13800138004'),
('S2024005', '陈晓', 'Female', 20, '计算机科学', '2024', 'chenxiao@campus.edu', '13800138005'),
('S2024006', '杨慧', 'Male', 21, '信息安全', '2023', 'yanghui@campus.edu', '13800138006'),
('S2024007', '赵琳', 'Female', 19, '数据科学', '2024', 'zhaolin@campus.edu', '13800138007'),
('S2024008', '孙健', 'Male', 20, '计算机科学', '2024', 'sunjian@campus.edu', '13800138008'),
('S2024009', '周梅', 'Female', 22, '软件工程', '2022', 'zhoumei@campus.edu', '13800138009'),
('S2024010', '吴涛', 'Male', 21, '人工智能', '2023', 'wutao@campus.edu', '13800138010');

-- ============================================
-- Sample Data - Courses
-- ============================================
INSERT INTO courses (course_id, name, credits, teacher, location, max_students) VALUES
('CS101', '编程入门', 3.0, '张教授', '教学楼A101', 100),
('CS201', '数据结构与算法', 4.0, '李教授', '教学楼A202', 80),
('CS301', '数据库系统', 3.0, '王教授', '教学楼B301', 70),
('AI101', '机器学习基础', 4.0, '陈教授', '教学楼C401', 60),
('CS401', '软件工程', 3.0, '刘教授', '教学楼A102', 90),
('DS201', '统计分析', 3.0, '杨教授', '教学楼B201', 75);

-- ============================================
-- Sample Data - Scores
-- ============================================
INSERT INTO scores (student_id, course_id, score, semester) VALUES
(1, 1, 85, '2024 Spring'),
(1, 2, 78, '2024 Spring'),
(1, 3, 92, '2024 Fall'),
(2, 1, 88, '2024 Spring'),
(2, 2, 91, '2024 Spring'),
(2, 4, 85, '2024 Fall'),
(3, 1, 76, '2024 Spring'),
(3, 2, 82, '2024 Spring'),
(3, 3, 79, '2024 Fall'),
(4, 1, 90, '2024 Spring'),
(4, 2, 88, '2024 Spring'),
(4, 4, 95, '2024 Fall'),
(5, 1, 72, '2024 Spring'),
(5, 2, 68, '2024 Spring'),
(5, 3, 74, '2024 Fall'),
(6, 1, 81, '2024 Spring'),
(6, 2, 77, '2024 Spring'),
(6, 5, 83, '2024 Fall'),
(7, 1, 89, '2024 Spring'),
(7, 4, 86, '2024 Spring'),
(7, 6, 91, '2024 Fall'),
(8, 1, 84, '2024 Spring'),
(8, 2, 79, '2024 Spring'),
(8, 3, 87, '2024 Fall'),
(9, 1, 93, '2024 Spring'),
(9, 5, 88, '2024 Spring'),
(9, 6, 90, '2024 Fall'),
(10, 1, 71, '2024 Spring'),
(10, 4, 65, '2024 Spring'),
(10, 5, 78, '2024 Fall');

-- ============================================
-- Sample Data - Campus Services
-- ============================================
INSERT INTO campus_services (name, service_type, description, location, open_time, contact) VALUES
('主图书馆', 'library', '收藏丰富书籍和数字资源的中心图书馆', '校园中心大楼', '周一至周五: 8:00-22:00, 周六至周日: 9:00-21:00', 'library@campus.edu'),
('科学图书馆', 'library', '理工科专业图书馆', '科学楼2层', '周一至周五: 8:30-21:00', 'scilib@campus.edu'),
('学生食堂A', 'canteen', '提供多种菜系的主食堂', '学生服务中心', '周一至周日: 6:30-20:00', 'canteen-a@campus.edu'),
('学生食堂B', 'canteen', '国际风味餐厅', '东校区', '周一至周六: 11:00-20:30', 'canteen-b@campus.edu'),
('宿舍楼1号楼', 'dormitory', '现代化设施的本科生宿舍', '北校区', '24小时开放', 'dorm1@campus.edu'),
('宿舍楼3号楼', 'dormitory', '研究生宿舍', '北校区', '24小时开放', 'dorm3@campus.edu'),
('校园巴士', 'transportation', '校区间接驳巴士服务', '南门站', '每15分钟一班, 7:00-23:00', 'transport@campus.edu'),
('校医院', 'health', '为师生提供医疗服务', '校园东侧', '周一至周五: 8:00-18:00', 'health@campus.edu'),
('体育中心', 'sports', '健身房、游泳池和健身设施', '西校区', '周一至周日: 6:00-22:00', 'sports@campus.edu'),
('学生活动中心', 'activity', '社团、活动和学生组织办公室', '学生中心3层', '周一至周日: 9:00-21:00', 'activity@campus.edu');

-- ============================================
-- Verify data
-- ============================================
SELECT 'Users count:' AS info, COUNT(*) AS count FROM users
UNION ALL
SELECT 'Students count:', COUNT(*) FROM students
UNION ALL
SELECT 'Courses count:', COUNT(*) FROM courses
UNION ALL
SELECT 'Scores count:', COUNT(*) FROM scores
UNION ALL
SELECT 'Services count:', COUNT(*) FROM campus_services;
