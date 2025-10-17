const express = require('express');
const { body, query, param } = require('express-validator');
const { authenticateToken } = require('../middlewares/auth');
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  completeTask,
  addSubtask,
  updateSubtask,
  deleteSubtask,
  getOverdueTasks,
  getTaskStats
} = require('../controllers/taskController');

const router = express.Router();

// Validation middleware
const createTaskValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title is required and must be less than 200 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must be less than 2000 characters'),
  
  body('status')
    .optional()
    .isIn(['pending', 'in_progress', 'completed', 'cancelled'])
    .withMessage('Status must be one of: pending, in_progress, completed, cancelled'),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be one of: low, medium, high, urgent'),
  
  body('category')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Category must be less than 50 characters'),
  
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid ISO 8601 date'),
  
  body('reminderDate')
    .optional()
    .isISO8601()
    .withMessage('Reminder date must be a valid ISO 8601 date'),
  
  body('estimatedDuration')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Estimated duration must be a positive integer (minutes)'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Each tag must be between 1 and 30 characters')
];

const updateTaskValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be less than 200 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must be less than 2000 characters'),
  
  body('status')
    .optional()
    .isIn(['pending', 'in_progress', 'completed', 'cancelled'])
    .withMessage('Status must be one of: pending, in_progress, completed, cancelled'),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be one of: low, medium, high, urgent'),
  
  body('category')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Category must be less than 50 characters'),
  
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid ISO 8601 date'),
  
  body('reminderDate')
    .optional()
    .isISO8601()
    .withMessage('Reminder date must be a valid ISO 8601 date'),
  
  body('estimatedDuration')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Estimated duration must be a positive integer (minutes)'),
  
  body('actualDuration')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Actual duration must be a positive integer (minutes)'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Each tag must be between 1 and 30 characters')
];

const getTasksValidation = [
  query('status')
    .optional()
    .isIn(['pending', 'in_progress', 'completed', 'cancelled'])
    .withMessage('Status must be one of: pending, in_progress, completed, cancelled'),
  
  query('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be one of: low, medium, high, urgent'),
  
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
    .isIn(['createdAt', 'updatedAt', 'dueDate', 'priority', 'title'])
    .withMessage('Sort by must be one of: createdAt, updatedAt, dueDate, priority, title'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters')
];

const taskIdValidation = [
  param('taskId')
    .isMongoId()
    .withMessage('Task ID must be a valid MongoDB ObjectId')
];

const subtaskValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Subtask title is required and must be less than 200 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Subtask description must be less than 500 characters'),
  
  body('completed')
    .optional()
    .isBoolean()
    .withMessage('Completed must be a boolean')
];

const subtaskIdValidation = [
  param('taskId')
    .isMongoId()
    .withMessage('Task ID must be a valid MongoDB ObjectId'),
  
  param('subtaskId')
    .isMongoId()
    .withMessage('Subtask ID must be a valid MongoDB ObjectId')
];

const completeTaskValidation = [
  body('actualDuration')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Actual duration must be a positive integer (minutes)')
];

// All routes require authentication
router.use(authenticateToken);

// Task CRUD routes
router.post('/', createTaskValidation, createTask);
router.get('/', getTasksValidation, getTasks);
router.get('/overdue', getOverdueTasks);
router.get('/stats', getTaskStats);
router.get('/:taskId', taskIdValidation, getTaskById);
router.put('/:taskId', taskIdValidation, updateTaskValidation, updateTask);
router.delete('/:taskId', taskIdValidation, deleteTask);
router.patch('/:taskId/complete', taskIdValidation, completeTaskValidation, completeTask);

// Subtask routes
router.post('/:taskId/subtasks', taskIdValidation, subtaskValidation, addSubtask);
router.put('/:taskId/subtasks/:subtaskId', subtaskIdValidation, subtaskValidation, updateSubtask);
router.delete('/:taskId/subtasks/:subtaskId', subtaskIdValidation, deleteSubtask);

// Health check for tasks service
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'tasks',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;