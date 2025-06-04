# Debugging GitHub Copilot MCP Server

This document provides steps to troubleshoot and fix issues with the MCP server connection to GitHub Copilot.

## Common Issues

1. **JSON Format Errors**: Missing brackets or commas in JSON responses
2. **Method Name Mismatch**: Using `getContext()` vs `getCPQContext()`  
3. **Port Conflicts**: Another process using port 3000
4. **Protocol Mismatch**: MCP protocol requirements not being met

## Testing Steps

1. **Kill existing processes**:
   ```
   taskkill /F /IM node.exe
   ```

2. **Run the simple test server**:
   ```
   cd mcp-server
   node simple-server.js
   ```

3. **In another terminal, run the test client**:
   ```
   cd mcp-server
   node test-client.js
   ```

4. **Check log output** for both the server and client to diagnose any issues

## Using VS Code with the MCP Server

1. Close all VS Code instances
2. Run the `start-with-mcp.bat` script 
3. Ensure GitHub Copilot is installed and enabled in VS Code
4. Check the Copilot Chat panel for connectivity

## Checking MCP Server Logs

The MCP server logs should show:
1. "Client connected" message when a client connects
2. "Processing initialize request" for the init handshake
3. "Initialization complete!" when successful
4. Proper handling of query requests

## Troubleshooting Specific Issues

### If the server doesn't start
- Check for port conflicts
- Ensure Node.js is installed and working
- Verify WebSocket dependencies are installed

### If the server starts but Copilot doesn't connect
- Verify the MCP_SERVER_URL environment variable is correctly set
- Check VS Code logs for connection issues
- Try restarting VS Code with the environment variable set

### If initialization fails
- Verify the initialize response format matches JSON-RPC 2.0
- Ensure the response ID matches the request ID
- Check that the required capabilities are provided

## Fixed Issues in Latest Update

1. Fixed missing closing bracket in JSON-RPC response format
2. Added getContext() method to CPQContextProvider for compatibility
3. Improved error handling for file loading
4. Cleaned up initialization response format

## Further Resources

- MCP Protocol Specification: https://modelcontextprotocol.io/specification/basic
- VS Code MCP Documentation: https://code.visualstudio.com/docs/copilot/chat/mcp-servers
