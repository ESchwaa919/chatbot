const express = require('express');
const { ChatService } = require('../services/chatService');
const { VideoService } = require('../services/videoService');

const router = express.Router();
const chatService = new ChatService();
const videoService = new VideoService();

// Get chat history for a specific video
router.get('/history/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    const history = await chatService.getChatHistory(videoId);
    res.json({ history });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

// Send a message
router.post('/message', async (req, res) => {
  try {
    const { videoId, message, sessionId } = req.body;

    if (!videoId || !message) {
      return res.status(400).json({ error: 'videoId and message are required' });
    }

    // Get video summary if needed
    const videoSummary = await videoService.getVideoSummary(videoId);
    if (!videoSummary) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Process the message
    const response = await chatService.processMessage({
      videoId,
      message,
      sessionId,
      videoSummary
    });

    res.json({ response });
  } catch (error) {
    console.error('Error processing message:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// Clear chat history for a video
router.delete('/history/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    await chatService.clearChatHistory(videoId);
    res.json({ message: 'Chat history cleared' });
  } catch (error) {
    console.error('Error clearing chat history:', error);
    res.status(500).json({ error: 'Failed to clear chat history' });
  }
});

// Get chat sessions for a video
router.get('/sessions/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    const sessions = await chatService.getChatSessions(videoId);
    res.json({ sessions });
  } catch (error) {
    console.error('Error fetching chat sessions:', error);
    res.status(500).json({ error: 'Failed to fetch chat sessions' });
  }
});

module.exports = router;