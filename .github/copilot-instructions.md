# GitHub Copilot Instructions for Streamline Tools

## Project Context
This is Streamline Tools, a Chrome extension for Oracle CPQ Cloud development that streamlines CPQ workflows, development, administration and maintenance.

## Key Technologies & Frameworks
- **JavaScript/TypeScript** - Primary development languages
- **Chrome Extension APIs** - For browser extension functionality
- **Oracle CPQ Cloud** - Target platform for business logic (BML)
- **Jest** - Testing framework
- **StandardJS** - Code style and linting
- **Puppeteer** - Browser automation for testing

## Code Style & Standards
- Follow StandardJS guidelines (no semicolons, 2-space indentation)
- Use modern ES6+ JavaScript features
- Write comprehensive tests with Jest
- Use descriptive variable and function names for CPQ domain concepts

## Oracle CPQ Specific Guidelines
- **BML (Business Markup Language)** - Oracle's proprietary language for business logic
- **XSL transformations** - Used for data transformation in CPQ
- **JSON configurations** - For CPQ product and pricing rules
- **XML data structures** - Common in CPQ integrations
- **CSS styling** - For CPQ user interface customization

## Common CPQ Development Patterns
- Product configuration rules and validations
- Pricing calculations and discount logic
- Quote generation and document formatting
- Integration patterns with external systems
- User interface enhancements and customizations

## Chrome Extension Best Practices
- Use manifest V3 standards
- Implement proper permission management
- Handle content script injection safely
- Use secure communication between scripts
- Follow Chrome Web Store policies

## Testing Guidelines
- Write unit tests for all business logic
- Mock external APIs and Chrome extension APIs
- Test across different CPQ scenarios
- Include integration tests for critical workflows

## Security Considerations
- Sanitize all user inputs
- Use secure communication protocols
- Implement proper error handling
- Follow Oracle CPQ security best practices
- Validate all data transformations

## Performance Optimization
- Minimize extension bundle size
- Optimize for CPQ page load times
- Use efficient DOM manipulation
- Implement proper caching strategies
- Profile performance in CPQ environments

## Documentation Standards
- Document all CPQ-specific configurations
- Include usage examples for complex features
- Maintain clear installation instructions
- Provide troubleshooting guides for common issues
- Keep keyboard shortcuts and features documented