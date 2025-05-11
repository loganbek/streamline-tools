// SDK-based MCP server implementation
// Using the official Model Context Protocol SDK for better compatibility
const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const fs = require('fs');
const path = require('path');
const { glob } = require('glob');
const { z } = require('zod'); // Zod is used by the MCP SDK for validation

// Initialize our CPQ context provider
const CPQContextProvider = require('./cpqContextProvider');
const cpqContextProvider = new CPQContextProvider();

// Create an MCP server
const server = new McpServer({
  name: "Streamline Tools MCP Server",
  version: "1.0.0",
});

// Add a tool for searching CPQ content
server.tool(
  "search_cpq_content",
  { 
    query: z.string().describe("The search query to find relevant CPQ related content")
  },
  async ({ query }) => {
    console.log(`Searching CPQ content with query: ${query}`);
    
    try {
      // First try specialized CPQ context provider
      const results = [];
      
      try {
        const cpqResults = await cpqContextProvider.getContext(query);
        if (Array.isArray(cpqResults)) {
          cpqResults.forEach(item => {
            results.push({
              title: item.title || item.filepath,
              content: item.content,
              filepath: item.filepath,
              language: item.language || getLanguageFromFilePath(item.filepath)
            });
          });
        }
      } catch (cpqError) {
        console.error('Error in CPQ context provider:', cpqError);
      }
      
      // If specialized provider didn't find enough results, use generic search
      if (results.length < 3) {
        try {
          const genericResults = await searchFiles(query);
          
          // Add generic results while avoiding duplication
          for (const result of genericResults) {
            const isDuplicate = results.some(r => r.filepath === result.path);
            if (!isDuplicate) {
              results.push({
                title: result.path,
                content: result.content,
                filepath: result.path,
                language: getLanguageFromFilePath(result.path)
              });
            }
          }
        } catch (searchError) {
          console.error('Error during generic search:', searchError);
        }
      }
      
      // Transform results to proper MCP content format
      const formattedResults = results.map((item, index) => ({
        type: 'text',
        text: `--- File: ${item.filepath} (${item.language}) ---\n\n${item.content}`
      }));
      
      return {
        content: formattedResults.length > 0 
          ? formattedResults 
          : [{ type: "text", text: `No results found for query: ${query}` }]
      };
    } catch (error) {
      console.error('Error processing search:', error);
      return {
        content: [{ 
          type: "text", 
          text: `Error processing search: ${error.message}`
        }],
        isError: true
      };
    }
  }
);

// Tool to get info about rulesList.json
server.tool(
  "get_rules_info",
  {},
  async () => {
    console.log("Getting rulesList.json info");
    
    try {
      // Try to load rules from CPQ context provider
      const rulesPath = path.resolve(process.cwd(), '..', 'src', 'rulesList.json');
      
      if (!fs.existsSync(rulesPath)) {
        return {
          content: [{ 
            type: "text", 
            text: `Rules file not found at ${rulesPath}` 
          }],
          isError: true
        };
      }
      
      const rulesContent = fs.readFileSync(rulesPath, 'utf8');
      const rules = JSON.parse(rulesContent);
      
      const summary = `
# Streamline Tools Rules Configuration

The rulesList.json file contains ${rules.length} rules for Oracle CPQ Cloud integration.

## Rule Types:
${rules.map(rule => `- ${rule.type}: ${rule.description || 'No description'}`).join('\n')}

## URL Patterns:
${rules.map(rule => `- ${rule.urlPattern}: ${rule.type}`).join('\n')}

## Application Areas:
${Array.from(new Set(rules.map(rule => rule.application || 'Unknown'))).join(', ')}
      `;
      
      return {
        content: [{ type: "text", text: summary }]
      };
    } catch (error) {
      console.error('Error loading rules:', error);
      return {
        content: [{ 
          type: "text", 
          text: `Error loading rules: ${error.message}` 
        }],
        isError: true
      };
    }
  }
);

// Function to determine language based on file extension
function getLanguageFromFilePath(filepath) {
  if (!filepath) return 'plaintext';
  
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
    path.join('..', 'src', '**', '*.js'),
    path.join('..', 'src', 'rulesList.json'),
    path.join('..', 'src', 'background', '*.js'),
    path.join('..', 'src', 'content', '*.js'),
    path.join('..', 'src', 'popup', '*.js'),
    path.join('..', 'src', 'options', '*.js'),
    path.join('..', 'tests', '**', '*.js')
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

// Start the server with StdioTransport (recommended for GitHub Copilot)
async function startServer() {
  try {
    // Print diagnostic info to stderr, not stdout 
    // (this is important for protocol compliance)
    console.error(`Starting MCP server using SDK version: ${require('@modelcontextprotocol/sdk/package.json').version}`);
    console.error(`Current working directory: ${process.cwd()}`);
    console.error(`Node.js version: ${process.version}`);
    
    // Subscribe to SDK debug logs
    process.env.DEBUG = 'mcp:*';
    
    // Create a stdio transport - this is what GitHub Copilot expects
    const transport = new StdioServerTransport();
    console.error('Created stdio transport');
    
    // Add event handlers to monitor connection activity
    transport.on('message', (message) => {
      console.error(`[TRANSPORT] Received message: ${JSON.stringify(message)}`);
    });
    
    // Connect the server to the transport
    console.error('Connecting server to transport...');
    await server.connect(transport);
    console.error('Server connected to transport');
    
    console.error(`
=======================================================
   STREAMLINE TOOLS MCP SERVER (SDK IMPLEMENTATION)
=======================================================
✅ Server started successfully using MCP SDK
✅ Server name: ${server.name}, version: ${server.version}
✅ Using transport: StdioServerTransport 
✅ Available tools:
   - search_cpq_content: Search for CPQ-related content
   - get_rules_info: Get information about rulesList.json
=======================================================
Waiting for GitHub Copilot to connect...
    `);
    
    // Register process handlers for clean shutdown
    process.on('SIGINT', async () => {
      console.error('Received SIGINT, shutting down server...');
      await server.close();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('Failed to start MCP server:', error);
    console.error('Error details:', error.stack);
    process.exit(1);
  }
}

// Start the server
startServer();
