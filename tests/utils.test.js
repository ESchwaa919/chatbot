import { 
  deepMerge, 
  generateId, 
  sanitizeHtml, 
  debounce, 
  throttle, 
  validateConfig, 
  isMobile, 
  createElement 
} from '../src/utils.js';

describe('Utils', () => {
  describe('deepMerge', () => {
    test('merges simple objects', () => {
      const target = { a: 1, b: 2 };
      const source = { b: 3, c: 4 };
      const result = deepMerge(target, source);
      
      expect(result).toEqual({ a: 1, b: 3, c: 4 });
    });

    test('merges nested objects', () => {
      const target = { a: { x: 1, y: 2 } };
      const source = { a: { y: 3, z: 4 } };
      const result = deepMerge(target, source);
      
      expect(result).toEqual({ a: { x: 1, y: 3, z: 4 } });
    });

    test('handles arrays as simple values', () => {
      const target = { a: [1, 2] };
      const source = { a: [3, 4] };
      const result = deepMerge(target, source);
      
      expect(result).toEqual({ a: [3, 4] });
    });
  });

  describe('generateId', () => {
    test('generates unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^chat-widget-\d+-[a-z0-9]+$/);
    });
  });

  describe('sanitizeHtml', () => {
    test('escapes HTML entities', () => {
      const input = '<script>alert("xss")</script>';
      const result = sanitizeHtml(input);
      
      expect(result).toBe('&lt;script&gt;alert("xss")&lt;/script&gt;');
    });

    test('handles plain text', () => {
      const input = 'Hello world';
      const result = sanitizeHtml(input);
      
      expect(result).toBe('Hello world');
    });
  });

  describe('debounce', () => {
    test('delays function execution', (done) => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);
      
      debouncedFn();
      debouncedFn();
      debouncedFn();
      
      expect(mockFn).not.toHaveBeenCalled();
      
      setTimeout(() => {
        expect(mockFn).toHaveBeenCalledTimes(1);
        done();
      }, 150);
    });
  });

  describe('throttle', () => {
    test('limits function execution rate', (done) => {
      const mockFn = jest.fn();
      const throttledFn = throttle(mockFn, 100);
      
      throttledFn();
      throttledFn();
      throttledFn();
      
      expect(mockFn).toHaveBeenCalledTimes(1);
      
      setTimeout(() => {
        throttledFn();
        expect(mockFn).toHaveBeenCalledTimes(2);
        done();
      }, 150);
    });
  });

  describe('validateConfig', () => {
    test('validates required apiUrl', () => {
      const config = {};
      const errors = validateConfig(config);
      
      expect(errors).toContain('apiUrl is required');
    });

    test('validates position values', () => {
      const config = { 
        apiUrl: 'https://api.example.com',
        position: 'invalid-position'
      };
      const errors = validateConfig(config);
      
      expect(errors).toContain('position must be one of: bottom-right, bottom-left, top-right, top-left');
    });

    test('validates API method', () => {
      const config = { 
        apiUrl: 'https://api.example.com',
        api: { method: 'PUT' }
      };
      const errors = validateConfig(config);
      
      expect(errors).toContain('api.method must be GET or POST');
    });

    test('returns empty array for valid config', () => {
      const config = { 
        apiUrl: 'https://api.example.com',
        position: 'bottom-right',
        api: { method: 'POST' }
      };
      const errors = validateConfig(config);
      
      expect(errors).toEqual([]);
    });
  });

  describe('isMobile', () => {
    test('detects mobile based on window width', () => {
      Object.defineProperty(window, 'innerWidth', { value: 600, writable: true });
      expect(isMobile()).toBe(true);
      
      Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
      expect(isMobile()).toBe(false);
    });

    test('detects mobile based on user agent', () => {
      Object.defineProperty(navigator, 'userAgent', { 
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
        writable: true 
      });
      expect(isMobile()).toBe(true);
    });
  });

  describe('createElement', () => {
    test('creates element with attributes', () => {
      const element = createElement('div', {
        className: 'test-class',
        id: 'test-id'
      });
      
      expect(element.tagName).toBe('DIV');
      expect(element.className).toBe('test-class');
      expect(element.id).toBe('test-id');
    });

    test('creates element with children', () => {
      const child = createElement('span', {}, ['Child text']);
      const parent = createElement('div', {}, [child]);
      
      expect(parent.children.length).toBe(1);
      expect(parent.children[0].tagName).toBe('SPAN');
      expect(parent.children[0].textContent).toBe('Child text');
    });

    test('handles innerHTML attribute', () => {
      const element = createElement('div', {
        innerHTML: '<strong>Bold text</strong>'
      });
      
      expect(element.innerHTML).toBe('<strong>Bold text</strong>');
    });
  });
});