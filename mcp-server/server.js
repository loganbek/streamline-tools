const express = require('express');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { glob } = require('glob');
const WebSocket = require('ws');
const _ = require('lodash');

// Initialize Express app
const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000;

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Load the specialized context provider
const CPQContextProvider = require('./cpqContextProvider');
const cpqContextProvider = new CPQContextProvider();

// Handle WebSocket connections
wss.on('connection', (ws) => {
  console.log('Client connected to the MCP server');
  console.log('Waiting for initialize request from client...');

  // Handle messages from clients
  ws.on('message', async (message) => {
    try {
      // Convert Buffer to string if needed
      const messageStr = message instanceof Buffer ? message.toString() : message;
      console.log('Raw message received:', messageStr);
      
      let request;
      try {
        request = JSON.parse(messageStr);
      } catch (parseError) {
        console.error('Failed to parse message as JSON:', parseError.message);
        ws.send(JSON.stringify({
          jsonrpc: "2.0",
          id: null,
          error: {
            code: -32700,
            message: "Parse error: " + parseError.message
          }
        }));
        return;
      }
      
      console.log('Received request type:', request.type || request.method, 'id:', request.id);
      
      // Handle LSP-style initialize request
      if (request.type === 'initialize') {
        console.log('Handling LSP-style initialize request with id:', request.id);
        const response = {
          id: request.id,
          type: 'response',
          result: {
            capabilities: {
              contextProvider: true
            },
            name: "Streamline Tools MCP Server",
            version: "1.0.0"
          }
        };
        console.log('Sending initialize response:', JSON.stringify(response));
        ws.send(JSON.stringify(response));
        return;
      }
        // Handle JSON-RPC style initialize request
      if (request.method === 'initialize') {
        console.log('Handling JSON-RPC initialize request with id:', request.id);
        const response = {
          jsonrpc: "2.0",
          id: request.id,
          result: {
            capabilities: {
              contextProvider: true
            },
            name: "Streamline Tools MCP Server",
            version: "1.0.0"
          }
        };
        console.log('Sending JSON-RPC initialize response:', JSON.stringify(response));
        ws.send(JSON.stringify(response));
        console.log('✅ INITIALIZATION SUCCESSFUL! GitHub Copilot should now be using this MCP server.');
        return;
      }
      
      // Handle provideSuggestions or search request (used by GitHub Copilot)
      if (request.type === 'search' || request.method === 'provideSuggestions' || request.type === 'query') {
        // Extract query from different possible locations depending on protocol
        let query = '';
        
        // JSON-RPC style
        if (request.params && request.params.query) {
          query = request.params.query;
        }
        // LSP style
        else if (request.query) {
          query = request.query;
        }
        // Handle other formats
        else if (request.text) {
          query = request.text;
        }
        
        console.log('Processing query:', query);
        let results = [];          try {          // First try specialized CPQ context provider with error handling
          try {
            // Use getContext which now exists in the CPQContextProvider class
            const cpqResults = await cpqContextProvider.getContext(query);
            if (Array.isArray(cpqResults)) {
              results = [...cpqResults];
            } else {
              console.warn('getContext did not return an array, using empty array');
              results = [];
            }
          } catch (cpqError) {
            console.error('Error in context provider:', cpqError);
            results = [];
          }
    
          // If specialized provider didn't find enough results, use generic search
          if (results.length < 3) {
            const genericResults = await searchFiles(query);
            
            // Add generic results while avoiding duplication
            for (const result of genericResults) {
              const isDuplicate = results.some(r => r.filepath === result.path);
              if (!isDuplicate) {
                results.push({
                  content: result.content,
                  title: result.path,
                  filepath: result.path,
                  language: getLanguageFromFilePath(result.path),
                });
              }
            }
          }
        } catch (searchError) {
          console.error('Error during search:', searchError);
        }
        
        // Format response according to protocol
        let response;
        
        // JSON-RPC style
        if (request.method) {
          response = {
            jsonrpc: "2.0", 
            id: request.id,
            result: {
              items: results.map((item, index) => ({
                id: `result-${index}`,
                ...item
              }))
            }
          };
        }
        // LSP style
        else {
          response = {
            type: 'response',
            id: request.id,
            items: results.map((item, index) => ({
              id: `result-${index}`,
              ...item
            }))
          };
        }      // Send response back to client
      ws.send(JSON.stringify(response));
      
      // Log sent items, make sure to handle different response formats
      const itemCount = response.result ? response.result.items.length : response.items.length;
      console.log(`Sent ${itemCount} results to client`);
      return;
      }
    } catch (error) {
      console.error('Error processing message:', error);
      // Send error response using JSON-RPC 2.0 format
      ws.send(JSON.stringify({
        jsonrpc: "2.0",
        id: request?.id || null,
        error: {
          code: -32603, // Internal error code
          message: `Error processing request: ${error.message}`
        }
      }));
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected from the MCP server');
  });
  // Don't send welcome message, as it might interfere with the MCP protocol
  // The initialize request will act as our handshake instead
  console.log('Waiting for client to initiate the MCP handshake...');
});

// Function to determine language based on file extension
function getLanguageFromFilePath(filepath) {
  const ext = path.extname(filepath).toLowerCase();
  switch (ext) {
    case '.js':
      return 'javascript';
    case '.json':
      return 'json';
    case '.css':
      return 'css';
    case '.html':
      return 'html';
    case '.xsl':
      return 'xml';
    case '.bml':
      return 'xml'; // BML is similar to XML
    default:
      return 'plaintext';
  }
}

// Function to search for files relevant to the query
async function searchFiles(query) {
  const MAX_FILES = 5;
  const MAX_SIZE = 100 * 1024; // 100KB max file size to avoid performance issues
  const results = [];

  // Define patterns for different file types
  // Focus on key file types for Oracle CPQ Cloud development
  const patterns = [
    './src/**/*.js',
    './src/rulesList.json',
    './src/background/*.js',
    './src/content/*.js',
    './src/popup/*.js',
    './src/options/*.js',
    './tests/**/*.js'
  ];

  // Get keywords from query
  const keywords = query.toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 2);

  // Search for files matching the patterns  
  for (const pattern of patterns) {
    const files = await glob(pattern);
    
    // Process each file
    for (const filepath of files) {
      if (results.length >= MAX_FILES) break;
      
      try {
        const content = fs.readFileSync(filepath, 'utf8');
        const stats = fs.statSync(filepath);
        
        // Skip files that are too large
        if (stats.size > MAX_SIZE) continue;
        
        // Check if file content matches the query
        const relevanceScore = calculateRelevance(content, keywords);
        
        if (relevanceScore > 0) {
          results.push({
            path: filepath,
            content,
            score: relevanceScore
          });
        }
      } catch (error) {
        console.error(`Error reading file ${filepath}:`, error);
      }
    }
  }

  // Sort results by relevance score
  results.sort((a, b) => b.score - a.score);
  
  // Return top results
  return results.slice(0, MAX_FILES);
}

