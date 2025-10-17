const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [200, 'Task title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Task description cannot exceed 1000 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['personal', 'work', 'study', 'health', 'finance', 'other'],
    default: 'personal'
  },
  dueDate: {
    type: Date,
    default: null
  },
  reminderDate: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  estimatedDuration: {
    type: Number, // in minutes
    min: [1, 'Estimated duration must be at least 1 minute'],
    max: [10080, 'Estimated duration cannot exceed 1 week (10080 minutes)']
  },
  actualDuration: {
    type: Number, // in minutes
    default: null
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  subtasks: [{
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Subtask title cannot exceed 100 characters']
    },
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: {
      type: Date,
      default: null
    }
  }],
  attachments: [{
    filename: String,
    url: String,
    size: Number,
    mimeType: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
taskSchema.index({ user: 1, status: 1 });
taskSchema.index({ user: 1, dueDate: 1 });
taskSchema.index({ user: 1, priority: 1 });
taskSchema.index({ user: 1, category: 1 });

// Virtual for checking if task is overdue
taskSchema.virtual('isOverdue').get(function() {
  if (!this.dueDate || this.status === 'completed') return false;
  return new Date() > this.dueDate;
});

// Virtual for completion percentage
taskSchema.virtual('completionPercentage').get(function() {
  if (this.subtasks.length === 0) {
    return this.status === 'completed' ? 100 : 0;
  }
  
  const completedSubtasks = this.subtasks.filter(subtask => subtask.completed).length;
  return Math.round((completedSubtasks / this.subtasks.length) * 100);
});

// Pre-save middleware to update completedAt
taskSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === 'completed' && !this.completedAt) {
      this.completedAt = new Date();
    } else if (this.status !== 'completed') {
      this.completedAt = null;
    }
  }
  next();
});

// Method to mark task as completed
taskSchema.methods.markCompleted = function() {
  this.status = 'completed';
  this.completedAt = new Date();
  return this.save();
};

// Method to add subtask
taskSchema.methods.addSubtask = function(title) {
  this.subtasks.push({ title });
  return this.save();
};

// Static method to get user's tasks by status
taskSchema.statics.getByStatus = function(userId, status) {
  return this.find({ user: userId, status }).sort({ createdAt: -1 });
};

// Static method to get overdue tasks
taskSchema.statics.getOverdue = function(userId) {
  return this.find({
    user: userId,
    status: { $ne: 'completed' },
    dueDate: { $lt: new Date() }
  }).sort({ dueDate: 1 });
};

module.exports = mongoose.model('Task', taskSchema);