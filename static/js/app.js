let currentUser = null;
let currentPage = 'dashboard';

const API_BASE = '/api';

function getToken() {
    return localStorage.getItem('token');
}

function getUser() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            return JSON.parse(userStr);
        } catch {
            return null;
        }
    }
    return null;
}

async function apiRequest(endpoint, options = {}) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                logout();
            }
            throw new Error(data.error || 'Request failed');
        }

        return data;
    } catch (error) {
        throw error;
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
}

function setUserInfo() {
    const user = getUser();
    if (user) {
        currentUser = user;
        document.getElementById('user-name').textContent = user.username;
        document.getElementById('user-avatar').textContent = user.username.charAt(0).toUpperCase();
    }
}

function showAlert(message, type = 'success') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    alertDiv.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999; min-width: 250px;';
    document.body.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 3000);
}

function showLoading() {
    return '<div class="loading"><div class="spinner"></div></div>';
}

function renderDashboard() {
    return `
        <div class="welcome-banner">
            <h2>欢迎回来，${currentUser?.username || '用户'}!</h2>
            <p>校园服务管理系统</p>
            <div class="quick-actions">
                    <button class="quick-action-btn" onclick="navigateTo('students')">
                        <i class="fa fa-user"></i>学生管理
                    </button>
                    <button class="quick-action-btn" onclick="navigateTo('courses')">
                        <i class="fa fa-book"></i>课程管理
                    </button>
                    <button class="quick-action-btn" onclick="navigateTo('scores')">
                        <i class="fa fa-graduation-cap"></i>成绩录入
                    </button>
                    <button class="quick-action-btn" onclick="navigateTo('analytics')">
                        <i class="fa fa-bar-chart"></i>数据分析
                    </button>
                </div>
        </div>
        <div id="stats-container">
            ${showLoading()}
        </div>
    `;
}

async function loadDashboardStats() {
    try {
        const data = await apiRequest('/dashboard/stats');
        const container = document.getElementById('stats-container');
        if (container) {
            container.innerHTML = `
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon blue"><i class="fa fa-user"></i></div>
                        <div class="stat-value">${data.total_students}</div>
                        <div class="stat-label">学生总数</div>
                    </div>
                    <div class="stat-card success">
                        <div class="stat-icon green"><i class="fa fa-book"></i></div>
                        <div class="stat-value">${data.total_courses}</div>
                        <div class="stat-label">课程总数</div>
                    </div>
                    <div class="stat-card warning">
                        <div class="stat-icon purple"><i class="fa fa-bar-chart"></i></div>
                        <div class="stat-value">${data.average_score}</div>
                        <div class="stat-label">平均分</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon orange"><i class="fa fa-check-circle"></i></div>
                        <div class="stat-value">${data.pass_rate}%</div>
                        <div class="stat-label">及格率</div>
                    </div>
                </div>
            `;
        }
    } catch (error) {
        console.error('Failed to load stats:', error);
    }
}

function renderStudents() {
    return `
        <div class="card">
            <div class="card-header">
                <h3>学生列表</h3>
                <button class="btn btn-primary" onclick="openStudentModal()">+ 添加学生</button>
            </div>
            <div class="card-body">
                <div class="search-bar">
                    <input type="text" id="student-search" placeholder="搜索学生姓名、学号、专业..." onkeyup="searchStudents()">
                </div>
                <div id="students-table">
                    ${showLoading()}
                </div>
            </div>
        </div>
    `;
}

