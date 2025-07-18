const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
require('dotenv').config();

const chatRoutes = require('./routes/chat');
const videoRoutes = require('./routes/video');
const { setupSocketHandlers } = require('./services/socketService');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST"]
  }
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development
}));
app.use(compression());

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || "*",
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving with proper MIME types
app.use('/static', express.static(path.join(__dirname, 'public')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/widget', express.static(path.join(__dirname, 'public/widget')));

// Favicon handling
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

// API routes
app.use('/api/chat', chatRoutes);
app.use('/api/video', videoRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve the demo page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Test page routes
app.get('/test-widget.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'test-widget.html'));
});

app.get('/test-chat.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'test-chat.html'));
});

app.get('/simple-test.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'simple-test.html'));
});

// Video-specific route
app.get('/video/:videoId', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'video.html'));
});

// Socket.IO setup
setupSocketHandlers(io);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`CHE Chat Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Demo available at: http://localhost:${PORT}`);
});

module.exports = app;