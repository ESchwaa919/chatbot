// Thinkrific Integration Script - Single Line Version
// This script extracts the video title from the page title and initializes the CHE chat widget

(function() {
  // Extract video title from page title and map to video ID
  const titleElement = document.querySelector('title');
  const title = titleElement ? titleElement.textContent : '';
  
  // Create a simple hash-based video ID mapping from the title
  // This maps the title to a consistent video ID
  const videoId = title ? btoa(title.split(' ')[0]).replace(/[^a-zA-Z0-9]/g, '').substring(0, 8) : '87';
  
  // Load the chat widget script
  const script = document.createElement('script');
  script.src = 'https://YOUR_RENDER_DOMAIN.onrender.com/widget/dist/chat-widget.js';
  script.defer = true;
  
  script.onload = function() {
    // Initialize the chat widget once loaded
    if (window.ChatWidget) {
      window.ChatWidget.init({
        apiUrl: 'https://YOUR_RENDER_DOMAIN.onrender.com',
        videoId: videoId,
        position: 'bottom-right',
        colors: {
          buttonBackground: '#6B8E5A',
          buttonHover: '#5A7B4A',
          userMessageBg: '#6B8E5A',
          headerBg: '#6B8E5A',
          chatBorder: '#6B8E5A'
        },
        behavior: {
          autoOpen: false,
          persistState: true
        }
      });
    }
  };
  
  document.head.appendChild(script);
})();