// Calculate relevance score based on keyword matches
function calculateRelevance(content, keywords) {
  const contentLower = content.toLowerCase();
  let score = 0;
  
  // Check each keyword
  for (const keyword of keywords) {
    // Sanitize keyword to prevent regular expression injection
    const safeKeyword = _.escapeRegExp(keyword);
    // Count occurrences
    const occurrences = (contentLower.match(new RegExp(safeKeyword, 'g')) || []).length;
    score += occurrences;
    
    // Bonus points for keywords in comments or function names
    if (contentLower.includes(`// ${keyword}`) || 
        contentLower.includes(`* ${keyword}`) ||
        contentLower.includes(`function ${keyword}`)) {
      score += 5;
    }
  }
  
  return score;
}

// Setup a basic endpoint for status checks
app.get('/', (req, res) => {
  res.send({
    status: 'running', 
    message: 'Streamline Tools MCP Server is active',
    usage: 'Connect using WebSocket at ws://localhost:' + port
  });
});

// Start the server
server.listen(port, () => {
  const startupMessage = [
    `\n=======================================================`,
    `   STREAMLINE TOOLS MCP SERVER`,
    `=======================================================`,
    `✓ Server running on port ${port}`,
    `✓ WebSocket endpoint: ws://localhost:${port}`,
    `✓ To connect from GitHub Copilot, set environment variable:`,
    `    MCP_SERVER_URL=ws://localhost:${port}`,
    `=======================================================`,
    `Waiting for GitHub Copilot to connect...`,
  ].join("\n");
  
  console.log(startupMessage);
});