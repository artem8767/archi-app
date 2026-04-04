@echo off
setlocal
cd /d "%~dp0"
if not exist package.json (
  echo [ERROR] Run this file from the mobile folder (package.json missing).
  exit /b 1
)
echo [%~nx0] Directory: %CD%
echo.
call npm.cmd run eas:configure
if errorlevel 1 (
  echo.
  echo eas:configure failed. Log in first:  npm.cmd run eas:login
  exit /b 1
)
echo.
call npm.cmd run build:aab
exit /b %ERRORLEVEL%
