const express = require('express');
const { body, query, param } = require('express-validator');
const { authenticateToken } = require('../middlewares/auth');
const {
  sendMessage,
  getChatHistory,
  getChatSessions,
  deleteChatSession,
  addReaction,
  searchMessages,
  getChatStats
} = require('../controllers/chatController');

const router = express.Router();

// Validation middleware
const sendMessageValidation = [
  body('message')
    .trim()
    .isLength({ min: 1, max: 4000 })
    .withMessage('Message must be between 1 and 4000 characters'),
  
  body('sessionId')
    .optional()
    .isUUID()
    .withMessage('Session ID must be a valid UUID'),
  
  body('context')
    .optional()
    .isArray()
    .withMessage('Context must be an array'),
  
  body('model')
    .optional()
    .isIn(['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo-preview'])
    .withMessage('Invalid model specified'),
  
  body('temperature')
    .optional()
    .isFloat({ min: 0, max: 2 })
    .withMessage('Temperature must be between 0 and 2'),
  
  body('maxTokens')
    .optional()
    .isInt({ min: 1, max: 4000 })
    .withMessage('Max tokens must be between 1 and 4000')
];

const getChatHistoryValidation = [
  query('sessionId')
    .optional()
    .isUUID()
    .withMessage('Session ID must be a valid UUID'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

const getChatSessionsValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50')
];

const deleteSessionValidation = [
  param('sessionId')
    .isUUID()
    .withMessage('Session ID must be a valid UUID')
];

const addReactionValidation = [
  param('messageId')
    .isMongoId()
    .withMessage('Message ID must be a valid MongoDB ObjectId'),
  
  body('reaction')
    .isIn(['like', 'dislike', 'helpful', 'not_helpful'])
    .withMessage('Reaction must be one of: like, dislike, helpful, not_helpful')
];

const searchMessagesValidation = [
  query('q')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Search query must be between 1 and 200 characters'),
  
  query('sessionId')
    .optional()
    .isUUID()
    .withMessage('Session ID must be a valid UUID'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50')
];

// All routes require authentication
router.use(authenticateToken);

// Chat routes
router.post('/message', sendMessageValidation, sendMessage);
router.get('/history', getChatHistoryValidation, getChatHistory);
router.get('/sessions', getChatSessionsValidation, getChatSessions);
router.delete('/sessions/:sessionId', deleteSessionValidation, deleteChatSession);
router.post('/messages/:messageId/reaction', addReactionValidation, addReaction);
router.get('/search', searchMessagesValidation, searchMessages);
router.get('/stats', getChatStats);

// Health check for chat service
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'chat',
    timestamp: new Date().toISOString(),
    openai: process.env.OPENAI_API_KEY ? 'configured' : 'not_configured'
  });
});

module.exports = router;