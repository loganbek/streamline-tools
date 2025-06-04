// Test script for the main server implementation
// This will help us verify if our fixes have resolved the issues

const WebSocket = require('ws');

// Connect to the main MCP server instance
console.log('Testing connection to main MCP server...');
const ws = new WebSocket('ws://localhost:3000');

ws.on('open', async () => {
  console.log('Connected to main MCP server');
  
  // Send initialize request (JSON-RPC style)
  const initRequest = {
    jsonrpc: "2.0",
    id: "test-init-1",
    method: "initialize",
    params: {}
  };
  
  console.log('Sending initialize request to main server...');
  ws.send(JSON.stringify(initRequest));
  
  // Wait a moment and then send a query
  setTimeout(() => {
    const queryRequest = {
      jsonrpc: "2.0",
      id: "test-query-1",
      method: "provideSuggestions",
      params: {
        query: "How do I use rulesList.json in Streamline Tools?"
      }
    };
    
    console.log('Sending test query to main server...');
    ws.send(JSON.stringify(queryRequest));
    
    // Close after a few seconds
    setTimeout(() => {
      console.log('Test completed. Closing connection...');
      ws.close();
      process.exit(0);
    }, 5000);
  }, 2000);
});

ws.on('message', (data) => {
  const message = data.toString();
  console.log('\n===== SERVER RESPONSE =====');
  try {
    const parsed = JSON.parse(message);
    console.log(JSON.stringify(parsed, null, 2));
    
    // Validate response format
    if (parsed.jsonrpc === "2.0" && parsed.id && !parsed.error) {
      console.log('✅ Valid JSON-RPC response received');
      
      // Check initialize response
      if (parsed.id === "test-init-1" && parsed.result && parsed.result.capabilities) {
        console.log('✅ Valid initialize response with capabilities');
      }
      
      // Check query response
      if (parsed.id === "test-query-1" && parsed.result && parsed.result.items) {
        console.log(`✅ Query response with ${parsed.result.items.length} results`);
      }
    } else {
      console.log('❌ Response validation failed');
    }
  } catch (e) {
    console.log('Raw response (not JSON):', message);
    console.log('❌ Failed to parse response as JSON');
  }
  console.log('===========================\n');
});

ws.on('error', (error) => {
  console.error('❌ Connection error:', error.message);
  process.exit(1);
});

ws.on('close', () => {
  console.log('Connection closed');
});
