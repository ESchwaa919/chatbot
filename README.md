# CHE Chat Application

A modern, embeddable chat application built with Node.js and Socket.IO, designed specifically for the Centre for Homeopathic Education. This application provides an interactive chat interface for discussing video lecture content with AI-powered responses based on video summaries.

<div align="center">
<img src="./docs/demo.gif" alt="CHE Chat Demo" style="max-width: 100%"/>
</div>

## Features

- **Real-time Chat**: Socket.IO-powered streaming responses
- **Embeddable Widget**: Vanilla JavaScript widget that can be embedded in any website
- **Video-Contextual**: AI responses based on specific video lecture summaries
- **OpenAI Integration**: GPT-3.5-turbo with streaming support
- **CHE Branding**: Custom styling and configuration for CHE brand
- **Session Management**: Persistent chat sessions per video
- **Mobile Responsive**: Works on desktop and mobile devices
- **No Dependencies**: Widget has no external dependencies

## Getting Started

### Prerequisites

- Node.js 16.0.0 or higher
- OpenAI API key
- Video summary files and CSV index

### 🚀 Quick Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cheapp_v2
   ```

2. **Run the installation script**
   ```bash
   ./install.sh
   ```

3. **Configure environment variables**
   ```bash
   # Edit .env file and add your OpenAI API key
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Start the application**
   ```bash
   npm start
   ```

5. **Open your browser**
   - Navigate to `http://localhost:3000`
   - Select a video and start chatting!

### 📦 Manual Installation

If you prefer to install manually:

```bash
# Install backend dependencies
npm install

# Install and build widget
cd widget
npm install
npm run build
cd ..

# Copy widget files
mkdir -p public/widget/dist
cp widget/dist/* public/widget/dist/

# Create environment file
cp .env.example .env
# Edit .env and add your OpenAI API key
```

## Architecture

### Backend (Node.js + Express + Socket.IO)
- **Express Server**: RESTful API and static file serving
- **Socket.IO**: Real-time bidirectional communication
- **OpenAI Integration**: Streaming GPT responses
- **Video Content System**: CSV-based video-to-summary mapping

### Frontend (Embeddable Widget)
- **Vanilla JavaScript**: No external dependencies
- **Socket.IO Client**: Real-time chat communication
- **Customizable UI**: CHE-branded styling
- **Embeddable**: Easy integration into any website

## Usage

### Basic Usage

1. **Select a Video**: Choose from the available video lectures
2. **Ask Questions**: Type questions about the video content
3. **Get AI Responses**: Receive contextual answers based on video summaries
4. **Continue Conversation**: Chat history is maintained per video session

### Embedding the Widget

To embed the chat widget in your own website:

```html
<script src="https://your-domain.com/widget/dist/chat-widget.min.js"></script>
<script>
  const widgetId = ChatWidget.init({
    apiUrl: 'https://your-domain.com',
    videoId: '87',
    position: 'bottom-right',
    api: { websocket: true }
  });
</script>
```

### Configuration Options

The widget supports extensive customization:

```javascript
const config = {
  apiUrl: 'http://localhost:3000',
  videoId: '87',
  position: 'bottom-right', // 'bottom-left', 'top-right', 'top-left'
  colors: {
    buttonBackground: '#FFF051',
    headerBg: '#2E3C22',
    userMessageBg: '#F3F4F6',
    botMessageBg: '#FFFFFF'
  },
  behavior: {
    autoOpen: true,
    persistState: true
  }
};
```

## Development

### Development Mode

```bash
# Start with auto-reload
npm run dev

# Build widget only
npm run build

# Run tests
npm test
```

### Project Structure

```
cheapp_v2/
├── server.js              # Main Express server
├── services/              # Backend services
│   ├── chatService.js     # OpenAI integration
│   ├── videoService.js    # Video content management
│   └── socketService.js   # Socket.IO handling
├── routes/                # API routes
├── widget/                # Embeddable chat widget
│   ├── src/              # Widget source code
│   └── dist/             # Built widget files
├── public/               # Static files
└── summary/              # Video summary files
```

### API Endpoints

#### REST API
- `GET /api/video` - List all videos
- `GET /api/video/:id` - Get video details
- `POST /api/chat/message` - Send chat message (HTTP fallback)
- `GET /health` - Health check

#### Socket.IO Events
- `chat_message` - Send message
- `chat_response_chunk` - Receive response chunks
- `get_video_info` - Get video metadata
- `get_chat_history` - Load conversation history

## Migration from Reflex

This application was migrated from a Python Reflex application to Node.js. Key improvements include:

- **Real-time Streaming**: Socket.IO enables streaming OpenAI responses
- **Embeddable Widget**: Can be integrated into any website
- **Better Performance**: Node.js provides better concurrency
- **Modern Architecture**: Separation of concerns with services
- **Enhanced UX**: Real-time typing indicators and message chunks

## Contributing

We welcome contributions to improve the CHE Chat Application:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Deployment

### Production Setup

1. Set environment variables:
   ```bash
   export OPENAI_API_KEY="your_key_here"
   export NODE_ENV="production"
   export PORT="3000"
   ```

2. Install and build:
   ```bash
   npm install
   ./install.sh
   ```

3. Start the application:
   ```bash
   npm start
   ```

### Docker Support

A Dockerfile can be created for containerized deployment:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN ./install.sh
EXPOSE 3000
CMD ["npm", "start"]
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions or issues:
- Check the [CLAUDE.md](./CLAUDE.md) file for development guidance
- Review the Socket.IO and OpenAI documentation
- Submit issues through the repository issue tracker

---

**Centre for Homeopathic Education** - Enhancing learning through interactive AI-powered conversations.
