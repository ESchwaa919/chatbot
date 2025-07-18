import { jest } from '@jest/globals';

global.fetch = jest.fn();
global.WebSocket = jest.fn();

Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
  },
  writable: true
});

Object.defineProperty(navigator, 'userAgent', {
  value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  writable: true
});

Object.defineProperty(window, 'innerWidth', {
  value: 1024,
  writable: true
});

Object.defineProperty(window, 'innerHeight', {
  value: 768,
  writable: true
});

global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}));