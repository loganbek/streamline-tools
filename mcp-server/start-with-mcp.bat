@echo off
echo Setting up environment for GitHub Copilot MCP server...
echo.

rem Kill any existing node processes if needed
taskkill /F /IM node.exe >nul 2>&1
echo Cleared any existing Node.js processes

rem Kill any existing VS Code instances
taskkill /F /IM Code.exe >nul 2>&1
echo Closed any running VS Code instances

echo.
echo Choose which server to start:
echo 1. Simple server (minimal implementation)
echo 2. Main server (full implementation)
echo 3. SDK server (uses official MCP SDK - recommended)
echo.
set /p server_choice="Enter choice (1, 2, or 3): "

if "%server_choice%"=="1" (
  echo Starting simple MCP server...
  start "MCP Simple Server" cmd /k "cd /d %~dp0 && node simple-server.js"
) else if "%server_choice%"=="2" (
  echo Starting main MCP server...
  start "MCP Main Server" cmd /k "cd /d %~dp0 && node server.js"
) else if "%server_choice%"=="3" (
  echo Starting SDK-based MCP server (recommended)...
  start "MCP SDK Server" cmd /k "cd /d %~dp0 && node sdk-server.js"
) else (
  echo Invalid choice. Starting SDK server as default...
  start "MCP SDK Server" cmd /k "cd /d %~dp0 && node sdk-server.js"
)

echo.
echo Setting MCP_SERVER_URL environment variable...
set MCP_SERVER_URL=ws://localhost:3000

echo.
echo Waiting 3 seconds for the server to start...
timeout /t 3 >nul

echo.
echo Starting VS Code with proper environment...
start "" code "%~dp0\.."

echo.
echo Done! VS Code should now connect to the MCP server.
echo Check the MCP server terminal window for connection messages.
echo.
