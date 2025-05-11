// Test client for MCP server
const WebSocket = require('ws');

// Function to wait a specific amount of time
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

async function testMcpServer() {
  console.log('Connecting to MCP server...');
  const ws = new WebSocket('ws://localhost:3000');
  
  ws.on('open', async () => {
    console.log('Connected to server');
    
    // Send initialize request in JSON-RPC format (GitHub Copilot style)
    const initRequest = {
      jsonrpc: "2.0",
      id: "test-client-1",
      method: "initialize",
      params: {
        processId: null,
        rootUri: "file:///c%3A/Users/logan/code/streamline-tools",
        capabilities: {}
      }
    };
    
    console.log('Sending initialize request...');
    ws.send(JSON.stringify(initRequest));
    
    // Wait a moment to see the response
    await wait(2000);
    
    // Try a simple query
    const queryRequest = {
      jsonrpc: "2.0",
      id: "test-client-2",
      method: "provideSuggestions",
      params: {
        query: "rulesList configuration",
        timeoutMs: 5000
      }
    };
    
    console.log('Sending query request...');
    ws.send(JSON.stringify(queryRequest));
    
    // Wait and close
    await wait(3000);
    ws.close();
    console.log('Test completed');
  });
  
  ws.on('message', (data) => {
    console.log('Received response:');
    try {
      const parsed = JSON.parse(data.toString());
      console.log(JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.log(data.toString());
    }
  });
  
  ws.on('error', (error) => {
    console.error('Connection error:', error.message);
  });
  
  ws.on('close', () => {
    console.log('Connection closed');
    process.exit(0);
  });
}

testMcpServer();
