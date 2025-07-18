const OpenAI = require('openai');
const { VideoService } = require('./videoService');

class ChatService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.videoService = new VideoService();
    
    // In-memory storage for chat sessions
    // In production, this should be replaced with a proper database
    this.chatSessions = new Map();
  }

  async processMessage({ videoId, message, sessionId, videoSummary }) {
    try {
      // Validate OpenAI API key
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured');
      }

      // Get or create session
      const session = this.getOrCreateSession(videoId, sessionId);
      
      // Get video information
      const video = await this.videoService.getVideoById(videoId);
      const videoName = video?.name || 'Unknown Video';
      
      // Add user message to session
      session.messages.push({
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      });

      // Build the prompt with video context
      const prompt = this.buildPrompt(message, videoSummary, videoName, session.messages);
      
      // Get response from OpenAI
      const response = await this.getOpenAIResponse(prompt, session.messages);
      
      // Add assistant response to session
      session.messages.push({
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      });

      return {
        message: response,
        sessionId: session.id,
        videoId: videoId
      };
    } catch (error) {
      console.error('Error processing message:', error);
      throw error;
    }
  }

  async getOpenAIResponse(prompt, conversationHistory) {
    try {
      // Build messages for OpenAI
      const messages = [
        {
          role: 'system',
          content: this.getSystemPrompt()
        }
      ];

      // Add recent conversation history (last 10 messages, excluding the current one)
      const recentHistory = conversationHistory.slice(-11, -1); // Get last 10 messages, excluding current
      recentHistory.forEach(msg => {
        if (msg.role === 'user' || msg.role === 'assistant') {
          messages.push({
            role: msg.role,
            content: msg.content
          });
        }
      });

      // Add the current message with video context
      messages.push({
        role: 'user',
        content: prompt
      });

      // Use Responses API with gpt-4o-mini
      const response = await this.openai.responses.create({
        model: process.env.DEFAULT_MODEL || 'gpt-4o-mini',
        input: messages,
        max_output_tokens: parseInt(process.env.MAX_TOKENS) || 1000,
        temperature: parseFloat(process.env.TEMPERATURE) || 0.1
      });

      // Responses API returns output_text directly or in output array
      return response.output_text || response.output[0]?.content?.[0]?.text || 'No response received';
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to get response from OpenAI');
    }
  }

  async getStreamingResponse({ videoId, message, sessionId, videoSummary }) {
    try {
      // Get or create session
      const session = this.getOrCreateSession(videoId, sessionId);
      
      // Get video information
      const video = await this.videoService.getVideoById(videoId);
      const videoName = video?.name || 'Unknown Video';
      
      // Add user message to session
      session.messages.push({
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      });

      // Build the prompt with video context
      const prompt = this.buildPrompt(message, videoSummary, videoName, session.messages);
      
      // Build messages for OpenAI with conversation history
      const messages = [
        {
          role: 'system',
          content: this.getSystemPrompt()
        }
      ];

      // Add recent conversation history (last 10 messages, excluding the current one)
      const recentHistory = session.messages.slice(-11, -1); // Get last 10 messages, excluding current
      recentHistory.forEach(msg => {
        if (msg.role === 'user' || msg.role === 'assistant') {
          messages.push({
            role: msg.role,
            content: msg.content
          });
        }
      });

      // Add the current message with video context
      messages.push({
        role: 'user',
        content: prompt
      });

      // Create streaming response using Responses API
      const stream = await this.openai.responses.create({
        model: process.env.DEFAULT_MODEL || 'gpt-4o-mini',
        input: messages,
        max_output_tokens: parseInt(process.env.MAX_TOKENS) || 1000,
        temperature: parseFloat(process.env.TEMPERATURE) || 0.1,
        stream: true
      });

      return { stream, sessionId: session.id };
    } catch (error) {
      console.error('Error creating streaming response:', error);
      throw error;
    }
  }

  buildPrompt(question, videoSummary, videoName, conversationHistory) {
    return `The name of the video is: 
<video_name>${videoName}</video_name>

Here is the video summary:
<video_summary>${videoSummary}</video_summary>

User question: ${question}

Please answer based on the video content above. Maintain conversation flow and refer to previous context when relevant.`;
  }

  getOrCreateSession(videoId, sessionId) {
    const key = `${videoId}:${sessionId || 'default'}`;
    
    if (!this.chatSessions.has(key)) {
      this.chatSessions.set(key, {
        id: sessionId || this.generateSessionId(),
        videoId: videoId,
        messages: [],
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString()
      });
    }

    const session = this.chatSessions.get(key);
    session.lastActivity = new Date().toISOString();
    
    return session;
  }

  getSystemPrompt() {
    return `You are a helpful assistant for the Centre for Homeopathic Education (CHE). You help students understand homeopathic lectures and concepts.

Key instructions:
1. Answer questions based on the provided video content
2. Maintain conversation flow by referencing previous questions and answers when relevant
3. Be conversational and engaging, not overly formal
4. Keep answers concise unless specifically asked for detailed explanations
5. When users ask follow-up questions, build on previous context
6. If asked about content not in the video, politely redirect to the video content
7. Use markdown formatting for your responses
8. Never repeat the user's question back to them
9. If you mention a concept that might need clarification (like "bold type fear"), be prepared to explain it
10. Always maintain context from the ongoing conversation

Your goal is to create a natural, flowing conversation about homeopathic education content.`;
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async getChatHistory(videoId, sessionId) {
    const key = `${videoId}:${sessionId || 'default'}`;
    const session = this.chatSessions.get(key);
    
    return session ? session.messages : [];
  }

  async clearChatHistory(videoId, sessionId) {
    const key = `${videoId}:${sessionId || 'default'}`;
    this.chatSessions.delete(key);
  }

  async getChatSessions(videoId) {
    const sessions = [];
    
    for (const [key, session] of this.chatSessions.entries()) {
      if (session.videoId === videoId) {
        sessions.push({
          id: session.id,
          videoId: session.videoId,
          messageCount: session.messages.length,
          createdAt: session.createdAt,
          lastActivity: session.lastActivity
        });
      }
    }
    
    return sessions;
  }

  // Clean up old sessions (call this periodically)
  cleanupOldSessions(maxAgeHours = 24) {
    const cutoff = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000);
    
    for (const [key, session] of this.chatSessions.entries()) {
      if (new Date(session.lastActivity) < cutoff) {
        this.chatSessions.delete(key);
      }
    }
  }
}

module.exports = { ChatService };