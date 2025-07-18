import ChatWidget from './widget.js';
import { validateConfig } from './utils.js';

class ChatWidgetSDK {
  constructor() {
    this.instances = new Map();
    this.defaultConfig = {};
  }

  init(config) {
    const errors = validateConfig(config);
    if (errors.length > 0) {
      throw new Error(`Configuration validation failed: ${errors.join(', ')}`);
    }

    const widgetId = `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const widget = new ChatWidget(config);
    
    this.instances.set(widgetId, widget);
    return widgetId;
  }

  getInstance(widgetId) {
    return this.instances.get(widgetId);
  }

  getAllInstances() {
    return Array.from(this.instances.values());
  }

  destroy(widgetId) {
    const widget = this.instances.get(widgetId);
    if (widget) {
      widget.destroy();
      this.instances.delete(widgetId);
      return true;
    }
    return false;
  }

  destroyAll() {
    this.instances.forEach(widget => widget.destroy());
    this.instances.clear();
  }

  updateConfig(widgetId, newConfig) {
    const widget = this.instances.get(widgetId);
    if (widget) {
      const errors = validateConfig(newConfig);
      if (errors.length > 0) {
        throw new Error(`Configuration validation failed: ${errors.join(', ')}`);
      }
      widget.updateConfig(newConfig);
      return true;
    }
    return false;
  }

  setDefaultConfig(config) {
    this.defaultConfig = config;
  }

  getDefaultConfig() {
    return this.defaultConfig;
  }
}

const sdk = new ChatWidgetSDK();

window.ChatWidget = {
  init: (config) => sdk.init(config),
  getInstance: (widgetId) => sdk.getInstance(widgetId),
  getAllInstances: () => sdk.getAllInstances(),
  destroy: (widgetId) => sdk.destroy(widgetId),
  destroyAll: () => sdk.destroyAll(),
  updateConfig: (widgetId, newConfig) => sdk.updateConfig(widgetId, newConfig),
  setDefaultConfig: (config) => sdk.setDefaultConfig(config),
  getDefaultConfig: () => sdk.getDefaultConfig()
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = window.ChatWidget;
}

export default window.ChatWidget;