function renderStudentModal(student = null) {
    const isEdit = student !== null;
    const prefix = isEdit ? 'edit' : 'add';
    return `
        <div class="modal-overlay" id="student-modal">
            <div class="modal">
                <div class="modal-header">
                    <h3>${isEdit ? '编辑学生' : '添加学生'}</h3>
                    <button class="modal-close" onclick="closeStudentModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="student-${prefix}-form">
                        <input type="hidden" id="student-${prefix}-id" value="${student?.id || ''}">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="student-${prefix}-id-input">学号</label>
                                <input type="text" id="student-${prefix}-id-input" value="${student?.student_id || ''}" ${isEdit ? 'readonly' : ''} required>
                            </div>
                            <div class="form-group">
                                <label for="student-${prefix}-name">姓名</label>
                                <input type="text" id="student-${prefix}-name" value="${student?.name || ''}" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="student-${prefix}-gender">性别</label>
                                <select id="student-${prefix}-gender" required>
                                    <option value="">请选择</option>
                                    <option value="男" ${student?.gender === '男' ? 'selected' : ''}>男</option>
                                    <option value="女" ${student?.gender === '女' ? 'selected' : ''}>女</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="student-${prefix}-age">年龄</label>
                                <input type="number" id="student-${prefix}-age" value="${student?.age || ''}" min="15" max="50" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="student-${prefix}-major">专业</label>
                                <input type="text" id="student-${prefix}-major" value="${student?.major || ''}" required>
                            </div>
                            <div class="form-group">
                                <label for="student-${prefix}-grade">年级</label>
                                <input type="text" id="student-${prefix}-grade" value="${student?.grade || ''}" placeholder="如: 2024" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="student-${prefix}-email">邮箱</label>
                                <input type="email" id="student-${prefix}-email" value="${student?.email || ''}">
                            </div>
                            <div class="form-group">
                                <label for="student-${prefix}-phone">电话</label>
                                <input type="text" id="student-${prefix}-phone" value="${student?.phone || ''}">
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeStudentModal()">取消</button>
                    <button class="btn btn-primary" onclick="${isEdit ? 'submitEditStudent()' : 'submitAddStudent()'}">保存</button>
                </div>
            </div>
        </div>
    `;
}

function openStudentModal(student = null) {
    closeStudentModal();
    const modalHtml = renderStudentModal(student);
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    document.getElementById('student-modal').classList.add('active');
}

function closeStudentModal() {
    const modal = document.getElementById('student-modal');
    if (modal) modal.remove();
}

function editStudent(student) {
    openStudentModal(student);
}

async function editStudentById(id) {
    try {
        const student = await apiRequest(`/students/${id}`);
        openStudentModal(student);
    } catch (error) {
        showAlert('加载学生信息失败', 'error');
    }
}

async function deleteStudent(id) {
    if (!confirm('确定要删除该学生吗？此操作不可撤销。')) return;

    try {
        await apiRequest(`/students/${id}`, { method: 'DELETE' });
        showAlert('学生删除成功');
        loadStudents();
    } catch (error) {
        showAlert(error.message, 'error');
    }
}

