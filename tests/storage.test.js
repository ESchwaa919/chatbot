import Storage from '../src/storage.js';

describe('Storage', () => {
  let storage;
  const widgetId = 'test-widget-123';

  beforeEach(() => {
    storage = new Storage(widgetId);
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    test('sets widget ID and prefix', () => {
      expect(storage.widgetId).toBe(widgetId);
      expect(storage.prefix).toBe(`chat-widget-${widgetId}`);
    });
  });

  describe('get', () => {
    test('retrieves and parses stored data', () => {
      const testData = { message: 'test' };
      localStorage.getItem.mockReturnValue(JSON.stringify(testData));
      
      const result = storage.get('test-key');
      
      expect(localStorage.getItem).toHaveBeenCalledWith(`chat-widget-${widgetId}-test-key`);
      expect(result).toEqual(testData);
    });

    test('returns null for non-existent data', () => {
      localStorage.getItem.mockReturnValue(null);
      
      const result = storage.get('non-existent-key');
      
      expect(result).toBeNull();
    });

    test('handles JSON parse errors', () => {
      localStorage.getItem.mockReturnValue('invalid-json');
      console.warn = jest.fn();
      
      const result = storage.get('invalid-key');
      
      expect(result).toBeNull();
      expect(console.warn).toHaveBeenCalled();
    });
  });

  describe('set', () => {
    test('stores data as JSON string', () => {
      const testData = { message: 'test' };
      localStorage.setItem.mockReturnValue(undefined);
      
      const result = storage.set('test-key', testData);
      
      expect(localStorage.setItem).toHaveBeenCalledWith(
        `chat-widget-${widgetId}-test-key`,
        JSON.stringify(testData)
      );
      expect(result).toBe(true);
    });

    test('handles storage errors', () => {
      localStorage.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });
      console.warn = jest.fn();
      
      const result = storage.set('test-key', 'data');
      
      expect(result).toBe(false);
      expect(console.warn).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    test('removes item from storage', () => {
      localStorage.removeItem.mockReturnValue(undefined);
      
      const result = storage.remove('test-key');
      
      expect(localStorage.removeItem).toHaveBeenCalledWith(`chat-widget-${widgetId}-test-key`);
      expect(result).toBe(true);
    });

    test('handles removal errors', () => {
      localStorage.removeItem.mockImplementation(() => {
        throw new Error('Storage error');
      });
      console.warn = jest.fn();
      
      const result = storage.remove('test-key');
      
      expect(result).toBe(false);
      expect(console.warn).toHaveBeenCalled();
    });
  });

  describe('clear', () => {
    test('clears all widget-related data', () => {
      Object.defineProperty(localStorage, 'keys', {
        value: jest.fn().mockReturnValue([
          `chat-widget-${widgetId}-messages`,
          `chat-widget-${widgetId}-state`,
          'other-app-data'
        ])
      });
      
      Object.keys = jest.fn().mockReturnValue([
        `chat-widget-${widgetId}-messages`,
        `chat-widget-${widgetId}-state`,
        'other-app-data'
      ]);
      
      localStorage.removeItem.mockReturnValue(undefined);
      
      const result = storage.clear();
      
      expect(localStorage.removeItem).toHaveBeenCalledTimes(2);
      expect(result).toBe(true);
    });
  });

  describe('convenience methods', () => {
    test('getMessages returns empty array by default', () => {
      storage.get = jest.fn().mockReturnValue(null);
      
      const result = storage.getMessages();
      
      expect(storage.get).toHaveBeenCalledWith('messages');
      expect(result).toEqual([]);
    });

    test('saveMessages calls set with messages', () => {
      const messages = [{ text: 'Hello', type: 'user' }];
      storage.set = jest.fn().mockReturnValue(true);
      
      const result = storage.saveMessages(messages);
      
      expect(storage.set).toHaveBeenCalledWith('messages', messages);
      expect(result).toBe(true);
    });

    test('getWidgetState returns default state', () => {
      storage.get = jest.fn().mockReturnValue(null);
      
      const result = storage.getWidgetState();
      
      expect(storage.get).toHaveBeenCalledWith('widget-state');
      expect(result).toEqual({ isOpen: false, isMinimized: false });
    });

    test('saveWidgetState calls set with state', () => {
      const state = { isOpen: true, isMinimized: false };
      storage.set = jest.fn().mockReturnValue(true);
      
      const result = storage.saveWidgetState(state);
      
      expect(storage.set).toHaveBeenCalledWith('widget-state', state);
      expect(result).toBe(true);
    });

    test('getUserData returns empty object by default', () => {
      storage.get = jest.fn().mockReturnValue(null);
      
      const result = storage.getUserData();
      
      expect(storage.get).toHaveBeenCalledWith('user-data');
      expect(result).toEqual({});
    });

    test('getConversationId returns stored conversation ID', () => {
      const conversationId = 'conv-123';
      storage.get = jest.fn().mockReturnValue(conversationId);
      
      const result = storage.getConversationId();
      
      expect(storage.get).toHaveBeenCalledWith('conversation-id');
      expect(result).toBe(conversationId);
    });
  });
});