const express = require('express');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { glob } = require('glob');
const WebSocket = require('ws');

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

  // Handle messages from clients
  ws.on('message', async (message) => {
    try {
      const request = JSON.parse(message);
      console.log('Received query:', request.text || request.query);

      // Process the query
      const query = request.text || request.query || '';
      let results = [];

      // First try specialized CPQ context provider
      const cpqResults = await cpqContextProvider.getContext(query);
      results = [...cpqResults];

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

      // Format response according to MCP spec
      const response = {
        type: 'response',
        requestId: request.requestId || request.id || Date.now().toString(),
        items: results.map((item, index) => ({
          id: `result-${index}`,
          ...item
        })),
      };

      // Send response back to client
      ws.send(JSON.stringify(response));
      console.log(`Sent ${response.items.length} results to client`);
    } catch (error) {
      console.error('Error processing message:', error);
      
      // Send error response
      ws.send(JSON.stringify({
        type: 'error',
        message: `Error processing request: ${error.message}`
      }));
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected from the MCP server');
  });

  // Send welcome message
  ws.send(JSON.stringify({
    type: 'info',
    message: 'Connected to Streamline Tools MCP Server'
  }));
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
    // Count occurrences
    const occurrences = (contentLower.match(new RegExp(keyword, 'g')) || []).length;
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
  console.log(`Streamline Tools MCP Server running on port ${port}`);
  console.log(`WebSocket endpoint: ws://localhost:${port}`);
  console.log(`To connect from GitHub Copilot, set MCP_SERVER_URL=ws://localhost:${port}`);
});