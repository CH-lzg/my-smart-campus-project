let currentUser = null;
let currentPage = 'my-dashboard';

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

        if (response.status === 401) {
            logout();
            throw new Error('Unauthorized');
        }

        const data = await response.json();

        if (!response.ok) {
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
    window.location.href = '/student/login';
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

function setUserInfo() {
    const user = getUser();
    if (user) {
        currentUser = user;
        document.getElementById('user-name').textContent = user.name || user.username;
        document.getElementById('user-avatar').textContent = (user.name || user.username).charAt(0).toUpperCase();
    }
}

function renderMyDashboard() {
    return `
        <div class="welcome-banner">
            <h2>欢迎回来，${currentUser?.name || currentUser?.username || '同学'}!</h2>
            <p>查看你的学习情况、课程成绩和校园服务</p>
        </div>
        <div id="stats-container">
            ${showLoading()}
        </div>
        <div style="margin-top: 20px;">
            <h3 style="margin-bottom: 15px; color: #333;">快捷功能</h3>
            <div class="quick-actions">
                <button class="quick-action-btn" onclick="navigateTo('my-courses')">
                    <i class="fa fa-book"></i>
                    <div>我的课程</div>
                </button>
                <button class="quick-action-btn" onclick="navigateTo('my-scores')">
                    <i class="fa fa-graduation-cap"></i>
                    <div>我的成绩</div>
                </button>
                <button class="quick-action-btn" onclick="navigateTo('my-profile')">
                    <i class="fa fa-cog"></i>
                    <div>个人信息</div>
                </button>
                <button class="quick-action-btn" onclick="navigateTo('campus-services')">
                    <i class="fa fa-building"></i>
                    <div>校园服务</div>
                </button>
            </div>
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
                        <div class="stat-icon blue"><i class="fa fa-book"></i></div>
                        <div class="stat-value">${data.total_courses}</div>
                        <div class="stat-label">选修课程</div>
                    </div>
                    <div class="stat-card success">
                        <div class="stat-icon green"><i class="fa fa-bar-chart"></i></div>
                        <div class="stat-value">${data.average_score}</div>
                        <div class="stat-label">平均成绩</div>
                    </div>
                    <div class="stat-card warning">
                        <div class="stat-icon purple"><i class="fa fa-check-circle"></i></div>
                        <div class="stat-value">${data.pass_rate}%</div>
                        <div class="stat-label">及格率</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon orange"><i class="fa fa-building"></i></div>
                        <div class="stat-value">${data.total_services}</div>
                        <div class="stat-label">校园服务</div>
                    </div>
                </div>
            `;
        }
    } catch (error) {
        console.error('Failed to load stats:', error);
    }
}

function renderMyCourses() {
    return `
        <div class="card">
            <div class="card-header">
                <h3>我的课程</h3>
            </div>
            <div class="card-body">
                <div id="courses-container">
                    ${showLoading()}
                </div>
            </div>
        </div>
    `;
}

async function loadMyCourses() {
    try {
        const data = await apiRequest('/courses');
        const container = document.getElementById('courses-container');
        if (container) {
            if (data.courses.length === 0) {
                container.innerHTML = '<div class="empty-state"><p>暂无课程数据</p></div>';
            } else {
                container.innerHTML = data.courses.map(c => `
                    <div class="course-card">
                        <h4>${c.name}</h4>
                        <div class="course-info">
                            <span><i class="fa fa-book"></i> ${c.course_id}</span>
                            <span><i class="fa fa-user"></i> ${c.teacher}</span>
                            <span><i class="fa fa-map-marker"></i> ${c.location || '待定'}</span>
                            <span><i class="fa fa-star"></i> ${c.credits} 学分</span>
                        </div>
                    </div>
                `).join('');
            }
        }
    } catch (error) {
        showAlert('加载课程数据失败', 'error');
    }
}

