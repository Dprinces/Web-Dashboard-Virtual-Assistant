const { validationResult } = require('express-validator');
const OpenAI = require('openai');
const ChatMessage = require('../models/ChatMessage');
const { v4: uuidv4 } = require('uuid');

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'your-openai-api-key-here'
});

// Default system message for the assistant
const SYSTEM_MESSAGE = `You are a helpful virtual assistant for a student dashboard application. You can help with:
- Task and assignment management
- Note-taking and organization
- Study planning and scheduling
- General productivity advice
- Academic support

Be concise, helpful, and encouraging. If asked about features outside your scope, politely redirect to the appropriate section of the dashboard.`;

// Send message to AI and get response
const sendMessage = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { message, sessionId, context = 'general', model = 'gpt-3.5-turbo' } = req.body;
    const userId = req.userId;

    // Generate session ID if not provided
    const chatSessionId = sessionId || uuidv4();

    // Save user message
    const userMessage = new ChatMessage({
      user: userId,
      sessionId: chatSessionId,
      role: 'user',
      content: message,
      context,
      metadata: {
        model
      }
    });

    await userMessage.save();

    // Get recent conversation history (last 10 messages)
    const recentMessages = await ChatMessage.find({
      user: userId,
      sessionId: chatSessionId,
      isDeleted: { $ne: true }
    })
    .sort({ createdAt: -1 })
    .limit(10)
    .select('role content');

    // Prepare messages for OpenAI (reverse to get chronological order)
    const conversationHistory = recentMessages.reverse().map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Add system message at the beginning
    const messages = [
      { role: 'system', content: SYSTEM_MESSAGE },
      ...conversationHistory
    ];

    const startTime = Date.now();

    try {
      // Call OpenAI API
      const completion = await openai.chat.completions.create({
        model,
        messages,
        max_tokens: 1000,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      });

      const responseTime = Date.now() - startTime;
      const assistantResponse = completion.choices[0].message.content;

      // Save assistant response
      const assistantMessage = new ChatMessage({
        user: userId,
        sessionId: chatSessionId,
        role: 'assistant',
        content: assistantResponse,
        context,
        metadata: {
          model,
          tokens: {
            prompt: completion.usage.prompt_tokens,
            completion: completion.usage.completion_tokens,
            total: completion.usage.total_tokens
          },
          responseTime,
          temperature: 0.7
        }
      });

      await assistantMessage.save();

      res.json({
        message: assistantResponse,
        sessionId: chatSessionId,
        metadata: {
          model,
          tokens: completion.usage,
          responseTime
        }
      });

    } catch (openaiError) {
      console.error('OpenAI API error:', openaiError);
      
      // Save error message
      const errorMessage = new ChatMessage({
        user: userId,
        sessionId: chatSessionId,
        role: 'assistant',
        content: 'I apologize, but I\'m experiencing technical difficulties right now. Please try again in a moment.',
        context,
        metadata: {
          model,
          responseTime: Date.now() - startTime
        }
      });

      await errorMessage.save();

      res.status(500).json({
        error: 'AI service temporarily unavailable',
        message: 'I apologize, but I\'m experiencing technical difficulties right now. Please try again in a moment.',
        sessionId: chatSessionId,
        code: 'AI_SERVICE_ERROR'
      });
    }

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: 'Failed to process message',
      code: 'CHAT_ERROR'
    });
  }
};

// Get chat history for a session
const getChatHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.userId;

    const skip = (page - 1) * limit;

    const messages = await ChatMessage.find({
      user: userId,
      sessionId,
      isDeleted: { $ne: true }
    })
    .sort({ createdAt: 1 })
    .skip(skip)
    .limit(parseInt(limit))
    .select('role content context metadata createdAt reactions isEdited');

    const totalMessages = await ChatMessage.countDocuments({
      user: userId,
      sessionId,
      isDeleted: { $ne: true }
    });

    res.json({
      messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalMessages,
        pages: Math.ceil(totalMessages / limit)
      },
      sessionId
    });

  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({
      error: 'Failed to get chat history',
      code: 'HISTORY_ERROR'
    });
  }
};

// Get user's chat sessions
const getChatSessions = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const userId = req.userId;

    const sessions = await ChatMessage.getRecentSessions(userId, parseInt(limit));

    res.json({
      sessions: sessions.map(session => ({
        sessionId: session._id,
        lastMessage: {
          content: session.lastMessage.content,
          role: session.lastMessage.role,
          createdAt: session.lastMessage.createdAt
        },
        messageCount: session.messageCount,
        lastActivity: session.lastActivity
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get chat sessions error:', error);
    res.status(500).json({
      error: 'Failed to get chat sessions',
      code: 'SESSIONS_ERROR'
    });
  }
};

// Delete a chat session
const deleteChatSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.userId;

    // Soft delete all messages in the session
    await ChatMessage.updateMany(
      { user: userId, sessionId },
      { isDeleted: true, deletedAt: new Date() }
    );

    res.json({
      message: 'Chat session deleted successfully'
    });

  } catch (error) {
    console.error('Delete chat session error:', error);
    res.status(500).json({
      error: 'Failed to delete chat session',
      code: 'DELETE_ERROR'
    });
  }
};

// Add reaction to a message
const addReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { reaction } = req.body;
    const userId = req.userId;

    const message = await ChatMessage.findOne({
      _id: messageId,
      user: userId,
      isDeleted: { $ne: true }
    });

    if (!message) {
      return res.status(404).json({
        error: 'Message not found',
        code: 'MESSAGE_NOT_FOUND'
      });
    }

    await message.addReaction(reaction);

    res.json({
      message: 'Reaction added successfully',
      reactions: message.reactions
    });

  } catch (error) {
    console.error('Add reaction error:', error);
    res.status(500).json({
      error: 'Failed to add reaction',
      code: 'REACTION_ERROR'
    });
  }
};

// Search chat messages
const searchMessages = async (req, res) => {
  try {
    const { q: query, limit = 50 } = req.query;
    const userId = req.userId;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        error: 'Search query must be at least 2 characters long',
        code: 'INVALID_QUERY'
      });
    }

    const messages = await ChatMessage.searchMessages(userId, query.trim(), parseInt(limit));

    res.json({
      messages: messages.map(msg => ({
        id: msg._id,
        content: msg.content,
        role: msg.role,
        sessionId: msg.sessionId,
        context: msg.context,
        createdAt: msg.createdAt
      })),
      query: query.trim(),
      total: messages.length
    });

  } catch (error) {
    console.error('Search messages error:', error);
    res.status(500).json({
      error: 'Failed to search messages',
      code: 'SEARCH_ERROR'
    });
  }
};

// Get chat statistics
const getChatStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.userId;

    let start, end;
    if (startDate) start = new Date(startDate);
    if (endDate) end = new Date(endDate);

    const stats = await ChatMessage.getChatStats(userId, start, end);

    res.json({
      stats: stats[0] || {
        totalMessages: 0,
        totalTokens: 0,
        avgResponseTime: 0,
        sessionCount: 0
      },
      period: {
        startDate: start,
        endDate: end
      }
    });

  } catch (error) {
    console.error('Get chat stats error:', error);
    res.status(500).json({
      error: 'Failed to get chat statistics',
      code: 'STATS_ERROR'
    });
  }
};

module.exports = {
  sendMessage,
  getChatHistory,
  getChatSessions,
  deleteChatSession,
  addReaction,
  searchMessages,
  getChatStats
};