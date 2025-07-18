const { ChatService } = require('./chatService');
const { VideoService } = require('./videoService');

class SocketService {
  constructor() {
    this.chatService = new ChatService();
    this.videoService = new VideoService();
  }

  setupSocketHandlers(io) {
    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      // Join video room
      socket.on('join_video', (videoId) => {
        socket.join(`video_${videoId}`);
        console.log(`Socket ${socket.id} joined video room: ${videoId}`);
      });

      // Leave video room
      socket.on('leave_video', (videoId) => {
        socket.leave(`video_${videoId}`);
        console.log(`Socket ${socket.id} left video room: ${videoId}`);
      });

      // Handle chat message with streaming response
      socket.on('chat_message', async (data) => {
        try {
          const { videoId, message, sessionId } = data;

          if (!videoId || !message) {
            socket.emit('error', { message: 'videoId and message are required' });
            return;
          }

          // Get video summary
          const videoSummary = await this.videoService.getVideoSummary(videoId);
          if (!videoSummary) {
            socket.emit('error', { message: 'Video not found' });
            return;
          }

          // Send acknowledgment that message was received
          socket.emit('message_received', {
            videoId,
            message,
            sessionId,
            timestamp: new Date().toISOString()
          });

          // Get streaming response
          const { stream, sessionId: finalSessionId } = await this.chatService.getStreamingResponse({
            videoId,
            message,
            sessionId,
            videoSummary
          });

          let fullResponse = '';
          
          // Stream the response
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              fullResponse += content;
              socket.emit('chat_response_chunk', {
                videoId,
                sessionId: finalSessionId,
                chunk: content,
                timestamp: new Date().toISOString()
              });
            }
          }

          // Send completion signal
          socket.emit('chat_response_complete', {
            videoId,
            sessionId: finalSessionId,
            fullResponse,
            timestamp: new Date().toISOString()
          });

          // Broadcast to other clients in the same video room (optional)
          socket.to(`video_${videoId}`).emit('user_activity', {
            socketId: socket.id,
            videoId,
            activity: 'message_sent',
            timestamp: new Date().toISOString()
          });

        } catch (error) {
          console.error('Error processing chat message:', error);
          socket.emit('error', { 
            message: 'Failed to process message',
            details: error.message
          });
        }
      });

      // Handle request for chat history
      socket.on('get_chat_history', async (data) => {
        try {
          const { videoId, sessionId } = data;
          const history = await this.chatService.getChatHistory(videoId, sessionId);
          
          socket.emit('chat_history', {
            videoId,
            sessionId,
            history,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          console.error('Error fetching chat history:', error);
          socket.emit('error', { 
            message: 'Failed to fetch chat history',
            details: error.message
          });
        }
      });

      // Handle clear chat history
      socket.on('clear_chat_history', async (data) => {
        try {
          const { videoId, sessionId } = data;
          await this.chatService.clearChatHistory(videoId, sessionId);
          
          socket.emit('chat_history_cleared', {
            videoId,
            sessionId,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          console.error('Error clearing chat history:', error);
          socket.emit('error', { 
            message: 'Failed to clear chat history',
            details: error.message
          });
        }
      });

      // Handle video info request
      socket.on('get_video_info', async (videoId) => {
        try {
          const video = await this.videoService.getVideoById(videoId);
          
          if (video) {
            socket.emit('video_info', {
              videoId,
              video,
              timestamp: new Date().toISOString()
            });
          } else {
            socket.emit('error', { message: 'Video not found' });
          }
        } catch (error) {
          console.error('Error fetching video info:', error);
          socket.emit('error', { 
            message: 'Failed to fetch video info',
            details: error.message
          });
        }
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });

      // Handle errors
      socket.on('error', (error) => {
        console.error('Socket error:', error);
      });
    });

    // Cleanup old sessions every hour
    setInterval(() => {
      this.chatService.cleanupOldSessions();
    }, 60 * 60 * 1000);
  }
}

function setupSocketHandlers(io) {
  const socketService = new SocketService();
  socketService.setupSocketHandlers(io);
}

module.exports = { SocketService, setupSocketHandlers };