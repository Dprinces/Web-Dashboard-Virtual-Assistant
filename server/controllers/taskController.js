const { validationResult } = require('express-validator');
const Task = require('../models/Task');

// Create a new task
const createTask = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const taskData = {
      ...req.body,
      user: req.userId
    };

    const task = new Task(taskData);
    await task.save();

    res.status(201).json({
      message: 'Task created successfully',
      task
    });

  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      error: 'Failed to create task',
      code: 'CREATE_ERROR'
    });
  }
};

// Get all tasks for the user
const getTasks = async (req, res) => {
  try {
    const { 
      status, 
      priority, 
      category, 
      page = 1, 
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search
    } = req.query;

    const userId = req.userId;
    const skip = (page - 1) * limit;

    // Build query
    const query = { user: userId };
    
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const tasks = await Task.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const totalTasks = await Task.countDocuments(query);

    res.json({
      tasks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalTasks,
        pages: Math.ceil(totalTasks / limit)
      }
    });

  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      error: 'Failed to get tasks',
      code: 'GET_ERROR'
    });
  }
};

// Get a single task by ID
const getTaskById = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.userId;

    const task = await Task.findOne({ _id: taskId, user: userId });

    if (!task) {
      return res.status(404).json({
        error: 'Task not found',
        code: 'TASK_NOT_FOUND'
      });
    }

    res.json({ task });

  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      error: 'Failed to get task',
      code: 'GET_ERROR'
    });
  }
};

// Update a task
const updateTask = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { taskId } = req.params;
    const userId = req.userId;
    const updateData = req.body;

    // Remove user field from update data to prevent modification
    delete updateData.user;

    const task = await Task.findOneAndUpdate(
      { _id: taskId, user: userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({
        error: 'Task not found',
        code: 'TASK_NOT_FOUND'
      });
    }

    res.json({
      message: 'Task updated successfully',
      task
    });

  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      error: 'Failed to update task',
      code: 'UPDATE_ERROR'
    });
  }
};

// Delete a task
const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.userId;

    const task = await Task.findOneAndDelete({ _id: taskId, user: userId });

    if (!task) {
      return res.status(404).json({
        error: 'Task not found',
        code: 'TASK_NOT_FOUND'
      });
    }

    res.json({
      message: 'Task deleted successfully'
    });

  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      error: 'Failed to delete task',
      code: 'DELETE_ERROR'
    });
  }
};

// Mark task as completed
const completeTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.userId;

    const task = await Task.findOne({ _id: taskId, user: userId });

    if (!task) {
      return res.status(404).json({
        error: 'Task not found',
        code: 'TASK_NOT_FOUND'
      });
    }

    await task.markCompleted();

    res.json({
      message: 'Task marked as completed',
      task
    });

  } catch (error) {
    console.error('Complete task error:', error);
    res.status(500).json({
      error: 'Failed to complete task',
      code: 'COMPLETE_ERROR'
    });
  }
};

// Add subtask
const addSubtask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title } = req.body;
    const userId = req.userId;

    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        error: 'Subtask title is required',
        code: 'VALIDATION_ERROR'
      });
    }

    const task = await Task.findOne({ _id: taskId, user: userId });

    if (!task) {
      return res.status(404).json({
        error: 'Task not found',
        code: 'TASK_NOT_FOUND'
      });
    }

    await task.addSubtask(title.trim());

    res.json({
      message: 'Subtask added successfully',
      task
    });

  } catch (error) {
    console.error('Add subtask error:', error);
    res.status(500).json({
      error: 'Failed to add subtask',
      code: 'SUBTASK_ERROR'
    });
  }
};

// Update subtask
const updateSubtask = async (req, res) => {
  try {
    const { taskId, subtaskId } = req.params;
    const { title, completed } = req.body;
    const userId = req.userId;

    const task = await Task.findOne({ _id: taskId, user: userId });

    if (!task) {
      return res.status(404).json({
        error: 'Task not found',
        code: 'TASK_NOT_FOUND'
      });
    }

    const subtask = task.subtasks.id(subtaskId);

    if (!subtask) {
      return res.status(404).json({
        error: 'Subtask not found',
        code: 'SUBTASK_NOT_FOUND'
      });
    }

    if (title !== undefined) subtask.title = title;
    if (completed !== undefined) {
      subtask.completed = completed;
      subtask.completedAt = completed ? new Date() : null;
    }

    await task.save();

    res.json({
      message: 'Subtask updated successfully',
      task
    });

  } catch (error) {
    console.error('Update subtask error:', error);
    res.status(500).json({
      error: 'Failed to update subtask',
      code: 'SUBTASK_ERROR'
    });
  }
};

// Delete subtask
const deleteSubtask = async (req, res) => {
  try {
    const { taskId, subtaskId } = req.params;
    const userId = req.userId;

    const task = await Task.findOne({ _id: taskId, user: userId });

    if (!task) {
      return res.status(404).json({
        error: 'Task not found',
        code: 'TASK_NOT_FOUND'
      });
    }

    task.subtasks.id(subtaskId).remove();
    await task.save();

    res.json({
      message: 'Subtask deleted successfully',
      task
    });

  } catch (error) {
    console.error('Delete subtask error:', error);
    res.status(500).json({
      error: 'Failed to delete subtask',
      code: 'SUBTASK_ERROR'
    });
  }
};

// Get task statistics
const getTaskStats = async (req, res) => {
  try {
    const userId = req.userId;

    const stats = await Task.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] }
          },
          overdue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ['$status', 'completed'] },
                    { $lt: ['$dueDate', new Date()] },
                    { $ne: ['$dueDate', null] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const categoryStats = await Task.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      }
    ]);

    const priorityStats = await Task.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      }
    ]);

    res.json({
      overview: stats[0] || {
        total: 0,
        completed: 0,
        pending: 0,
        inProgress: 0,
        overdue: 0
      },
      byCategory: categoryStats,
      byPriority: priorityStats
    });

  } catch (error) {
    console.error('Get task stats error:', error);
    res.status(500).json({
      error: 'Failed to get task statistics',
      code: 'STATS_ERROR'
    });
  }
};

// Get overdue tasks
const getOverdueTasks = async (req, res) => {
  try {
    const userId = req.userId;

    const overdueTasks = await Task.getOverdue(userId);

    res.json({
      tasks: overdueTasks,
      count: overdueTasks.length
    });

  } catch (error) {
    console.error('Get overdue tasks error:', error);
    res.status(500).json({
      error: 'Failed to get overdue tasks',
      code: 'OVERDUE_ERROR'
    });
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  completeTask,
  addSubtask,
  updateSubtask,
  deleteSubtask,
  getTaskStats,
  getOverdueTasks
};