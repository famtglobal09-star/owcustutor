@echo off
cd /d "%~dp0"
set "JUDGE0_URL=http://127.0.0.1:2358"
"%~dp0..\.venv\Scripts\python.exe" manage.py runserver 127.0.0.1:9026
