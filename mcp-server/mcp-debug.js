// Debug helper for MCP server connectivity
const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuration
const PORT_CHECK = 3000;
const SERVER_URL = 'ws://localhost:3000';
const TIMEOUT = 10000;
const LOG_FILE = path.join(__dirname, 'mcp-debug.log');

// Start log capture
const startTime = new Date();
const log = (message, type = 'INFO') => {
  const timestamp = new Date().toISOString();
  const logMsg = `[${timestamp}] [${type}] ${message}`;
  console.log(logMsg);
  
  // Append to log file
  fs.appendFileSync(LOG_FILE, logMsg + '\n');
};

log('Starting MCP server debug session', 'START');
log(`Debug log will be saved to ${LOG_FILE}`, 'INFO');

// Create a simple HTTP server to check if port is available
const checkPort = () => {
  return new Promise((resolve) => {
    const server = http.createServer();
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        log(`Port ${PORT_CHECK} is already in use!`, 'ERROR');
        resolve(false);
      } else {
        log(`Error checking port: ${err.message}`, 'ERROR');
        resolve(false);
      }
    });
    
    server.on('listening', () => {
      server.close();
      log(`Port ${PORT_CHECK} is available`, 'INFO');
      resolve(true);
    });
    
    server.listen(PORT_CHECK);
  });
};

// Check for running node processes
const checkNodeProcesses = () => {
  log('Checking for running Node.js processes...', 'INFO');
  
  try {
    // We're in Node.js so we can't easily get process list
    // But we can log that this should be done manually
    log('Please check for Node.js processes using Task Manager or the following command:', 'INFO');
    log('powershell.exe "Get-Process node"', 'INFO');
  } catch (err) {
    log(`Error checking processes: ${err.message}`, 'ERROR');
  }
};

// Test MCP server connection
const testConnection = () => {
  return new Promise((resolve) => {
    log(`Attempting to connect to MCP server at ${SERVER_URL}`, 'INFO');
    
    const ws = new WebSocket(SERVER_URL);
    let connectionSuccess = false;
    let initSuccess = false;
    
    // Set timeout
    const timeoutId = setTimeout(() => {
      if (!connectionSuccess) {
        log('Connection timed out after ' + (TIMEOUT/1000) + ' seconds', 'ERROR');
        ws.terminate();
        resolve({
          connectionSuccess: false,
          initSuccess: false,
          error: 'Connection timeout'
        });
      }
    }, TIMEOUT);
    
    ws.on('open', () => {
      connectionSuccess = true;
      log('WebSocket connection established', 'SUCCESS');
      
      // Send initialize request
      const initRequest = {
        jsonrpc: "2.0",
        id: "debug-init-1",
        method: "initialize",
        params: {}
      };
      
      log('Sending initialize request: ' + JSON.stringify(initRequest), 'INFO');
      ws.send(JSON.stringify(initRequest));
      
      // Set another timeout for init response
      setTimeout(() => {
        if (!initSuccess) {
          log('Initialize response timed out', 'ERROR');
          ws.close();
        }
      }, 5000);
    });
    
    ws.on('message', (data) => {
      const message = data.toString();
      log('Received message from server: ' + message, 'INFO');
      
      try {
        const response = JSON.parse(message);
        
        if (response.id === 'debug-init-1') {
          initSuccess = true;
          log('Initialize response received!', 'SUCCESS');
          
          if (response.result && response.result.capabilities) {
            log('Server announced capabilities: ' + JSON.stringify(response.result.capabilities), 'INFO');
          } else {
            log('Server response missing expected capabilities format', 'WARNING');
          }
          
          // Close connection after successful init
          setTimeout(() => {
            ws.close();
          }, 1000);
        }
      } catch (e) {
        log('Failed to parse server response as JSON: ' + e.message, 'ERROR');
      }
    });
    
    ws.on('error', (error) => {
      log('WebSocket error: ' + error.message, 'ERROR');
      clearTimeout(timeoutId);
      resolve({
        connectionSuccess: false,
        initSuccess: false,
        error: error.message
      });
    });
    
    ws.on('close', () => {
      log('WebSocket connection closed', 'INFO');
      clearTimeout(timeoutId);
      resolve({
        connectionSuccess,
        initSuccess,
        error: null
      });
    });
  });
};

// Check environment variables
const checkEnvironment = () => {
  log('Checking environment variables...', 'INFO');
  
  if (process.env.MCP_SERVER_URL) {
    log(`MCP_SERVER_URL is set to: ${process.env.MCP_SERVER_URL}`, 'INFO');
  } else {
    log('MCP_SERVER_URL environment variable is not set!', 'WARNING');
    log('GitHub Copilot needs MCP_SERVER_URL=ws://localhost:3000', 'INFO');
  }
};

// Main debug function
const runDebug = async () => {
  try {
    log('========== MCP SERVER DEBUG REPORT ==========', 'INFO');
    
    // Check environment
    checkEnvironment();
    
    // Check running processes
    checkNodeProcesses();
    
    // Check if port is available
    const portAvailable = await checkPort();
    if (!portAvailable) {
      log('Port is in use. This might indicate another MCP server is already running.', 'WARNING');
    }
    
    // Test connection
    const connectionResult = await testConnection();
    
    // Print summary
    log('========== DEBUG SUMMARY ==========', 'INFO');
    log(`Connection established: ${connectionResult.connectionSuccess ? 'YES ✓' : 'NO ✗'}`, 'RESULT');
    log(`Initialize handshake succeeded: ${connectionResult.initSuccess ? 'YES ✓' : 'NO ✗'}`, 'RESULT');
    
    if (connectionResult.error) {
      log(`Error encountered: ${connectionResult.error}`, 'RESULT');
    }
    
    // Recommendations
    log('========== RECOMMENDATIONS ==========', 'INFO');
    
    if (!connectionResult.connectionSuccess) {
      log('1. Make sure the MCP server is running on port 3000', 'RECOMMEND');
      log('2. Check if another application is using port 3000', 'RECOMMEND');
      log('3. Try restarting the server using start-with-mcp.bat', 'RECOMMEND');
    } else if (!connectionResult.initSuccess) {
      log('1. The server is running but initialize handshake failed', 'RECOMMEND');
      log('2. Check the server implementation of the initialize handler', 'RECOMMEND');
      log('3. Verify the server returns a proper JSON-RPC 2.0 response', 'RECOMMEND');
    } else {
      log('MCP server appears to be functioning correctly!', 'RECOMMEND');
      log('If GitHub Copilot still cannot connect:', 'RECOMMEND');
      log('1. Verify the MCP_SERVER_URL environment variable is set correctly', 'RECOMMEND');
      log('2. Try restarting VS Code after setting the environment variable', 'RECOMMEND');
      log('3. Check if GitHub Copilot is properly installed and configured', 'RECOMMEND');
    }
    
    log(`Debug completed in ${(new Date() - startTime) / 1000} seconds`, 'END');
    log(`Full debug log saved to: ${LOG_FILE}`, 'END');
    
  } catch (err) {
    log(`Unexpected error during debugging: ${err.message}`, 'ERROR');
    log(`Debug stack trace: ${err.stack}`, 'ERROR');
  }
};

// Execute debug process
runDebug();
