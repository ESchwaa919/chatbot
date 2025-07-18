import ApiClient from '../src/api.js';

describe('ApiClient', () => {
  let apiClient;
  let mockConfig;

  beforeEach(() => {
    mockConfig = {
      apiUrl: 'https://api.example.com/chat',
      api: {
        method: 'POST',
        timeout: 5000,
        headers: { 'Authorization': 'Bearer token' }
      }
    };
    
    apiClient = new ApiClient(mockConfig);
    
    global.fetch = jest.fn();
    global.WebSocket = jest.fn();
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    test('initializes with config', () => {
      expect(apiClient.config).toBe(mockConfig);
      expect(apiClient.websocket).toBeNull();
      expect(apiClient.reconnectAttempts).toBe(0);
    });
  });

  describe('sendMessage', () => {
    test('calls sendHttpMessage when websocket is disabled', async () => {
      apiClient.sendHttpMessage = jest.fn().mockResolvedValue({ success: true });
      
      await apiClient.sendMessage('Hello', 'conv-123');
      
      expect(apiClient.sendHttpMessage).toHaveBeenCalledWith('Hello', 'conv-123');
    });

    test('calls sendWebSocketMessage when websocket is enabled', async () => {
      apiClient.config.api.websocket = true;
      apiClient.sendWebSocketMessage = jest.fn().mockResolvedValue({ success: true });
      
      await apiClient.sendMessage('Hello', 'conv-123');
      
      expect(apiClient.sendWebSocketMessage).toHaveBeenCalledWith('Hello', 'conv-123');
    });
  });

  describe('sendHttpMessage', () => {
    test('sends POST request with correct parameters', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ message: 'Response', conversationId: 'conv-123' })
      };
      
      fetch.mockResolvedValue(mockResponse);
      
      const result = await apiClient.sendHttpMessage('Hello', 'conv-123');
      
      expect(fetch).toHaveBeenCalledWith('https://api.example.com/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer token'
        },
        body: JSON.stringify({
          message: 'Hello',
          timestamp: expect.any(String),
          conversationId: 'conv-123'
        }),
        signal: expect.any(AbortSignal)
      });
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ message: 'Response', conversationId: 'conv-123' });
    });

    test('handles GET requests', async () => {
      apiClient.config.api.method = 'GET';
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ message: 'Response' })
      };
      
      fetch.mockResolvedValue(mockResponse);
      
      await apiClient.sendHttpMessage('Hello');
      
      expect(fetch).toHaveBeenCalledWith(
        'https://api.example.com/chat',
        expect.objectContaining({
          method: 'GET',
          body: undefined
        })
      );
    });

    test('handles HTTP errors', async () => {
      const mockResponse = { ok: false, status: 500 };
      fetch.mockResolvedValue(mockResponse);
      
      await expect(apiClient.sendHttpMessage('Hello'))
        .rejects.toThrow('API request failed: HTTP error! status: 500');
    });

    test('handles network errors', async () => {
      fetch.mockRejectedValue(new Error('Network error'));
      
      await expect(apiClient.sendHttpMessage('Hello'))
        .rejects.toThrow('API request failed: Network error');
    });

    test('handles request timeout', async () => {
      fetch.mockImplementation(() => new Promise(() => {})); // Never resolves
      apiClient.config.api.timeout = 100;
      
      await expect(apiClient.sendHttpMessage('Hello'))
        .rejects.toThrow('Request timeout');
    });
  });

  describe('WebSocket functionality', () => {
    let mockWebSocket;

    beforeEach(() => {
      mockWebSocket = {
        close: jest.fn(),
        send: jest.fn(),
        readyState: WebSocket.OPEN,
        onopen: null,
        onmessage: null,
        onerror: null,
        onclose: null
      };
      
      Object.defineProperty(global, 'WebSocket', {
        value: jest.fn(() => mockWebSocket),
        writable: true
      });
    });

    test('initWebSocket creates WebSocket connection', () => {
      const onMessage = jest.fn();
      const onError = jest.fn();
      const onClose = jest.fn();
      
      apiClient.initWebSocket(onMessage, onError, onClose);
      
      expect(WebSocket).toHaveBeenCalledWith('https://api.example.com/chat');
      expect(apiClient.websocket).toBe(mockWebSocket);
    });

    test('handles WebSocket messages', () => {
      const onMessage = jest.fn();
      const onError = jest.fn();
      const onClose = jest.fn();
      
      apiClient.initWebSocket(onMessage, onError, onClose);
      
      const messageEvent = {
        data: JSON.stringify({ message: 'Hello from server' })
      };
      
      mockWebSocket.onmessage(messageEvent);
      
      expect(onMessage).toHaveBeenCalledWith({ message: 'Hello from server' });
    });

    test('handles invalid WebSocket messages', () => {
      const onMessage = jest.fn();
      const onError = jest.fn();
      const onClose = jest.fn();
      console.error = jest.fn();
      
      apiClient.initWebSocket(onMessage, onError, onClose);
      
      const messageEvent = { data: 'invalid-json' };
      mockWebSocket.onmessage(messageEvent);
      
      expect(console.error).toHaveBeenCalled();
      expect(onMessage).not.toHaveBeenCalled();
    });

    test('sendWebSocketMessage sends message', async () => {
      mockWebSocket.readyState = WebSocket.OPEN;
      apiClient.websocket = mockWebSocket;
      
      const result = await apiClient.sendWebSocketMessage('Hello', 'conv-123');
      
      expect(mockWebSocket.send).toHaveBeenCalledWith(JSON.stringify({
        message: 'Hello',
        timestamp: expect.any(String),
        conversationId: 'conv-123'
      }));
      
      expect(result.success).toBe(true);
    });

    test('sendWebSocketMessage rejects when not connected', async () => {
      apiClient.websocket = null;
      
      await expect(apiClient.sendWebSocketMessage('Hello'))
        .rejects.toThrow('WebSocket not connected');
    });

    test('disconnect closes WebSocket', () => {
      apiClient.websocket = mockWebSocket;
      
      apiClient.disconnect();
      
      expect(mockWebSocket.close).toHaveBeenCalled();
      expect(apiClient.websocket).toBeNull();
    });

    test('isConnected returns correct status', () => {
      expect(apiClient.isConnected()).toBe(false);
      
      apiClient.websocket = mockWebSocket;
      mockWebSocket.readyState = WebSocket.OPEN;
      
      expect(apiClient.isConnected()).toBe(true);
      
      mockWebSocket.readyState = WebSocket.CLOSED;
      
      expect(apiClient.isConnected()).toBe(false);
    });
  });

  describe('reconnection logic', () => {
    let mockWebSocket;

    beforeEach(() => {
      mockWebSocket = {
        close: jest.fn(),
        send: jest.fn(),
        readyState: WebSocket.OPEN,
        onopen: null,
        onmessage: null,
        onerror: null,
        onclose: null
      };
      
      global.WebSocket = jest.fn(() => mockWebSocket);
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('attempts reconnection on close', () => {
      const onMessage = jest.fn();
      const onError = jest.fn();
      const onClose = jest.fn();
      
      apiClient.initWebSocket(onMessage, onError, onClose);
      
      // Simulate connection close
      mockWebSocket.onclose();
      
      expect(apiClient.reconnectAttempts).toBe(0);
      
      // Fast-forward timer
      jest.advanceTimersByTime(1000);
      
      expect(apiClient.reconnectAttempts).toBe(1);
      expect(WebSocket).toHaveBeenCalledTimes(2); // Initial + reconnect
    });

    test('stops reconnecting after max attempts', () => {
      apiClient.maxReconnectAttempts = 2;
      const onMessage = jest.fn();
      const onError = jest.fn();
      const onClose = jest.fn();
      console.error = jest.fn();
      
      apiClient.initWebSocket(onMessage, onError, onClose);
      
      // Simulate multiple connection failures
      for (let i = 0; i < 3; i++) {
        mockWebSocket.onclose();
        jest.advanceTimersByTime(5000);
      }
      
      expect(apiClient.reconnectAttempts).toBe(2);
      expect(console.error).toHaveBeenCalledWith('Max reconnection attempts reached');
    });
  });
});