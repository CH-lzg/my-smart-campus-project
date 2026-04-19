@echo off
chcp 65001 >nul
echo ============================================
echo  校园智慧服务与数据分析管理系统
echo  Campus Smart Service & Data Analysis System
echo ============================================
echo.

echo [1/4] 检查Python环境...
python --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未找到Python，请先安装Python 3.8+
    pause
    exit /b 1
)
echo [OK] Python已安装

echo.
echo [2/4] 安装依赖包...
pip install -r requirements.txt -q
if errorlevel 1 (
    echo [错误] 依赖安装失败，请检查错误信息
    pause
    exit /b 1
)
echo [OK] 依赖安装完成

echo.
echo [3/4] 初始化数据库...
python init_db.py
if errorlevel 1 (
    echo [错误] 数据库初始化失败
    pause
    exit /b 1
)

echo.
echo [4/4] 启动服务器...
echo ============================================
echo  服务器地址: http://localhost:5000
echo  默认账号: admin / admin123
echo  普通用户: user / user123
echo ============================================
echo.
echo 按 Ctrl+C 停止服务器
echo.

python app.py

pause
