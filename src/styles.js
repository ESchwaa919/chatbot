import { isMobile } from './utils.js';

class StyleGenerator {
  constructor(config) {
    this.config = config;
    this.styleElement = null;
    this.widgetId = config.widgetId;
  }

  generateStyles() {
    const styles = this.getBaseStyles() + this.getCustomStyles() + this.getResponsiveStyles();
    this.injectStyles(styles);
    return styles;
  }

  getBaseStyles() {
    return `
      .chat-widget-${this.widgetId} {
        position: fixed;
        z-index: 9999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        box-sizing: border-box;
      }
      
      .chat-widget-${this.widgetId} *, 
      .chat-widget-${this.widgetId} *::before, 
      .chat-widget-${this.widgetId} *::after {
        box-sizing: border-box;
      }
      
      .chat-widget-${this.widgetId} .chat-button {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 12px rgba(0,0,0,0.15);
        transition: all 0.3s ease;
        outline: none;
      }
      
      .chat-widget-${this.widgetId} .chat-button:hover {
        transform: scale(1.05);
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
      }
      
      .chat-widget-${this.widgetId} .chat-window {
        width: 350px;
        height: 500px;
        border-radius: 12px;
        box-shadow: 0 5px 40px rgba(0,0,0,0.16);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        opacity: 0;
        transform: scale(0.8);
        transition: all 0.3s ease;
        background: white;
      }
      
      .chat-widget-${this.widgetId} .chat-window.open {
        opacity: 1;
        transform: scale(1);
      }
      
      .chat-widget-${this.widgetId} .chat-header {
        padding: 16px;
        border-bottom: 1px solid #e0e0e0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-height: 60px;
      }
      
      .chat-widget-${this.widgetId} .chat-title {
        font-weight: 600;
        font-size: 16px;
        margin: 0;
      }
      
      .chat-widget-${this.widgetId} .chat-controls {
        display: flex;
        gap: 8px;
      }
      
      .chat-widget-${this.widgetId} .control-button {
        width: 24px;
        height: 24px;
        border: none;
        background: none;
        cursor: pointer;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.2s;
      }
      
      .chat-widget-${this.widgetId} .control-button:hover {
        background-color: rgba(0,0,0,0.1);
      }
      
      .chat-widget-${this.widgetId} .chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      
      .chat-widget-${this.widgetId} .message {
        max-width: 80%;
        padding: 8px 12px;
        border-radius: 18px;
        word-wrap: break-word;
        animation: messageSlide 0.3s ease;
      }
      
      .chat-widget-${this.widgetId} .message.user {
        align-self: flex-end;
        background: #007bff;
        color: white;
      }
      
      .chat-widget-${this.widgetId} .message.bot {
        align-self: flex-start;
        background: #f1f1f1;
        color: #333;
      }
      
      .chat-widget-${this.widgetId} .message-timestamp {
        font-size: 11px;
        opacity: 0.6;
        margin-top: 4px;
      }
      
      .chat-widget-${this.widgetId} .typing-indicator {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 8px 12px;
        background: #f1f1f1;
        border-radius: 18px;
        max-width: 80px;
        align-self: flex-start;
      }
      
      .chat-widget-${this.widgetId} .typing-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #999;
        animation: typingPulse 1.4s ease-in-out infinite;
      }
      
      .chat-widget-${this.widgetId} .typing-dot:nth-child(2) {
        animation-delay: 0.2s;
      }
      
      .chat-widget-${this.widgetId} .typing-dot:nth-child(3) {
        animation-delay: 0.4s;
      }
      
      .chat-widget-${this.widgetId} .chat-input {
        border-top: 1px solid #e0e0e0;
        padding: 16px;
        display: flex;
        gap: 8px;
        align-items: flex-end;
      }
      
      .chat-widget-${this.widgetId} .input-field {
        flex: 1;
        border: 1px solid #e0e0e0;
        border-radius: 20px;
        padding: 8px 16px;
        font-size: 14px;
        font-family: inherit;
        resize: none;
        outline: none;
        max-height: 100px;
        min-height: 36px;
      }
      
      .chat-widget-${this.widgetId} .input-field:focus {
        border-color: #007bff;
      }
      
      .chat-widget-${this.widgetId} .send-button {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: none;
        background: #007bff;
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.2s;
      }
      
      .chat-widget-${this.widgetId} .send-button:hover {
        background: #0056b3;
      }
      
      .chat-widget-${this.widgetId} .send-button:disabled {
        background: #ccc;
        cursor: not-allowed;
      }
      
      @keyframes messageSlide {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes typingPulse {
        0%, 60%, 100% {
          transform: scale(1);
          opacity: 0.5;
        }
        30% {
          transform: scale(1.2);
          opacity: 1;
        }
      }
    `;
  }

