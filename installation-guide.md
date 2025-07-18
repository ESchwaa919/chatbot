# 🚀 Chat Widget Installation Guide

## Method 1: Simple Copy & Paste

### Step 1: Add CSS to your website's `<head>` section

```html
<style>
.chat-widget {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 9999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.chat-button {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: #007bff;
    color: white;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 12px rgba(0,0,0,0.15);
    transition: all 0.3s ease;
    font-size: 20px;
}

.chat-button:hover {
    background: #0056b3;
    transform: scale(1.05);
}

.chat-window {
    width: 350px;
    height: 500px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 5px 40px rgba(0,0,0,0.16);
    display: none;
    flex-direction: column;
    overflow: hidden;
    animation: fadeIn 0.3s ease;
}

.chat-window.open { display: flex; }

.chat-header {
    padding: 16px;
    background: #f8f9fa;
    border-bottom: 1px solid #e0e0e0;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.chat-title {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
}

.close-btn {
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    padding: 4px;
}

.chat-messages {
    flex: 1;
    padding: 16px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.message {
    max-width: 80%;
    padding: 8px 12px;
    border-radius: 18px;
    word-wrap: break-word;
}

.message.user {
    align-self: flex-end;
    background: #007bff;
    color: white;
}

.message.bot {
    align-self: flex-start;
    background: #f1f1f1;
    color: #333;
}

.chat-input {
    padding: 16px;
    border-top: 1px solid #e0e0e0;
    display: flex;
    gap: 8px;
}

.input-field {
    flex: 1;
    border: 1px solid #e0e0e0;
    border-radius: 20px;
    padding: 8px 16px;
    font-size: 14px;
    outline: none;
}

.send-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: #007bff;
    color: white;
    border: none;
    cursor: pointer;
}

@keyframes fadeIn {
    from { opacity: 0; transform: scale(0.8); }
    to { opacity: 1; transform: scale(1); }
}

/* Responsive */
@media (max-width: 768px) {
    .chat-window {
        width: 100vw !important;
        height: 100vh !important;
        border-radius: 0 !important;
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
    }
}
</style>
```

### Step 2: Add HTML before closing `</body>` tag

```html
<!-- Chat Widget -->
<div class="chat-widget">
    <button class="chat-button" id="chatToggle">💬</button>
    
    <div class="chat-window" id="chatWindow">
        <div class="chat-header">
            <h3 class="chat-title">Support Chat</h3>
            <button class="close-btn" id="closeChat">×</button>
        </div>
        
        <div class="chat-messages" id="chatMessages">
            <div class="message bot">
                Hello! How can I help you today?
            </div>
        </div>
        
        <div class="chat-input">
            <input type="text" class="input-field" id="messageInput" placeholder="Type a message...">
            <button class="send-btn" id="sendBtn">➤</button>
        </div>
    </div>
</div>

<script>
// Replace YOUR_API_ENDPOINT with your actual chat API
const API_ENDPOINT = 'https://your-api.com/chat';

class ChatWidget {
    constructor() {
        this.isOpen = false;
        this.initElements();
        this.bindEvents();
    }
    
    initElements() {
        this.toggleBtn = document.getElementById('chatToggle');
        this.window = document.getElementById('chatWindow');
        this.closeBtn = document.getElementById('closeChat');
        this.messages = document.getElementById('chatMessages');
        this.input = document.getElementById('messageInput');
        this.sendBtn = document.getElementById('sendBtn');
    }
    
    bindEvents() {
        this.toggleBtn.addEventListener('click', () => this.toggle());
        this.closeBtn.addEventListener('click', () => this.close());
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
    }
    
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }
    
    open() {
        this.isOpen = true;
        this.window.classList.add('open');
        this.toggleBtn.style.display = 'none';
        this.input.focus();
    }
    
    close() {
        this.isOpen = false;
        this.window.classList.remove('open');
        this.toggleBtn.style.display = 'flex';
    }
    
    addMessage(text, type) {
        const messageEl = document.createElement('div');
        messageEl.className = `message ${type}`;
        messageEl.textContent = text;
        this.messages.appendChild(messageEl);
        this.messages.scrollTop = this.messages.scrollHeight;
    }
    
    async sendMessage() {
        const message = this.input.value.trim();
        if (!message) return;
        
        // Add user message
        this.addMessage(message, 'user');
        this.input.value = '';
        
        try {
            // Send to your API
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    timestamp: new Date().toISOString()
                })
            });
            
            const data = await response.json();
            this.addMessage(data.message || 'Thanks for your message!', 'bot');
            
        } catch (error) {
            console.error('Chat API error:', error);
            this.addMessage('Sorry, something went wrong. Please try again.', 'bot');
        }
    }
}

// Initialize widget when page loads
document.addEventListener('DOMContentLoaded', () => {
    new ChatWidget();
});
</script>
```

## Method 2: External Script (Advanced)

### Step 1: Host the built widget file

After running `npm run build`, upload `dist/chat-widget.min.js` to your server.

### Step 2: Include the script

```html
<script src="https://your-domain.com/path/to/chat-widget.min.js"></script>
<script>
ChatWidget.init({
    apiUrl: 'https://your-api.com/chat',
    position: 'bottom-right',
    colors: {
        buttonBackground: '#007bff',
        userMessageBg: '#007bff'
    },
    locale: {
        strings: {
            headerTitle: 'Support Chat',
            placeholder: 'How can we help?'
        }
    }
});
</script>
```

## Method 3: CDN Installation (Future)

```html
<!-- Future CDN installation -->
<script src="https://cdn.jsdelivr.net/npm/embeddable-chat-widget@1.0.0/dist/chat-widget.min.js"></script>
<script>
ChatWidget.init({
    apiUrl: 'https://your-api.com/chat'
});
</script>
```

## Customization Examples

### Change Colors
```javascript
ChatWidget.init({
    apiUrl: 'https://your-api.com/chat',
    colors: {
        buttonBackground: '#28a745',    // Green button
        buttonHover: '#218838',
        userMessageBg: '#28a745',
        botMessageBg: '#f8f9fa',
        background: '#ffffff'
    }
});
```

### Change Position
```javascript
ChatWidget.init({
    apiUrl: 'https://your-api.com/chat',
    position: 'bottom-left',  // or 'top-right', 'top-left'
    offset: { x: 30, y: 30 }  // 30px from edges
});
```

### Custom Text
```javascript
ChatWidget.init({
    apiUrl: 'https://your-api.com/chat',
    locale: {
        strings: {
            headerTitle: 'Customer Support',
            placeholder: 'Ask us anything...',
            sendButton: 'Send Message',
            errorMessage: 'Connection failed. Please try again.'
        }
    }
});
```

### API Integration
Your API should accept POST requests with this format:
```json
{
    "message": "User's message text",
    "timestamp": "2024-01-01T12:00:00Z",
    "conversationId": "optional-conversation-id"
}
```

And respond with:
```json
{
    "message": "Bot response text",
    "timestamp": "2024-01-01T12:00:01Z",
    "conversationId": "conversation-id"
}
```

## Testing Locally

1. Create an HTML file with the code above
2. Replace `API_ENDPOINT` with your actual API
3. Open the file in your browser
4. Test the chat functionality

## WordPress Installation

For WordPress, add the CSS to your theme's style.css and the HTML/JavaScript to your theme's footer.php file.

## React/Vue/Angular Integration

For modern frameworks, use the built JavaScript library and initialize it in your component's mount/effect lifecycle.