async function loadStudents(search = '') {
    try {
        const endpoint = search ? `/students?search=${encodeURIComponent(search)}` : '/students';
        const data = await apiRequest(endpoint);
        const container = document.getElementById('students-table');
        if (container) {
            if (data.students.length === 0) {
                container.innerHTML = '<div class="empty-state"><p>暂无学生数据</p></div>';
            } else {
                container.innerHTML = `
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>学号</th>
                                    <th>姓名</th>
                                    <th>性别</th>
                                    <th>年龄</th>
                                    <th>专业</th>
                                    <th>年级</th>
                                    <th>邮箱</th>
                                    <th>电话</th>
                                    <th>操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.students.map(s => `
                                    <tr>
                                        <td>${s.student_id}</td>
                                        <td>${s.name}</td>
                                        <td>${s.gender === '男' ? '男' : '女'}</td>
                                        <td>${s.age}</td>
                                        <td>${s.major}</td>
                                        <td>${s.grade}</td>
                                        <td>${s.email || '-'}</td>
                                        <td>${s.phone || '-'}</td>
                                        <td>
                                            <div class="action-btns">
                                                <button class="action-btn edit" data-id="${s.id}" onclick="editStudentById(${s.id})">编辑</button>
                                                <button class="action-btn delete" onclick="deleteStudent(${s.id})">删除</button>
                                            </div>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `;
            }
        }
    } catch (error) {
        showAlert('加载学生数据失败', 'error');
    }
}

function searchStudents() {
    const search = document.getElementById('student-search').value;
    loadStudents(search);
}

async function submitAddStudent() {
    const data = {
        student_id: document.getElementById('student-add-id-input').value,
        name: document.getElementById('student-add-name').value,
        gender: document.getElementById('student-add-gender').value,
        age: parseInt(document.getElementById('student-add-age').value),
        major: document.getElementById('student-add-major').value,
        grade: document.getElementById('student-add-grade').value,
        email: document.getElementById('student-add-email').value,
        phone: document.getElementById('student-add-phone').value
    };
    console.log('提交添加学生数据:', data);

    try {
        const response = await apiRequest('/students', { method: 'POST', body: JSON.stringify(data) });
        console.log('添加学生成功:', response);
        showAlert('学生添加成功');
        closeStudentModal();
        loadStudents();
    } catch (error) {
        console.error('添加学生失败:', error);
        showAlert(error.message, 'error');
    }
}

async function submitEditStudent() {
    const id = document.getElementById('student-edit-id').value;
    const data = {
        student_id: document.getElementById('student-edit-id-input').value,
        name: document.getElementById('student-edit-name').value,
        gender: document.getElementById('student-edit-gender').value,
        age: parseInt(document.getElementById('student-edit-age').value),
        major: document.getElementById('student-edit-major').value,
        grade: document.getElementById('student-edit-grade').value,
        email: document.getElementById('student-edit-email').value,
        phone: document.getElementById('student-edit-phone').value
    };
    console.log('提交编辑学生数据:', { id, data });

    try {
        const response = await apiRequest(`/students/${id}`, { method: 'PUT', body: JSON.stringify(data) });
        console.log('编辑学生成功:', response);
        showAlert('学生信息更新成功');
        closeStudentModal();
        loadStudents();
    } catch (error) {
        console.error('编辑学生失败:', error);
        showAlert(error.message, 'error');
    }
}

function renderCourses() {
    return `
        <div class="card">
            <div class="card-header">
                <h3>课程列表</h3>
                <button class="btn btn-primary" onclick="openCourseModal()">+ 添加课程</button>
            </div>
            <div class="card-body">
                <div class="search-bar">
                    <input type="text" id="course-search" placeholder="搜索课程名称、课程号、教师..." onkeyup="searchCourses()">
                </div>
                <div id="courses-table">
                    ${showLoading()}
                </div>
            </div>
        </div>
    `;
}

function renderCourseModal(course = null) {
    const isEdit = course !== null;
    const prefix = isEdit ? 'edit' : 'add';
    return `
        <div class="modal-overlay" id="course-modal">
            <div class="modal">
                <div class="modal-header">
                    <h3>${isEdit ? '编辑课程' : '添加课程'}</h3>
                    <button class="modal-close" onclick="closeCourseModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="course-${prefix}-form">
                        <input type="hidden" id="course-${prefix}-id" value="${course?.id || ''}">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="course-${prefix}-code">课程号</label>
                                <input type="text" id="course-${prefix}-code" value="${course?.course_id || ''}" ${isEdit ? 'readonly' : ''} required>
                            </div>
                            <div class="form-group">
                                <label for="course-${prefix}-name">课程名称</label>
                                <input type="text" id="course-${prefix}-name" value="${course?.name || ''}" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="course-${prefix}-credits">学分</label>
                                <input type="number" id="course-${prefix}-credits" value="${course?.credits || ''}" step="0.5" min="0.5" max="10" required>
                            </div>
                            <div class="form-group">
                                <label for="course-${prefix}-teacher">授课教师</label>
                                <input type="text" id="course-${prefix}-teacher" value="${course?.teacher || ''}" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="course-${prefix}-location">上课地点</label>
                                <input type="text" id="course-${prefix}-location" value="${course?.location || ''}">
                            </div>
                            <div class="form-group">
                                <label for="course-${prefix}-max">人数上限</label>
                                <input type="number" id="course-${prefix}-max" value="${course?.max_students || 50}" min="1" max="500">
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeCourseModal()">取消</button>
                    <button class="btn btn-primary" onclick="${isEdit ? 'submitEditCourse()' : 'submitAddCourse()'}">保存</button>
                </div>
            </div>
        </div>
    `;
}

function openCourseModal(course = null) {
    console.log('打开课程弹窗:', course);
    closeCourseModal();
    const modalHtml = renderCourseModal(course);
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    document.getElementById('course-modal').classList.add('active');
}

function closeCourseModal() {
    const modal = document.getElementById('course-modal');
    if (modal) modal.remove();
}

function editCourse(course) {
    openCourseModal(course);
}

async function editCourseById(id) {
    try {
        const course = await apiRequest(`/courses/${id}`);
        openCourseModal(course);
    } catch (error) {
        showAlert('加载课程信息失败', 'error');
    }
}

async function deleteCourse(id) {
    if (!confirm('确定要删除该课程吗？')) return;

    try {
        await apiRequest(`/courses/${id}`, { method: 'DELETE' });
        showAlert('课程删除成功');
        loadCourses();
    } catch (error) {
        showAlert(error.message, 'error');
    }
}

async function loadCourses(search = '') {
    try {
        const endpoint = search ? `/courses?search=${encodeURIComponent(search)}` : '/courses';
        const data = await apiRequest(endpoint);
        const container = document.getElementById('courses-table');
        if (container) {
            if (data.courses.length === 0) {
                container.innerHTML = '<div class="empty-state"><p>暂无课程数据</p></div>';
            } else {
                container.innerHTML = `
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>课程号</th>
                                    <th>课程名称</th>
                                    <th>学分</th>
                                    <th>授课教师</th>
                                    <th>上课地点</th>
                                    <th>人数上限</th>
                                    <th>操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.courses.map(c => `
                                    <tr>
                                        <td>${c.course_id}</td>
                                        <td>${c.name}</td>
                                        <td>${c.credits}</td>
                                        <td>${c.teacher}</td>
                                        <td>${c.location || '-'}</td>
                                        <td>${c.max_students}</td>
                                        <td>
                                            <div class="action-btns">
                                                <button class="action-btn edit" data-id="${c.id}" onclick="editCourseById(${c.id})">编辑</button>
                                                <button class="action-btn delete" onclick="deleteCourse(${c.id})">删除</button>
                                            </div>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `;
            }
        }
    } catch (error) {
        showAlert('加载课程数据失败', 'error');
    }
}

function searchCourses() {
    const search = document.getElementById('course-search').value;
    loadCourses(search);
}

async function submitAddCourse() {
    const data = {
        course_id: document.getElementById('course-add-code').value,
        name: document.getElementById('course-add-name').value,
        credits: parseFloat(document.getElementById('course-add-credits').value),
        teacher: document.getElementById('course-add-teacher').value,
        location: document.getElementById('course-add-location').value,
        max_students: parseInt(document.getElementById('course-add-max').value)
    };
    console.log('提交添加课程数据:', data);

    try {
        const response = await apiRequest('/courses', { method: 'POST', body: JSON.stringify(data) });
        console.log('添加课程成功:', response);
        showAlert('课程添加成功');
        closeCourseModal();
        loadCourses();
    } catch (error) {
        console.error('添加课程失败:', error);
        showAlert(error.message, 'error');
    }
}

async function submitEditCourse() {
    const id = document.getElementById('course-edit-id').value;
    const data = {
        course_id: document.getElementById('course-edit-code').value,
        name: document.getElementById('course-edit-name').value,
        credits: parseFloat(document.getElementById('course-edit-credits').value),
        teacher: document.getElementById('course-edit-teacher').value,
        location: document.getElementById('course-edit-location').value,
        max_students: parseInt(document.getElementById('course-edit-max').value)
    };
    console.log('提交编辑课程数据:', { id, data });

    try {
        const response = await apiRequest(`/courses/${id}`, { method: 'PUT', body: JSON.stringify(data) });
        console.log('编辑课程成功:', response);
        showAlert('课程信息更新成功');
        closeCourseModal();
        loadCourses();
    } catch (error) {
        console.error('编辑课程失败:', error);
        showAlert(error.message, 'error');
    }
}

function renderScores() {
    return `
        <div class="card">
            <div class="card-header">
                <h3>成绩列表</h3>
                <button class="btn btn-primary" onclick="openScoreModal()">+ 录入成绩</button>
            </div>
            <div class="card-body">
                <div class="filter-group">
                <button class="filter-btn active" onclick="filterScores('all')">全部</button>
                <button class="filter-btn" onclick="filterScores('2024年春季')">2024年春季</button>
                <button class="filter-btn" onclick="filterScores('2024年秋季')">2024年秋季</button>
            </div>
                <div id="scores-table">
                    ${showLoading()}
                </div>
            </div>
        </div>
    `;
}

async function openScoreModal() {
    try {
        console.log('打开成绩弹窗');
        closeScoreModal();
        const [students, courses] = await Promise.all([
            apiRequest('/students'),
            apiRequest('/courses')
        ]);
        console.log('加载学生和课程数据:', { students, courses });

        const modalHtml = `
            <div class="modal-overlay" id="score-modal">
                <div class="modal">
                    <div class="modal-header">
                        <h3>录入成绩</h3>
                        <button class="modal-close" onclick="closeScoreModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="score-add-form">
                            <div class="form-group">
                                <label for="score-add-student">学生</label>
                                <select id="score-add-student" required>
                                    <option value="">请选择学生</option>
                                    ${students.students.map(s => `<option value="${s.id}">${s.name} (${s.student_id})</option>`).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="score-add-course">课程</label>
                                <select id="score-add-course" required>
                                    <option value="">请选择课程</option>
                                    ${courses.courses.map(c => `<option value="${c.id}">${c.name} (${c.course_id})</option>`).join('')}
                                </select>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="score-add-value">分数</label>
                                    <input type="number" id="score-add-value" min="0" max="100" step="0.1" required>
                                </div>
                                <div class="form-group">
                                <label for="score-add-semester">学期</label>
                                <select id="score-add-semester" required>
                                    <option value="">请选择学期</option>
                                    <option value="2024年春季">2024年春季</option>
                                    <option value="2024年秋季">2024年秋季</option>
                                </select>
                            </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="closeScoreModal()">取消</button>
                        <button class="btn btn-primary" onclick="submitAddScore()">保存</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        document.getElementById('score-modal').classList.add('active');
    } catch (error) {
        showAlert('加载数据失败', 'error');
    }
}

function closeScoreModal() {
    const modal = document.getElementById('score-modal');
    if (modal) modal.remove();
}

async function deleteScore(id) {
    if (!confirm('确定要删除该成绩吗？')) return;

    try {
        await apiRequest(`/scores/${id}`, { method: 'DELETE' });
        showAlert('成绩删除成功');
        loadScores();
    } catch (error) {
        showAlert(error.message, 'error');
    }
}

async function loadScores(semester = 'all') {
    try {
        const endpoint = semester === 'all' ? '/scores' : `/scores?semester=${encodeURIComponent(semester)}`;
        const data = await apiRequest(endpoint);
        const container = document.getElementById('scores-table');
        if (container) {
            if (data.scores.length === 0) {
                container.innerHTML = '<div class="empty-state"><p>暂无成绩数据</p></div>';
            } else {
                container.innerHTML = `
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>学生姓名</th>
                                    <th>课程名称</th>
                                    <th>分数</th>
                                    <th>学期</th>
                                    <th>操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.scores.map(s => `
                                    <tr>
                                        <td>${s.student_name}</td>
                                        <td>${s.course_name}</td>
                                        <td><span class="badge ${s.score >= 60 ? 'badge-success' : 'badge-danger'}">${s.score}</span></td>
                                        <td>${s.semester}</td>
                                        <td>
                                            <div class="action-btns">
                                                <button class="action-btn delete" onclick="deleteScore(${s.id})">删除</button>
                                            </div>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `;
            }
        }
    } catch (error) {
        showAlert('加载成绩数据失败', 'error');
    }
}

