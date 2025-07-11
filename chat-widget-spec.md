# Embeddable Chat Widget Specification

## Overview
Create a reusable JavaScript chat widget that can be embedded into any website via a JavaScript library or iframe. The widget should be highly customizable, lightweight, and easy to integrate.

## Core Requirements

### 1. Embedding Methods
- **JavaScript Library**: Load via script tag with initialization function
- **iFrame**: Single line embed code that loads the widget in an isolated frame

### 2. Positioning
- Support all four corners of the browser window:
  - Bottom-right (default)
  - Bottom-left
  - Top-right
  - Top-left
- Fixed positioning that stays in place during scroll
- Configurable offset from edges (e.g., 20px from bottom, 20px from side)

### 3. Visual Customization
All visual elements should be customizable via configuration:

#### 3.1 Colors
- Background color (main chat window)
- Font color (text messages)
- Message border color (individual message bubbles)
- Chat border color (main window border)
- Button background color
- Button hover color
- User message background color
- Bot/agent message background color

#### 3.2 Typography
- Font family
- Font size
- Font weight
- Line height

#### 3.3 Dimensions
- Widget width (default: 350px)
- Widget height (default: 500px)
- Button size (default: 60px)
- Border radius for chat window
- Border radius for messages
- Border radius for button

#### 3.4 Icons/Images
- Custom icon or image for the main button
- Support for SVG, PNG, JPG formats
- Default icon if none provided
- Icon size configuration

### 4. Functional Requirements

#### 4.1 Widget States
- **Collapsed**: Only floating button visible
- **Expanded**: Full chat interface visible
- **Minimized**: Optional state with just header visible

#### 4.2 Animations
- Smooth expand/collapse transitions
- Fade in/out effects
- Configurable animation duration

#### 4.3 Chat Interface
- Message input field
- Send button
- Message history display
- Typing indicator support
- Timestamp display (optional)
- User avatar support (optional)

#### 4.4 API Integration
- Webhook URL configuration for message handling
- Support for REST API endpoints
- WebSocket support (optional)
- Custom headers for authentication

### 5. Technical Implementation

#### 5.1 JavaScript Library Structure
```javascript
// Example usage
<script src="https://cdn.example.com/chat-widget.js"></script>
<script>
  ChatWidget.init({
    apiUrl: 'https://api.example.com/chat',
    position: 'bottom-right',
    colors: {
      background: '#ffffff',
      font: '#333333',
      messageBorder: '#e0e0e0',
      chatBorder: '#cccccc',
      buttonBackground: '#007bff',
      buttonHover: '#0056b3'
    },
    icon: 'https://example.com/chat-icon.svg',
    dimensions: {
      width: '350px',
      height: '500px',
      buttonSize: '60px'
    }
  });
</script>
```

#### 5.2 iFrame Implementation
```html
<!-- Single line embed -->
<iframe src="https://cdn.example.com/chat-widget?config=ENCODED_CONFIG" 
        style="position:fixed;bottom:20px;right:20px;width:60px;height:60px;border:none;z-index:9999"
        id="chat-widget-iframe"></iframe>
```

### 6. Configuration Object Schema

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
  
  // Colors
  colors: {
    background: string,         // Hex or RGB
    font: string,
    messageBorder: string,
    chatBorder: string,
    buttonBackground: string,
    buttonHover: string,
    userMessageBg: string,
    botMessageBg: string,
    headerBg: string,
    inputBg: string
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

### 7. Development Guidelines

#### 7.1 File Structure
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

#### 7.2 Browser Support
- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+
- Mobile browsers (iOS Safari, Chrome Android)

#### 7.3 Performance Requirements
- Bundle size < 50KB minified and gzipped
- Initial render < 100ms
- No blocking of main thread
- Lazy load when possible

#### 7.4 Security Considerations
- Content Security Policy (CSP) compatible
- XSS prevention
- HTTPS only for API calls
- Sanitize all user inputs
- iframe sandboxing when applicable

### 8. Testing Requirements

#### 8.1 Unit Tests
- Configuration validation
- Style generation
- API communication
- State management

#### 8.2 Integration Tests
- Multiple instances on same page
- Different positioning scenarios
- Mobile responsiveness
- Cross-browser compatibility

#### 8.3 E2E Tests
- Full chat flow
- Error handling
- Network failures
- Performance benchmarks

### 9. Documentation Requirements

#### 9.1 Installation Guide
- NPM installation
- CDN usage
- Local hosting

#### 9.2 Configuration Reference
- All options explained
- Default values
- Examples for common use cases

#### 9.3 API Documentation
- Message format
- Response format
- Error handling
- Webhook specifications

#### 9.4 Customization Examples
- Theme presets
- CSS overrides
- Custom components

### 10. Deliverables

1. **Core Library** (chat-widget.js)
   - Vanilla JavaScript implementation
   - No external dependencies
   - Modular architecture

2. **Build System**
   - Webpack/Rollup configuration
   - Minification pipeline
   - Source maps

3. **Example Implementations**
   - Basic integration
   - Advanced customization
   - Multiple widgets
   - Mobile-specific setup

4. **Documentation**
   - README.md
   - API reference
   - Integration guide
   - Troubleshooting guide

5. **Test Suite**
   - Jest unit tests
   - Cypress E2E tests
   - Performance benchmarks

### 11. Future Enhancements (Phase 2)

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