class ApiClient {
  constructor(config) {
    this.config = config;
    this.websocket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 1000;
  }

  async sendMessage(message, conversationId = null) {
    if (this.config.api && this.config.api.websocket) {
      return this.sendWebSocketMessage(message, conversationId);
    } else {
      return this.sendHttpMessage(message, conversationId);
    }
  }

  async sendHttpMessage(message, conversationId = null) {
    const url = this.config.apiUrl;
    const method = this.config.api?.method || 'POST';
    const timeout = this.config.api?.timeout || 30000;
    const headers = {
      'Content-Type': 'application/json',
      ...this.config.api?.headers
    };

    const body = {
      message: message,
      timestamp: new Date().toISOString(),
      ...(conversationId && { conversationId })
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: method === 'GET' ? undefined : JSON.stringify(body),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      
      throw new Error(`API request failed: ${error.message}`);
    }
  }

  initWebSocket(onMessage, onError, onClose) {
    if (this.websocket) {
      this.websocket.close();
    }

    try {
      this.websocket = new WebSocket(this.config.apiUrl);
      
      this.websocket.onopen = () => {
        this.reconnectAttempts = 0;
        console.log('WebSocket connected');
      };
      
      this.websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };
      
      this.websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
        onError(error);
      };
      
      this.websocket.onclose = () => {
        console.log('WebSocket disconnected');
        onClose();
        this.handleReconnect(onMessage, onError, onClose);
      };
      
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
      onError(error);
    }
  }

  sendWebSocketMessage(message, conversationId = null) {
    return new Promise((resolve, reject) => {
      if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
        reject(new Error('WebSocket not connected'));
        return;
      }

      const messageData = {
        message: message,
        timestamp: new Date().toISOString(),
        ...(conversationId && { conversationId })
      };

      try {
        this.websocket.send(JSON.stringify(messageData));
        resolve({
          success: true,
          data: messageData,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        reject(new Error(`WebSocket send failed: ${error.message}`));
      }
    });
  }

  handleReconnect(onMessage, onError, onClose) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.initWebSocket(onMessage, onError, onClose);
      }, this.reconnectInterval * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  disconnect() {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
  }

  isConnected() {
    return this.websocket && this.websocket.readyState === WebSocket.OPEN;
  }
}

export default ApiClient;