class Storage {
  constructor(widgetId) {
    this.widgetId = widgetId;
    this.prefix = `chat-widget-${widgetId}`;
  }

  get(key) {
    try {
      const item = localStorage.getItem(`${this.prefix}-${key}`);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.warn('Failed to get from localStorage:', error);
      return null;
    }
  }

  set(key, value) {
    try {
      localStorage.setItem(`${this.prefix}-${key}`, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn('Failed to set to localStorage:', error);
      return false;
    }
  }

  remove(key) {
    try {
      localStorage.removeItem(`${this.prefix}-${key}`);
      return true;
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error);
      return false;
    }
  }

  clear() {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith(this.prefix));
      keys.forEach(key => localStorage.removeItem(key));
      return true;
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
      return false;
    }
  }

  getMessages() {
    return this.get('messages') || [];
  }

  saveMessages(messages) {
    return this.set('messages', messages);
  }

  getWidgetState() {
    return this.get('widget-state') || { isOpen: false, isMinimized: false };
  }

  saveWidgetState(state) {
    return this.set('widget-state', state);
  }

  getUserData() {
    return this.get('user-data') || {};
  }

  saveUserData(userData) {
    return this.set('user-data', userData);
  }

  getConversationId() {
    return this.get('conversation-id');
  }

  saveConversationId(conversationId) {
    return this.set('conversation-id', conversationId);
  }
}

export default Storage;