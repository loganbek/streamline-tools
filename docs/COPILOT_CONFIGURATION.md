# GitHub Copilot Configuration Documentation

## Overview
This document describes the comprehensive GitHub Copilot Agent configuration for the Streamline Tools project, which is a Chrome extension for Oracle CPQ Cloud development.

## Configuration Files

### 1. `.github/copilot-instructions.md`
Contains detailed instructions for Copilot specific to Oracle CPQ development, including:
- Project context and technologies
- CPQ-specific coding patterns
- Security and performance guidelines
- Documentation standards

### 2. `.vscode/settings.json`
Enhanced VS Code settings with:
- GitHub Copilot enablement for all relevant file types
- CPQ-specific file associations (BML, XSL, CPQ)
- StandardJS integration
- Jest testing configuration
- TypeScript optimization

### 3. `.vscode/extensions.json`
Recommended extensions including:
- `GitHub.copilot` - Core Copilot functionality
- `GitHub.copilot-chat` - Copilot Chat interface
- `CPQConsultant.cpq-devkit-o` - CPQ development tools
- `standard.vscode-standard` - StandardJS linting
- `Orta.vscode-jest` - Jest testing support

### 4. `.copilot/config.json`
Project-specific Copilot configuration with:
- Technology stack definitions
- Code pattern examples
- Quality guidelines
- Testing patterns

### 5. `.vscode/launch.json`
Enhanced debugging configurations for:
- Chrome extension debugging
- Jest test debugging
- Puppeteer test debugging

## Features Enabled

### Code Generation
- Oracle CPQ BML function patterns
- Chrome extension API usage
- XSL transformation templates
- JSON configuration structures
- Jest test cases
- Puppeteer automation scripts

### Code Understanding
- CPQ domain knowledge
- Chrome extension architecture
- Oracle-specific patterns
- Testing best practices

### Quality Assurance
- StandardJS code style enforcement
- Security best practices
- Performance optimization
- Maintainability guidelines

## Usage Guidelines

### For Copilot Chat
1. Use specific CPQ terminology when asking questions
2. Reference Oracle CPQ Cloud features explicitly
3. Ask for Chrome extension patterns when needed
4. Request StandardJS-compliant code

### For Code Completion
1. Copilot will understand CPQ context automatically
2. BML functions will be suggested based on patterns
3. Chrome extension APIs will be prioritized
4. Test patterns will follow Jest conventions

### File Type Support
- `.js` and `.ts` files - Full JavaScript/TypeScript support
- `.bml` files - Treated as JavaScript with CPQ patterns
- `.xsl` files - XML with transformation patterns
- `.json` files - Configuration and data structures
- `.test.js` files - Jest testing patterns

## Best Practices

### When Working with CPQ
- Always consider Oracle CPQ Cloud context
- Use util functions for BML operations
- Follow CPQ naming conventions
- Implement proper error handling

### When Developing Chrome Extensions
- Use Manifest V3 patterns
- Implement secure messaging
- Handle permissions properly
- Test across different environments

### When Writing Tests
- Mock Chrome APIs appropriately
- Test CPQ-specific business logic
- Use descriptive test names
- Maintain high coverage

## Troubleshooting

### If Copilot Suggestions Seem Off-Topic
1. Check that you're in the correct file type
2. Add relevant comments to provide context
3. Use CPQ-specific terminology in your code
4. Reference the instructions in `.github/copilot-instructions.md`

### If Extensions Aren't Working
1. Reload VS Code window
2. Check extension compatibility
3. Verify settings.json syntax
4. Update extensions to latest versions

## Customization

### Adding New Patterns
1. Update `.github/copilot-instructions.md` with new patterns
2. Add examples to `.copilot/config.json`
3. Update file associations in settings.json if needed

### Modifying Copilot Behavior
1. Adjust settings in `.vscode/settings.json`
2. Update system prompts in configuration files
3. Add new file type associations as needed

## Security Considerations

- All configurations follow secure coding practices
- No sensitive data is included in configuration files
- Chrome extension security patterns are enforced
- CPQ-specific security guidelines are included

## Performance Optimization

- Configurations optimized for large CPQ codebases
- Efficient file watching and indexing
- Optimized suggestion generation
- Minimal impact on VS Code performance