function renderMyScores() {
    return `
        <div class="card">
            <div class="card-header">
                <h3>我的成绩</h3>
            </div>
            <div class="card-body">
                <div id="scores-container">
                    ${showLoading()}
                </div>
            </div>
        </div>
    `;
}

async function loadMyScores() {
    try {
        const data = await apiRequest('/scores');
        const container = document.getElementById('scores-container');
        if (container) {
            if (data.scores.length === 0) {
                container.innerHTML = '<div class="empty-state"><p>暂无成绩数据</p></div>';
            } else {
                container.innerHTML = `
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>课程名称</th>
                                    <th>学期</th>
                                    <th>成绩</th>
                                    <th>等级</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.scores.map(s => {
                    let grade = '';
                    if (s.score >= 90) grade = 'A';
                    else if (s.score >= 80) grade = 'B';
                    else if (s.score >= 70) grade = 'C';
                    else if (s.score >= 60) grade = 'D';
                    else grade = 'F';

                    let badgeClass = s.score >= 60 ? 'badge-success' : 'badge-danger';
                    return `
                                        <tr>
                                            <td>${s.course_name}</td>
                                            <td>${s.semester}</td>
                                            <td><span class="badge ${badgeClass}">${s.score}</span></td>
                                            <td><span class="badge badge-warning">${grade}</span></td>
                                        </tr>
                                    `;
                }).join('')}
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

function renderMyProfile() {
    return `
        <div class="profile-section">
            <div style="display: flex; align-items: center; gap: 20px;">
                <div class="profile-avatar">${(currentUser?.name || currentUser?.username)?.charAt(0).toUpperCase() || 'S'}</div>
                <div class="profile-info">
                    <h3>${currentUser?.name || currentUser?.username || '学生'}</h3>
                    <p>${currentUser?.email || '暂无邮箱信息'}</p>
                    <p style="margin-top: 5px;">
                        <span class="badge badge-success">学生账号</span>
                    </p>
                </div>
            </div>
        </div>
        <div class="card">
            <div class="card-header">
                <h3>个人信息</h3>
            </div>
            <div class="card-body">
                <div id="profile-details">
                    ${showLoading()}
                </div>
            </div>
        </div>
        <div class="card" style="margin-top: 20px;">
            <div class="card-header">
                <h3>账号信息</h3>
            </div>
            <div class="card-body">
                <table style="width: 100%;">
                    <tr>
                        <td style="padding: 10px; color: #666; width: 30%;">用户名</td>
                        <td style="padding: 10px; color: #333; font-weight: 500;">${currentUser?.username || '-'}</td>
                    </tr>
                    <tr style="background: #f8f9fa;">
                        <td style="padding: 10px; color: #666;">邮箱</td>
                        <td style="padding: 10px; color: #333; font-weight: 500;">${currentUser?.email || '-'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; color: #666;">账号类型</td>
                        <td style="padding: 10px; color: #333; font-weight: 500;">学生</td>
                    </tr>
                    <tr style="background: #f8f9fa;">
                        <td style="padding: 10px; color: #666;">注册时间</td>
                        <td style="padding: 10px; color: #333; font-weight: 500;">${currentUser?.created_at ? new Date(currentUser.created_at).toLocaleDateString('zh-CN') : '-'}</td>
                    </tr>
                </table>
            </div>
        </div>
    `;
}

async function loadMyProfile() {
    try {
        const data = await apiRequest('/students/me');
        const container = document.getElementById('profile-details');
        if (container) {
            container.innerHTML = `
                <table style="width: 100%;">
                    <tr>
                        <td style="padding: 10px; color: #666; width: 30%;">姓名</td>
                        <td style="padding: 10px; color: #333; font-weight: 500;">${data.name || '-'}</td>
                    </tr>
                    <tr style="background: #f8f9fa;">
                        <td style="padding: 10px; color: #666;">学号</td>
                        <td style="padding: 10px; color: #333; font-weight: 500;">${data.student_id || '-'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; color: #666;">性别</td>
                        <td style="padding: 10px; color: #333; font-weight: 500;">${data.gender || '-'}</td>
                    </tr>
                    <tr style="background: #f8f9fa;">
                        <td style="padding: 10px; color: #666;">年龄</td>
                        <td style="padding: 10px; color: #333; font-weight: 500;">${data.age || '-'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; color: #666;">专业</td>
                        <td style="padding: 10px; color: #333; font-weight: 500;">${data.major || '-'}</td>
                    </tr>
                    <tr style="background: #f8f9fa;">
                        <td style="padding: 10px; color: #666;">年级</td>
                        <td style="padding: 10px; color: #333; font-weight: 500;">${data.grade || '-'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; color: #666;">邮箱</td>
                        <td style="padding: 10px; color: #333; font-weight: 500;">${data.email || '-'}</td>
                    </tr>
                    <tr style="background: #f8f9fa;">
                        <td style="padding: 10px; color: #666;">手机号</td>
                        <td style="padding: 10px; color: #333; font-weight: 500;">${data.phone || '-'}</td>
                    </tr>
                </table>
            `;
        }
    } catch (error) {
        console.error('加载个人信息失败:', error);
        const container = document.getElementById('profile-details');
        if (container) {
            container.innerHTML = '<div class="empty-state"><p>加载个人信息失败</p></div>';
        }
    }
}

function renderCampusServices() {
    return `
        <div class="card">
            <div class="card-header">
                <h3>校园服务</h3>
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

async function loadCampusServices(type = 'all') {
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
                    <div class="course-card">
                        <h4>${s.name}</h4>
                        <p style="color: #666; font-size: 14px; margin: 10px 0;">${s.description || ''}</p>
                        <div class="course-info">
                            ${s.location ? `<span><i class="fa fa-map-marker"></i> ${s.location}</span>` : ''}
                            ${s.open_time ? `<span><i class="fa fa-clock-o"></i> ${s.open_time}</span>` : ''}
                            ${s.contact ? `<span><i class="fa fa-phone"></i> ${s.contact}</span>` : ''}
                        </div>
                        <div style="margin-top: 10px;">
                            <span class="badge badge-success">${typeLabels[s.service_type] || s.service_type}</span>
                        </div>
                    </div>
                `).join('');
            }
        }
    } catch (error) {
        showAlert('加载服务数据失败', 'error');
    }
}

function filterServices(type) {
    document.querySelectorAll('#services-filter .filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    loadCampusServices(type);
}

async function navigateTo(page) {
    currentPage = page;
    const mainArea = document.getElementById('main-content-area');
    const pageTitle = document.getElementById('page-title');

    document.querySelectorAll('.sidebar-menu a[data-page]').forEach(a => a.classList.remove('active'));
    const activeLink = document.querySelector(`.sidebar-menu a[data-page="${page}"]`);
    if (activeLink) activeLink.classList.add('active');

    switch (page) {
        case 'my-dashboard':
            pageTitle.textContent = '我的仪表盘';
            mainArea.innerHTML = renderMyDashboard();
            loadDashboardStats();
            break;
        case 'my-courses':
            pageTitle.textContent = '我的课程';
            mainArea.innerHTML = renderMyCourses();
            loadMyCourses();
            break;
        case 'my-scores':
            pageTitle.textContent = '我的成绩';
            mainArea.innerHTML = renderMyScores();
            loadMyScores();
            break;
        case 'my-profile':
            pageTitle.textContent = '个人信息';
            mainArea.innerHTML = renderMyProfile();
            loadMyProfile();
            break;
        case 'campus-services':
            pageTitle.textContent = '校园服务';
            mainArea.innerHTML = renderCampusServices();
            loadCampusServices();
            break;
        default:
            pageTitle.textContent = '我的仪表盘';
            mainArea.innerHTML = renderMyDashboard();
            loadDashboardStats();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (!getToken()) {
        window.location.href = '/student/login';
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

    navigateTo('my-dashboard');
});