// A minimal MCP server implementation focused on fixing the initialize request issue
const WebSocket = require('ws');
const http = require('http');

const port = 3000;
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Simple MCP Server is running');
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (message) => {
    try {
      // Parse the message
      const messageStr = message instanceof Buffer ? message.toString() : message;
      console.log('Raw message received:', messageStr);
      
      // Parse JSON
      let request;
      try {
        request = JSON.parse(messageStr);
      } catch (e) {
        console.error('Failed to parse JSON:', e);
        ws.send(JSON.stringify({
          jsonrpc: "2.0",
          id: null,
          error: {
            code: -32700,
            message: "Parse error"
          }
        }));
        return;
      }
      
      console.log(`Received ${request.method || request.type} request with id ${request.id || 'unknown'}`);
      
      // Handle initialize request according to MCP protocol
      if (request.method === 'initialize') {
        console.log('Processing MCP initialize request');
        
        // The proper MCP initialization response according to the specification
        const response = {
          jsonrpc: "2.0", 
          id: request.id,
          result: {
            capabilities: {
              tools: {}  // We support tools capability
            },
            name: "Streamline Tools Simple MCP Server",
            version: "1.0.0"
          }
        };
        
        console.log('Sending response:', JSON.stringify(response));
        ws.send(JSON.stringify(response));
        console.log('Initialization complete!');
        return;
      }
      
      // Handle LSP-style initialize (older protocol)
      if (request.type === 'initialize') {
        console.log('Processing LSP-style initialize request');
        
        const response = {
          id: request.id,
          type: 'response',
          result: {
            capabilities: {
              contextProvider: true
            },
            name: "Streamline Tools Simple MCP Server",
            version: "1.0.0"
          }
        };
        
        console.log('Sending response:', JSON.stringify(response));
        ws.send(JSON.stringify(response));
        console.log('Initialization complete!');
        return;
      }
      
      // For any other message, just acknowledge receipt
      ws.send(JSON.stringify({
        jsonrpc: "2.0",
        id: request.id || "unknown",
        result: {
          message: "Acknowledged"
        }
      }));
    } catch (error) {
      console.error('Error handling message:', error.message);
      try {
        ws.send(JSON.stringify({
          jsonrpc: "2.0", 
          id: null,
          error: {
            code: -32603,
            message: `Error: ${error.message}`
          }
        }));
      } catch (e) {
        console.error('Failed to send error response:', e);
      }
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

server.listen(port, () => {
  console.log(`
==========================================
  SIMPLE MCP SERVER (DEBUGGING VERSION)
==========================================
Server running on port ${port}
Connect GitHub Copilot with:
MCP_SERVER_URL=ws://localhost:${port}
==========================================
Waiting for connections...
`);
});
