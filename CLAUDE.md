# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Reference**: See `chat-widget-spec.md` for complete project requirements and specifications.

## Project Overview

This is an embeddable chat widget project that creates a reusable JavaScript library for integrating chat functionality into any website. The widget supports both JavaScript library integration and iframe embedding methods with extensive customization options.

## Core Requirements Summary

### Embedding Methods
- **JavaScript Library**: Load via script tag with `ChatWidget.init()` function
- **iframe**: Single line embed code with encoded configuration

### Positioning & Layout
- Support all four corners: bottom-right (default), bottom-left, top-right, top-left
- Fixed positioning that stays in place during scroll
- Configurable offset from edges (e.g., 20px from bottom/side)

### Widget States
- **Collapsed**: Only floating button visible
- **Expanded**: Full chat interface visible  
- **Minimized**: Optional state with just header visible

### Visual Customization (All Configurable)
- **Colors**: Background, font, message borders, chat borders, button colors, user/bot message backgrounds
- **Typography**: Font family, size, weight, line height
- **Dimensions**: Width (350px default), height (500px default), button size (60px default), border radius
- **Icons**: Custom SVG/PNG/JPG support with size configuration

### Chat Interface Features
- Message input field with send button
- Message history display
- Typing indicator support
- Optional timestamps and user avatars
- Smooth expand/collapse animations with configurable duration

## Development Architecture

### Project Structure
```
chat-widget/
├── src/
│   ├── index.js          // Main entry point
│   ├── widget.js         // Widget class
│   ├── styles.js         // Dynamic style generation
│   ├── api.js           // API communication
│   ├── storage.js       // Local storage handling
│   └── utils.js         // Helper functions
├── dist/
│   ├── chat-widget.js   // Bundled version
│   └── chat-widget.min.js
├── examples/
│   ├── basic.html
│   ├── advanced.html
│   └── iframe.html
└── package.json
```

### Configuration Object Schema

Complete configuration structure with all options:
```javascript
{
  // Required
  apiUrl: string,           // Endpoint for chat messages
  
  // Positioning
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left',
  offset: {
    x: number,            // Horizontal offset in pixels
    y: number             // Vertical offset in pixels
  },
  
  // Colors - All customizable
  colors: {
    background: string,         // Main chat window background
    font: string,              // Text color
    messageBorder: string,     // Message bubble borders
    chatBorder: string,        // Main window border
    buttonBackground: string,   // Button background
    buttonHover: string,       // Button hover state
    userMessageBg: string,     // User message background
    botMessageBg: string,      // Bot message background
    headerBg: string,          // Header background
    inputBg: string           // Input field background
  },
  
  // Typography
  typography: {
    fontFamily: string,
    fontSize: string,
    fontWeight: string,
    lineHeight: string
  },
  
  // Dimensions
  dimensions: {
    width: string,
    height: string,
    buttonSize: string,
    borderRadius: {
      window: string,
      messages: string,
      button: string
    }
  },
  
  // Icons
  icon: {
    url: string,              // URL to icon image
    size: string,             // Icon size
    position: string          // Position within button
  },
  
  // Features
  features: {
    showTimestamps: boolean,
    showAvatars: boolean,
    showTypingIndicator: boolean,
    enableFileUpload: boolean,
    enableEmoji: boolean
  },
  
  // Behavior
  behavior: {
    autoOpen: boolean,        // Auto-open on page load
    openDelay: number,        // Delay before auto-open
    persistState: boolean,    // Remember open/closed state
    mobileBreakpoint: number  // Switch to fullscreen on mobile
  },
  
  // API Configuration
  api: {
    headers: object,          // Custom headers
    method: 'POST' | 'GET',
    websocket: boolean,       // Use WebSocket instead of HTTP
    timeout: number           // Request timeout
  },
  
  // Localization
  locale: {
    language: string,         // e.g., 'en', 'es', 'fr'
    strings: {
      placeholder: string,
      sendButton: string,
      headerTitle: string,
      errorMessage: string
    }
  }
}
```

## Technical Requirements

### Performance & Compatibility
- **Bundle size**: < 50KB minified and gzipped
- **Initial render**: < 100ms
- **No main thread blocking**
- **Browser support**: Chrome 60+, Firefox 55+, Safari 11+, Edge 79+
- **Mobile**: iOS Safari, Chrome Android

### Implementation Constraints
- **No external dependencies**: Vanilla JavaScript only
- **Modular architecture**: Clean separation of concerns
- **CSP compatible**: Content Security Policy compliant
- **Lazy loading**: Load resources when needed

### Security Requirements
- XSS prevention for all user inputs
- HTTPS-only API calls
- Input sanitization
- iframe sandboxing support

## Development Commands

Anticipated commands based on specification:
- `npm run build`: Bundle library using Webpack/Rollup
- `npm run build:dev`: Development build with source maps
- `npm run test`: Run Jest unit tests
- `npm run test:e2e`: Run Cypress E2E tests
- `npm run lint`: Code linting
- `npm run serve`: Serve examples locally

## Testing Strategy

### Unit Tests
- Configuration validation
- Style generation
- API communication
- State management

### Integration Tests
- Multiple instances on same page
- Different positioning scenarios
- Mobile responsiveness
- Cross-browser compatibility

### E2E Tests
- Full chat flow
- Error handling
- Network failures
- Performance benchmarks

## API Integration

### Supported Methods
- REST API endpoints with custom headers
- WebSocket connections (optional)
- Webhook URL configuration
- GET/POST method support
- Request timeout configuration

### Message Handling
- Real-time message exchange
- Typing indicators
- Message history persistence
- Error handling and retry logic

## Deliverables

1. **Core Library** (chat-widget.js) - Vanilla JavaScript, no dependencies
2. **Build System** - Webpack/Rollup with minification and source maps
3. **Example Implementations** - Basic, advanced, multiple widgets, mobile setups
4. **Documentation** - README, API reference, integration guide, troubleshooting
5. **Test Suite** - Jest unit tests, Cypress E2E tests, performance benchmarks

## Future Enhancements (Phase 2)

- React/Vue/Angular components
- WordPress plugin
- Shopify app
- Analytics integration
- A/B testing support
- Multi-language auto-detection
- Voice input support
- Rich media messages
- Conversation history export
- Operator dashboard