  getCustomStyles() {
    const config = this.config;
    const colors = config.colors || {};
    const typography = config.typography || {};
    const dimensions = config.dimensions || {};
    const borderRadius = dimensions.borderRadius || {};

    return `
      .chat-widget-${this.widgetId} .chat-button {
        width: ${dimensions.buttonSize || '60px'};
        height: ${dimensions.buttonSize || '60px'};
        background: ${colors.buttonBackground || '#007bff'};
        border-radius: ${borderRadius.button || '50%'};
      }
      
      .chat-widget-${this.widgetId} .chat-button:hover {
        background: ${colors.buttonHover || '#0056b3'};
      }
      
      .chat-widget-${this.widgetId} .chat-window {
        width: ${dimensions.width || '350px'};
        height: ${dimensions.height || '500px'};
        background: ${colors.background || 'white'};
        border-radius: ${borderRadius.window || '12px'};
        border: ${colors.chatBorder ? `1px solid ${colors.chatBorder}` : 'none'};
        font-family: ${typography.fontFamily || 'inherit'};
        font-size: ${typography.fontSize || '14px'};
        font-weight: ${typography.fontWeight || 'normal'};
        line-height: ${typography.lineHeight || '1.5'};
        color: ${colors.font || '#333'};
      }
      
      .chat-widget-${this.widgetId} .chat-header {
        background: ${colors.headerBg || 'transparent'};
        color: ${colors.font || '#333'};
      }
      
      .chat-widget-${this.widgetId} .message {
        border-radius: ${borderRadius.messages || '18px'};
      }
      
      .chat-widget-${this.widgetId} .message.user {
        background: ${colors.userMessageBg || '#007bff'};
        color: white;
      }
      
      .chat-widget-${this.widgetId} .message.bot {
        background: ${colors.botMessageBg || '#f1f1f1'};
        color: ${colors.font || '#333'};
        border: ${colors.messageBorder ? `1px solid ${colors.messageBorder}` : 'none'};
      }
      
      .chat-widget-${this.widgetId} .input-field {
        background: ${colors.inputBg || 'white'};
        color: ${colors.font || '#333'};
        border-color: ${colors.messageBorder || '#e0e0e0'};
      }
      
      .chat-widget-${this.widgetId} .send-button {
        background: ${colors.buttonBackground || '#007bff'};
      }
      
      .chat-widget-${this.widgetId} .send-button:hover {
        background: ${colors.buttonHover || '#0056b3'};
      }
    `;
  }

  getResponsiveStyles() {
    const mobileBreakpoint = this.config.behavior?.mobileBreakpoint || 768;
    
    return `
      @media (max-width: ${mobileBreakpoint}px) {
        .chat-widget-${this.widgetId} .chat-window {
          width: 100vw !important;
          height: 100vh !important;
          border-radius: 0 !important;
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
        }
        
        .chat-widget-${this.widgetId} .message {
          max-width: 90%;
        }
      }
    `;
  }

  injectStyles(styles) {
    if (this.styleElement) {
      this.styleElement.textContent = styles;
    } else {
      this.styleElement = document.createElement('style');
      this.styleElement.textContent = styles;
      document.head.appendChild(this.styleElement);
    }
  }

  updateStyles(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this.generateStyles();
  }

  destroy() {
    if (this.styleElement) {
      this.styleElement.remove();
      this.styleElement = null;
    }
  }
}

export default StyleGenerator;