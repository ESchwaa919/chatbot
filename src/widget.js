import { deepMerge, generateId, sanitizeHtml, debounce, createElement, isMobile } from './utils.js';
import StyleGenerator from './styles.js';
import ApiClient from './api.js';
import Storage from './storage.js';

class ChatWidget {
  constructor(config) {
    this.config = this.mergeWithDefaults(config);
    this.widgetId = generateId();
    this.config.widgetId = this.widgetId;
    
    this.isOpen = false;
    this.isMinimized = false;
    this.messages = [];
    this.conversationId = null;
    
    this.elements = {};
    this.styleGenerator = new StyleGenerator(this.config);
    this.apiClient = new ApiClient(this.config);
    this.storage = new Storage(this.widgetId);
    
    this.typingTimeout = null;
    this.debouncedSendMessage = debounce(this.sendMessage.bind(this), 300);
    
    this.init();
  }

  mergeWithDefaults(config) {
    const defaults = {
      position: 'bottom-right',
      offset: { x: 20, y: 20 },
      colors: {
        background: '#ffffff',
        font: '#333333',
        messageBorder: '#e0e0e0',
        chatBorder: '#cccccc',
        buttonBackground: '#007bff',
        buttonHover: '#0056b3',
        userMessageBg: '#007bff',
        botMessageBg: '#f1f1f1',
        headerBg: '#ffffff',
        inputBg: '#ffffff'
      },
      typography: {
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '14px',
        fontWeight: 'normal',
        lineHeight: '1.5'
      },
      dimensions: {
        width: '350px',
        height: '500px',
        buttonSize: '60px',
        borderRadius: {
          window: '12px',
          messages: '18px',
          button: '50%'
        }
      },
      features: {
        showTimestamps: false,
        showAvatars: false,
        showTypingIndicator: true,
        enableFileUpload: false,
        enableEmoji: false
      },
      behavior: {
        autoOpen: false,
        openDelay: 0,
        persistState: true,
        mobileBreakpoint: 768
      },
      api: {
        method: 'POST',
        websocket: false,
        timeout: 30000
      },
      locale: {
        language: 'en',
        strings: {
          placeholder: 'Type a message...',
          sendButton: 'Send',
          headerTitle: 'Chat',
          errorMessage: 'Sorry, something went wrong. Please try again.'
        }
      }
    };

    return deepMerge(defaults, config);
  }

  init() {
    this.loadPersistedState();
    this.createElements();
    this.setupEventListeners();
    this.styleGenerator.generateStyles();
    this.positionWidget();
    
    if (this.config.behavior.autoOpen) {
      setTimeout(() => this.open(), this.config.behavior.openDelay);
    }
    
    if (this.config.api.websocket) {
      this.initWebSocket();
    }
  }

  createElements() {
    this.elements.container = createElement('div', {
      className: `chat-widget-${this.widgetId}`,
      id: `chat-widget-${this.widgetId}`
    });

    this.createButton();
    this.createWindow();
    
    document.body.appendChild(this.elements.container);
  }

  createButton() {
    this.elements.button = createElement('button', {
      className: 'chat-button',
      'aria-label': 'Open chat'
    });

    const iconHtml = this.config.icon?.url 
      ? `<img src="${this.config.icon.url}" alt="Chat" style="width: 24px; height: 24px;">`
      : this.getDefaultIcon();
    
    this.elements.button.innerHTML = iconHtml;
    this.elements.container.appendChild(this.elements.button);
  }

  createWindow() {
    this.elements.window = createElement('div', {
      className: 'chat-window',
      style: 'display: none;'
    });

    this.createHeader();
    this.createMessagesContainer();
    this.createInput();
    
    this.elements.container.appendChild(this.elements.window);
  }

