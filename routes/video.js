const express = require('express');
const { VideoService } = require('../services/videoService');

const router = express.Router();
const videoService = new VideoService();

// Get video information by ID
router.get('/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    const video = await videoService.getVideoById(videoId);
    
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    res.json({ video });
  } catch (error) {
    console.error('Error fetching video:', error);
    res.status(500).json({ error: 'Failed to fetch video' });
  }
});

// Get video summary by ID
router.get('/:videoId/summary', async (req, res) => {
  try {
    const { videoId } = req.params;
    const summary = await videoService.getVideoSummary(videoId);
    
    if (!summary) {
      return res.status(404).json({ error: 'Video summary not found' });
    }

    res.json({ summary });
  } catch (error) {
    console.error('Error fetching video summary:', error);
    res.status(500).json({ error: 'Failed to fetch video summary' });
  }
});

// Get all videos
router.get('/', async (req, res) => {
  try {
    const videos = await videoService.getAllVideos();
    res.json({ videos });
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
});

// Search videos
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const videos = await videoService.searchVideos(query);
    res.json({ videos });
  } catch (error) {
    console.error('Error searching videos:', error);
    res.status(500).json({ error: 'Failed to search videos' });
  }
});

module.exports = router;