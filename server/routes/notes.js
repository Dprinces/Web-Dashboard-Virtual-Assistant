const express = require('express');
const { body, query, param } = require('express-validator');
const { authenticateToken } = require('../middlewares/auth');
const {
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
  togglePin,
  toggleArchive,
  addTag,
  removeTag,
  addReminder,
  getNotesByCategory,
  getPinnedNotes,
  getArchivedNotes,
  getUserTags,
  getNoteStats
} = require('../controllers/noteController');

const router = express.Router();

// Validation middleware
const createNoteValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title is required and must be less than 200 characters'),
  
  body('content')
    .optional()
    .trim()
    .isLength({ max: 50000 })
    .withMessage('Content must be less than 50,000 characters'),
  
  body('category')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Category must be less than 50 characters'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Each tag must be between 1 and 30 characters'),
  
  body('color')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Color must be a valid hex color code'),
  
  body('isPinned')
    .optional()
    .isBoolean()
    .withMessage('isPinned must be a boolean'),
  
  body('isArchived')
    .optional()
    .isBoolean()
    .withMessage('isArchived must be a boolean')
];

const updateNoteValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be less than 200 characters'),
  
  body('content')
    .optional()
    .trim()
    .isLength({ max: 50000 })
    .withMessage('Content must be less than 50,000 characters'),
  
  body('category')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Category must be less than 50 characters'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Each tag must be between 1 and 30 characters'),
  
  body('color')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Color must be a valid hex color code'),
  
  body('isPinned')
    .optional()
    .isBoolean()
    .withMessage('isPinned must be a boolean'),
  
  body('isArchived')
    .optional()
    .isBoolean()
    .withMessage('isArchived must be a boolean')
];

const getNotesValidation = [
  query('category')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Category must be less than 50 characters'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'updatedAt', 'title', 'category'])
    .withMessage('Sort by must be one of: createdAt, updatedAt, title, category'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Search query must be between 1 and 200 characters'),
  
  query('archived')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('Archived must be true or false'),
  
  query('pinned')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('Pinned must be true or false')
];

const noteIdValidation = [
  param('noteId')
    .isMongoId()
    .withMessage('Note ID must be a valid MongoDB ObjectId')
];

const categoryValidation = [
  param('category')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Category must be between 1 and 50 characters')
];

const addTagValidation = [
  body('tag')
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Tag must be between 1 and 30 characters')
];

const tagValidation = [
  param('tag')
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Tag must be between 1 and 30 characters')
];

const addReminderValidation = [
  body('date')
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date'),
  
  body('message')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Reminder message must be less than 200 characters')
];

// All routes require authentication
router.use(authenticateToken);

// Note CRUD routes
router.post('/', createNoteValidation, createNote);
router.get('/', getNotesValidation, getNotes);
router.get('/pinned', getPinnedNotes);
router.get('/archived', getArchivedNotes);
router.get('/tags', getUserTags);
router.get('/stats', getNoteStats);
router.get('/category/:category', categoryValidation, getNotesByCategory);
router.get('/:noteId', noteIdValidation, getNoteById);
router.put('/:noteId', noteIdValidation, updateNoteValidation, updateNote);
router.delete('/:noteId', noteIdValidation, deleteNote);

// Note action routes
router.patch('/:noteId/pin', noteIdValidation, togglePin);
router.patch('/:noteId/archive', noteIdValidation, toggleArchive);

// Tag management routes
router.post('/:noteId/tags', noteIdValidation, addTagValidation, addTag);
router.delete('/:noteId/tags/:tag', noteIdValidation, tagValidation, removeTag);

// Reminder routes
router.post('/:noteId/reminders', noteIdValidation, addReminderValidation, addReminder);

// Health check for notes service
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'notes',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;