  createHeader() {
    this.elements.header = createElement('div', {
      className: 'chat-header'
    });

    this.elements.title = createElement('h3', {
      className: 'chat-title',
      innerHTML: this.config.locale.strings.headerTitle
    });

    this.elements.controls = createElement('div', {
      className: 'chat-controls'
    });

    this.elements.minimizeButton = createElement('button', {
      className: 'control-button',
      'aria-label': 'Minimize',
      innerHTML: '−'
    });

    this.elements.closeButton = createElement('button', {
      className: 'control-button',
      'aria-label': 'Close',
      innerHTML: '×'
    });

    this.elements.controls.appendChild(this.elements.minimizeButton);
    this.elements.controls.appendChild(this.elements.closeButton);
    this.elements.header.appendChild(this.elements.title);
    this.elements.header.appendChild(this.elements.controls);
    this.elements.window.appendChild(this.elements.header);
  }

  createMessagesContainer() {
    this.elements.messages = createElement('div', {
      className: 'chat-messages'
    });
    
    this.elements.window.appendChild(this.elements.messages);
  }

  createInput() {
    this.elements.inputContainer = createElement('div', {
      className: 'chat-input'
    });

    this.elements.input = createElement('textarea', {
      className: 'input-field',
      placeholder: this.config.locale.strings.placeholder,
      rows: '1'
    });

    this.elements.sendButton = createElement('button', {
      className: 'send-button',
      'aria-label': this.config.locale.strings.sendButton,
      innerHTML: this.getSendIcon()
    });

    this.elements.inputContainer.appendChild(this.elements.input);
    this.elements.inputContainer.appendChild(this.elements.sendButton);
    this.elements.window.appendChild(this.elements.inputContainer);
  }

