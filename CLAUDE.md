# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a CHE (Centre for Homeopathic Education) chat application built with Node.js and an embeddable chat widget. The application provides an interactive chat interface for discussing video lecture content from homeopathic education courses. Users can ask questions about specific videos, and the bot responds based on video summaries using OpenAI's GPT model with real-time streaming responses.

## Core Architecture

### Backend (Node.js + Express + Socket.IO)
- **Express Server**: RESTful API and static file serving
- **Socket.IO**: Real-time bidirectional communication for chat
- **OpenAI Integration**: GPT-4o-mini with Responses API and streaming support
- **Video Content System**: CSV-based mapping of video IDs to summary files

### Frontend (Embeddable Chat Widget)
- **Vanilla JavaScript**: No external dependencies
- **Socket.IO Client**: Real-time chat with backend
- **Customizable UI**: CHE-branded styling and configuration
- **Embeddable**: Can be integrated into any website

### Key Components
- `server.js`: Main Express server with Socket.IO setup
- `services/chatService.js`: OpenAI integration and chat session management
- `services/videoService.js`: Video content and CSV handling
- `services/socketService.js`: Socket.IO event handling
- `widget/`: Embeddable chat widget library
- `public/`: Static frontend files and demo pages

### Data Flow
1. Client connects via Socket.IO and joins video room
2. Video summary loaded from CSV-mapped text files
3. Chat messages sent via Socket.IO events
4. OpenAI processes messages with streaming responses
5. Real-time message chunks streamed back to client

## Development Commands

### Environment Setup
```bash
# Install all dependencies (includes widget build)
./install.sh

# Or manually:
npm install
cd widget && npm install && npm run build && cd ..
```

### Running the Application
```bash
# Production mode
npm start

# Development mode (with nodemon)
npm run dev

# Build widget only
npm run build
```

**Note**: The server automatically restarts when files change using nodemon in development mode. No need to manually restart the server after making code changes.

### Environment Variables
Required in `.env` file:
```bash
OPENAI_API_KEY=your_openai_api_key_here
PORT=3000
NODE_ENV=development
```

## Key Development Notes

### Backend Services

#### ChatService (`services/chatService.js`)
- Manages chat sessions per video ID
- Handles OpenAI **Responses API** integration with streaming
- Uses **gpt-4o-mini** model for enhanced performance
- Provides conversation history and context
- Session cleanup and memory management

**OpenAI Responses API Details:**
- Uses `openai.responses.create()` instead of chat completions
- Parameter: `input` instead of `messages` for conversation
- Response: `output_text` for direct text access
- Tokens: `max_output_tokens` instead of `max_tokens`
- Streaming: Supports real-time streaming responses

#### VideoService (`services/videoService.js`)
- Loads video metadata from `summary.csv`
- Reads video summaries from text files
- Provides search and filtering capabilities
- Video validation and path mapping

#### SocketService (`services/socketService.js`)
- Real-time chat message handling
- Video room management
- Streaming response coordination
- Error handling and reconnection

### Frontend Widget

#### Widget Configuration
```javascript
const config = {
  apiUrl: 'http://localhost:3000',
  videoId: '87',
  position: 'bottom-right',
  api: { websocket: true },
  colors: {
    buttonBackground: '#FFF051',
    headerBg: '#2E3C22',
    // ... CHE brand colors
  }
};
```

#### Socket.IO Events
- `join_video`: Join video-specific room
- `chat_message`: Send message to bot
- `chat_response_chunk`: Receive streaming response
- `chat_response_complete`: Response finished
- `get_chat_history`: Load conversation history

### Video Content System
- Video summaries in `summary/` directory structure
- CSV index with ID, name, path, metadata
- Automatic session creation per video
- Route-based video selection: `/video/[video_id]`

### Real-time Features
- Streaming OpenAI responses via Socket.IO
- Typing indicators and message chunks
- Connection state management
- Automatic reconnection handling

## API Endpoints

### REST API
- `GET /api/video` - List all videos
- `GET /api/video/:id` - Get video details
- `POST /api/chat/message` - Send chat message (HTTP fallback)
- `GET /health` - Server health check

### Socket.IO Events
- `chat_message` - Send message
- `chat_response_chunk` - Receive response chunks
- `get_video_info` - Get video metadata
- `get_chat_history` - Load conversation history

## Deployment Notes

### Requirements
- Node.js 16+
- OpenAI API key
- CSV file and summary text files
- Static file serving capability

### Production Setup
1. Set environment variables
2. Run `npm install` and `./install.sh`
3. Start with `npm start`
4. Configure reverse proxy if needed
5. Monitor logs and performance

### Widget Integration
The chat widget can be embedded in any website:
```html
<script src="https://your-domain.com/widget/dist/chat-widget.min.js"></script>
<script>
  const widgetId = ChatWidget.init({
    apiUrl: 'https://your-domain.com',
    videoId: '87'
  });
</script>
```