function filterScores(semester) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    loadScores(semester);
}

async function submitAddScore() {
    const data = {
        student_id: parseInt(document.getElementById('score-add-student').value),
        course_id: parseInt(document.getElementById('score-add-course').value),
        score: parseFloat(document.getElementById('score-add-value').value),
        semester: document.getElementById('score-add-semester').value
    };
    console.log('提交添加成绩数据:', data);

    try {
        const response = await apiRequest('/scores', { method: 'POST', body: JSON.stringify(data) });
        console.log('添加成绩成功:', response);
        showAlert('成绩录入成功');
        closeScoreModal();
        loadScores();
    } catch (error) {
        console.error('添加成绩失败:', error);
        showAlert(error.message, 'error');
    }
}

function renderAnalytics() {
    return `
        <div class="card">
            <div class="card-header">
                <h3>数据分析</h3>
            </div>
            <div class="card-body">
                <div id="analytics-summary" class="analytics-summary">
                    ${showLoading()}
                </div>
                <div id="analytics-charts" class="chart-container">
                    ${showLoading()}
                </div>
            </div>
        </div>
    `;
}

async function loadAnalytics() {
    try {
        const [distribution, gpaRanking, courseComparison] = await Promise.all([
            apiRequest('/analytics/score-distribution'),
            apiRequest('/analytics/gpa-ranking'),
            apiRequest('/analytics/course-comparison')
        ]);

        const summaryContainer = document.getElementById('analytics-summary');
        if (summaryContainer && distribution.stats) {
            summaryContainer.innerHTML = `
                <div class="summary-item">
                    <div class="value">${distribution.stats.avg}</div>
                    <div class="label">平均分</div>
                </div>
                <div class="summary-item">
                    <div class="value">${distribution.stats.max}</div>
                    <div class="label">最高分</div>
                </div>
                <div class="summary-item">
                    <div class="value">${distribution.stats.min}</div>
                    <div class="label">最低分</div>
                </div>
                <div class="summary-item">
                    <div class="value">${distribution.stats.pass_rate}%</div>
                    <div class="label">及格率</div>
                </div>
            `;
        }

        const chartsContainer = document.getElementById('analytics-charts');
        if (chartsContainer) {
            let chartsHtml = '';

            if (distribution.image) {
                chartsHtml += `
                    <div class="chart-card">
                        <h4>成绩分布直方图</h4>
                        <img src="${distribution.image}" alt="成绩分布直方图">
                    </div>
                `;
            }

            if (courseComparison.image) {
                chartsHtml += `
                    <div class="chart-card">
                        <h4>课程平均分对比</h4>
                        <img src="${courseComparison.image}" alt="课程平均分对比">
                    </div>
                `;
            }

            if (!chartsHtml) {
                chartsHtml = '<div class="empty-state"><p>暂无图表数据</p></div>';
            }

            chartsContainer.innerHTML = chartsHtml;
        }
    } catch (error) {
        showAlert('加载分析数据失败', 'error');
    }
}