  setupEventListeners() {
    this.elements.button.addEventListener('click', () => this.toggle());
    this.elements.closeButton.addEventListener('click', () => this.close());
    this.elements.minimizeButton.addEventListener('click', () => this.minimize());
    this.elements.sendButton.addEventListener('click', () => this.handleSendMessage());
    
    this.elements.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.handleSendMessage();
      }
    });

    this.elements.input.addEventListener('input', () => {
      this.autoResizeInput();
    });

    window.addEventListener('resize', () => {
      this.positionWidget();
    });
  }

  positionWidget() {
    const position = this.config.position;
    const offset = this.config.offset;
    
    const positionStyles = {
      'bottom-right': { bottom: `${offset.y}px`, right: `${offset.x}px` },
      'bottom-left': { bottom: `${offset.y}px`, left: `${offset.x}px` },
      'top-right': { top: `${offset.y}px`, right: `${offset.x}px` },
      'top-left': { top: `${offset.y}px`, left: `${offset.x}px` }
    };

    Object.assign(this.elements.container.style, positionStyles[position]);
  }

  open() {
    if (this.isOpen) return;
    
    this.isOpen = true;
    this.elements.window.style.display = 'flex';
    this.elements.button.style.display = 'none';
    
    setTimeout(() => {
      this.elements.window.classList.add('open');
    }, 10);
    
    this.elements.input.focus();
    this.saveState();
  }

  close() {
    if (!this.isOpen) return;
    
    this.isOpen = false;
    this.elements.window.classList.remove('open');
    
    setTimeout(() => {
      this.elements.window.style.display = 'none';
      this.elements.button.style.display = 'flex';
    }, 300);
    
    this.saveState();
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  minimize() {
    this.isMinimized = !this.isMinimized;
    if (this.isMinimized) {
      this.elements.messages.style.display = 'none';
      this.elements.inputContainer.style.display = 'none';
      this.elements.window.style.height = '60px';
    } else {
      this.elements.messages.style.display = 'flex';
      this.elements.inputContainer.style.display = 'flex';
      this.elements.window.style.height = this.config.dimensions.height;
    }
    this.saveState();
  }

  async handleSendMessage() {
    const message = this.elements.input.value.trim();
    if (!message) return;
    
    this.addMessage(message, 'user');
    this.elements.input.value = '';
    this.autoResizeInput();
    this.elements.sendButton.disabled = true;
    
    if (this.config.features.showTypingIndicator) {
      this.showTypingIndicator();
    }
    
    try {
      const response = await this.apiClient.sendMessage(message, this.conversationId);
      this.hideTypingIndicator();
      
      if (response.success && response.data) {
        const botMessage = response.data.message || response.data.response || 'Thank you for your message!';
        this.addMessage(botMessage, 'bot');
        
        if (response.data.conversationId) {
          this.conversationId = response.data.conversationId;
          this.storage.saveConversationId(this.conversationId);
        }
      }
    } catch (error) {
      this.hideTypingIndicator();
      console.error('Failed to send message:', error);
      this.addMessage(this.config.locale.strings.errorMessage, 'bot');
    } finally {
      this.elements.sendButton.disabled = false;
    }
  }

  addMessage(text, type) {
    const messageElement = createElement('div', {
      className: `message ${type}`
    });

    const sanitizedText = sanitizeHtml(text);
    messageElement.innerHTML = sanitizedText;
    
    if (this.config.features.showTimestamps) {
      const timestamp = createElement('div', {
        className: 'message-timestamp',
        innerHTML: new Date().toLocaleTimeString()
      });
      messageElement.appendChild(timestamp);
    }
    
    this.elements.messages.appendChild(messageElement);
    this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
    
    this.messages.push({
      text: sanitizedText,
      type,
      timestamp: new Date().toISOString()
    });
    
    this.saveMessages();
  }

  showTypingIndicator() {
    this.elements.typingIndicator = createElement('div', {
      className: 'typing-indicator'
    });
    
    for (let i = 0; i < 3; i++) {
      const dot = createElement('div', { className: 'typing-dot' });
      this.elements.typingIndicator.appendChild(dot);
    }
    
    this.elements.messages.appendChild(this.elements.typingIndicator);
    this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
  }

  hideTypingIndicator() {
    if (this.elements.typingIndicator) {
      this.elements.typingIndicator.remove();
      this.elements.typingIndicator = null;
    }
  }

  autoResizeInput() {
    const input = this.elements.input;
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 100) + 'px';
  }

  initWebSocket() {
    this.apiClient.initWebSocket(
      (data) => {
        if (data.message) {
          this.addMessage(data.message, 'bot');
        }
      },
      (error) => {
        console.error('WebSocket error:', error);
      },
      () => {
        console.log('WebSocket connection closed');
      }
    );
  }

  loadPersistedState() {
    if (!this.config.behavior.persistState) return;
    
    const state = this.storage.getWidgetState();
    const messages = this.storage.getMessages();
    const conversationId = this.storage.getConversationId();
    
    if (state.isOpen) {
      this.isOpen = true;
      setTimeout(() => this.open(), 100);
    }
    
    if (messages.length > 0) {
      this.messages = messages;
      messages.forEach(msg => this.addMessage(msg.text, msg.type));
    }
    
    if (conversationId) {
      this.conversationId = conversationId;
    }
  }

  saveState() {
    if (!this.config.behavior.persistState) return;
    
    this.storage.saveWidgetState({
      isOpen: this.isOpen,
      isMinimized: this.isMinimized
    });
  }

  saveMessages() {
    if (!this.config.behavior.persistState) return;
    this.storage.saveMessages(this.messages);
  }

  getDefaultIcon() {
    return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>`;
  }

  getSendIcon() {
    return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"></line>
      <polygon points="22,2 15,22 11,13 2,9 22,2"></polygon>
    </svg>`;
  }

  destroy() {
    this.apiClient.disconnect();
    this.styleGenerator.destroy();
    this.elements.container.remove();
  }

  updateConfig(newConfig) {
    this.config = deepMerge(this.config, newConfig);
    this.styleGenerator.updateStyles(this.config);
    this.positionWidget();
  }
}

export default ChatWidget;