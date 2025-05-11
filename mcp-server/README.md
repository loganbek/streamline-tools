# Streamline Tools MCP Server

This is a Model Context Protocol (MCP) server for the Streamline Tools Chrome extension. It enhances GitHub Copilot's ability to understand the Streamline Tools codebase, particularly its integration with Oracle CPQ Cloud.

## What is Model Context Protocol (MCP)?

Model Context Protocol (MCP) is a protocol that allows GitHub Copilot to communicate with external context providers. By running this MCP server, you give Copilot access to the specific context of your Streamline Tools project, which helps it generate more relevant code suggestions.

## Features

- **CPQ-aware context**: Understands the specific structure of Oracle CPQ Cloud development, including the `rulesList.json` configuration file.
- **Rule-based context matching**: Identifies relationships between rules, selectors, and application areas in your code.
- **Intelligent code search**: Finds relevant files based on your queries about CPQ functionality.
- **UI/DOM interface understanding**: Provides context about interface elements when working with DOM manipulation.
- **Test-aware context**: Includes relevant test files when discussing testing scenarios.

## Setup

1. Install the dependencies:
   ```
   cd mcp-server
   npm install
   ```

2. Start the server:
   ```
   npm start
   ```

3. Configure your GitHub Copilot to use this MCP server:

   For VS Code:
   1. Open your VS Code settings (File > Preferences > Settings or press `Ctrl+,`).
   2. Search for "Copilot MCP Server URL".
   3. Set the value to: `ws://localhost:3000` (or whatever port you've configured).

   Or set the environment variable before launching VS Code:
   ```
   # Windows
   set MCP_SERVER_URL=ws://localhost:3000
   
   # Linux/macOS
   export MCP_SERVER_URL=ws://localhost:3000
   ```

## Usage

Once the MCP server is running and GitHub Copilot is configured to use it:

1. Work with your Streamline Tools code as normal.
2. When asking questions or requesting code suggestions from GitHub Copilot, it will have access to the relevant parts of your codebase.
3. For best results, be specific in your questions about CPQ functionality, rule types, UI interactions, etc.

## How It Works

The server uses several specialized context providers:

1. **CPQ Context Provider**: Understands the relationship between rule types, URL patterns, and application areas.
2. **Interface Context Provider**: Provides information about DOM manipulation and UI interactions.
3. **Test Context Provider**: Includes relevant test files when discussing testing scenarios.

Additionally, it uses a generic file search mechanism to find files relevant to your queries.

## Troubleshooting

- If Copilot doesn't seem to be aware of your code, check the server console to see if it's receiving queries.
- Check that the MCP_SERVER_URL is set correctly.
- Make sure the server is running on the expected port.

## Server Endpoints

- WebSocket: `ws://localhost:3000` - Used by GitHub Copilot
- HTTP: `http://localhost:3000` - Status check endpoint