function renderServices() {
    return `
        <div class="card">
            <div class="card-header">
                <h3>校园服务</h3>
                <button class="btn btn-primary" onclick="openServiceModal()">添加服务</button>
            </div>
            <div class="card-body">
                <div class="filter-group" id="services-filter">
                    <button class="filter-btn active" onclick="filterServices('all')">全部</button>
                    <button class="filter-btn" onclick="filterServices('library')">图书馆</button>
                    <button class="filter-btn" onclick="filterServices('canteen')">食堂</button>
                    <button class="filter-btn" onclick="filterServices('dormitory')">宿舍</button>
                    <button class="filter-btn" onclick="filterServices('transportation')">交通</button>
                    <button class="filter-btn" onclick="filterServices('health')">医疗</button>
                    <button class="filter-btn" onclick="filterServices('sports')">体育</button>
                    <button class="filter-btn" onclick="filterServices('activity')">活动</button>
                </div>
                <div id="services-container">
                    ${showLoading()}
                </div>
            </div>
        </div>
    `;
}

async function loadServices(type = 'all') {
    try {
        const endpoint = type === 'all' ? '/services' : `/services?type=${encodeURIComponent(type)}`;
        const data = await apiRequest(endpoint);
        const container = document.getElementById('services-container');
        if (container) {
            if (data.services.length === 0) {
                container.innerHTML = '<div class="empty-state"><p>暂无服务数据</p></div>';
            } else {
                const typeLabels = {
                    'library': '图书馆',
                    'canteen': '食堂',
                    'dormitory': '宿舍',
                    'transportation': '交通',
                    'health': '医疗',
                    'sports': '体育',
                    'activity': '活动'
                };

                container.innerHTML = data.services.map(s => `
                    <div class="service-card">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                            <span class="service-type">${typeLabels[s.service_type] || s.service_type}</span>
                            <div class="action-btns">
                                <button class="action-btn edit" onclick="editService(${s.id})">编辑</button>
                                <button class="action-btn delete" onclick="deleteService(${s.id})">删除</button>
                            </div>
                        </div>
                        <h4 style="margin: 10px 0; color: #333;">${s.name}</h4>
                        <p style="color: #666; font-size: 14px;">${s.description || ''}</p>
                        <div class="service-info">
                            ${s.location ? `<p><i class="fa fa-map-marker"></i>${s.location}</p>` : ''}
                            ${s.open_time ? `<p><i class="fa fa-clock-o"></i>${s.open_time}</p>` : ''}
                            ${s.contact ? `<p><i class="fa fa-phone"></i>${s.contact}</p>` : ''}
                        </div>
                    </div>
                `).join('');
            }
        }
    } catch (error) {
        showAlert('加载服务数据失败', 'error');
    }
}

async function filterServices(type) {
    document.querySelectorAll('#services-filter .filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    loadServices(type);
}

function renderServiceModal(service = null) {
    const isEdit = service !== null;
    const prefix = isEdit ? 'edit' : 'add';
    return `
        <div class="modal-overlay" id="service-modal">
            <div class="modal">
                <div class="modal-header">
                    <h3>${isEdit ? '编辑服务' : '添加服务'}</h3>
                    <button class="modal-close" onclick="closeServiceModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="service-${prefix}-form">
                        <input type="hidden" id="service-${prefix}-id" value="${service?.id || ''}">
                        <div class="form-group">
                            <label for="service-${prefix}-name">服务名称</label>
                            <input type="text" id="service-${prefix}-name" value="${service?.name || ''}" required>
                        </div>
                        <div class="form-group">
                            <label for="service-${prefix}-type">服务类型</label>
                            <select id="service-${prefix}-type" required>
                                <option value="library" ${service?.service_type === 'library' ? 'selected' : ''}>图书馆</option>
                                <option value="canteen" ${service?.service_type === 'canteen' ? 'selected' : ''}>食堂</option>
                                <option value="dormitory" ${service?.service_type === 'dormitory' ? 'selected' : ''}>宿舍</option>
                                <option value="transportation" ${service?.service_type === 'transportation' ? 'selected' : ''}>交通</option>
                                <option value="health" ${service?.service_type === 'health' ? 'selected' : ''}>医疗</option>
                                <option value="sports" ${service?.service_type === 'sports' ? 'selected' : ''}>体育</option>
                                <option value="activity" ${service?.service_type === 'activity' ? 'selected' : ''}>活动</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="service-${prefix}-description">描述</label>
                            <textarea id="service-${prefix}-description" rows="3">${service?.description || ''}</textarea>
                        </div>
                        <div class="form-group">
                            <label for="service-${prefix}-location">地点</label>
                            <input type="text" id="service-${prefix}-location" value="${service?.location || ''}">
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="service-${prefix}-open-time">开放时间</label>
                                <input type="text" id="service-${prefix}-open-time" value="${service?.open_time || ''}">
                            </div>
                            <div class="form-group">
                                <label for="service-${prefix}-contact">联系方式</label>
                                <input type="text" id="service-${prefix}-contact" value="${service?.contact || ''}">
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeServiceModal()">取消</button>
                    <button class="btn btn-primary" onclick="${isEdit ? 'submitEditService()' : 'submitAddService()'}">保存</button>
                </div>
            </div>
        </div>
    `;
}

async function editService(id) {
    try {
        console.log('编辑服务:', id);
        const service = await apiRequest(`/services/${id}`);
        console.log('获取服务详情:', service);
        openServiceModal(service);
    } catch (error) {
        console.error('获取服务详情失败:', error);
        showAlert('获取服务详情失败', 'error');
    }
}

function openServiceModal(service = null) {
    console.log('打开服务弹窗:', service);
    closeServiceModal();
    const modalHtml = renderServiceModal(service);
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    document.getElementById('service-modal').classList.add('active');
}

function closeServiceModal() {
    const modal = document.getElementById('service-modal');
    if (modal) modal.remove();
}

async function submitAddService() {
    const data = {
        name: document.getElementById('service-add-name').value,
        service_type: document.getElementById('service-add-type').value,
        description: document.getElementById('service-add-description').value,
        location: document.getElementById('service-add-location').value,
        open_time: document.getElementById('service-add-open-time').value,
        contact: document.getElementById('service-add-contact').value
    };
    console.log('提交添加服务数据:', data);

    try {
        const response = await apiRequest('/services', { method: 'POST', body: JSON.stringify(data) });
        console.log('添加服务成功:', response);
        showAlert('服务添加成功');
        closeServiceModal();
        loadServices();
    } catch (error) {
        console.error('添加服务失败:', error);
        showAlert(error.message, 'error');
    }
}

async function submitEditService() {
    const id = document.getElementById('service-edit-id').value;
    const data = {
        name: document.getElementById('service-edit-name').value,
        service_type: document.getElementById('service-edit-type').value,
        description: document.getElementById('service-edit-description').value,
        location: document.getElementById('service-edit-location').value,
        open_time: document.getElementById('service-edit-open-time').value,
        contact: document.getElementById('service-edit-contact').value
    };
    console.log('提交编辑服务数据:', { id, data });

    try {
        const response = await apiRequest(`/services/${id}`, { method: 'PUT', body: JSON.stringify(data) });
        console.log('编辑服务成功:', response);
        showAlert('服务信息更新成功');
        closeServiceModal();
        loadServices();
    } catch (error) {
        console.error('编辑服务失败:', error);
        showAlert(error.message, 'error');
    }
}

async function deleteService(id) {
    if (!confirm('确定要删除该服务吗？')) return;

    try {
        await apiRequest(`/services/${id}`, { method: 'DELETE' });
        showAlert('服务删除成功');
        loadServices();
    } catch (error) {
        showAlert(error.message, 'error');
    }
}

async function navigateTo(page) {
    currentPage = page;
    const mainArea = document.getElementById('main-content-area');
    const pageTitle = document.getElementById('page-title');

    document.querySelectorAll('.sidebar-menu a[data-page]').forEach(a => a.classList.remove('active'));
    const activeLink = document.querySelector(`.sidebar-menu a[data-page="${page}"]`);
    if (activeLink) activeLink.classList.add('active');

    switch (page) {
        case 'dashboard':
            pageTitle.textContent = '仪表盘';
            mainArea.innerHTML = renderDashboard();
            loadDashboardStats();
            break;
        case 'students':
            pageTitle.textContent = '学生管理';
            mainArea.innerHTML = renderStudents();
            loadStudents();
            break;
        case 'courses':
            pageTitle.textContent = '课程管理';
            mainArea.innerHTML = renderCourses();
            loadCourses();
            break;
        case 'scores':
            pageTitle.textContent = '成绩管理';
            mainArea.innerHTML = renderScores();
            loadScores();
            break;
        case 'analytics':
            pageTitle.textContent = '数据分析';
            mainArea.innerHTML = renderAnalytics();
            loadAnalytics();
            break;
        case 'services':
            pageTitle.textContent = '校园服务';
            mainArea.innerHTML = renderServices();
            loadServices();
            break;
        default:
            pageTitle.textContent = '仪表盘';
            mainArea.innerHTML = renderDashboard();
            loadDashboardStats();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (!getToken()) {
        window.location.href = '/login';
        return;
    }

    setUserInfo();

    document.querySelectorAll('.sidebar-menu a[data-page]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.getAttribute('data-page');
            navigateTo(page);
        });
    });

    document.getElementById('logout-btn').addEventListener('click', (e) => {
        e.preventDefault();
        logout();
    });

    navigateTo('dashboard');
});
