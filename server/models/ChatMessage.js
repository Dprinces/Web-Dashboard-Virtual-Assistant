const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    maxlength: [10000, 'Message content cannot exceed 10,000 characters']
  },
  metadata: {
    model: {
      type: String,
      default: 'gpt-3.5-turbo'
    },
    tokens: {
      prompt: { type: Number, default: 0 },
      completion: { type: Number, default: 0 },
      total: { type: Number, default: 0 }
    },
    responseTime: {
      type: Number, // in milliseconds
      default: null
    },
    temperature: {
      type: Number,
      default: 0.7
    },
    maxTokens: {
      type: Number,
      default: null
    }
  },
  context: {
    type: String,
    enum: ['general', 'task_help', 'note_help', 'study_help', 'planning', 'other'],
    default: 'general'
  },
  attachments: [{
    type: {
      type: String,
      enum: ['image', 'file', 'link'],
      required: true
    },
    url: String,
    filename: String,
    size: Number,
    mimeType: String
  }],
  reactions: [{
    type: {
      type: String,
      enum: ['like', 'dislike', 'helpful', 'not_helpful'],
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  editHistory: [{
    content: String,
    editedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for better query performance
chatMessageSchema.index({ user: 1, sessionId: 1, createdAt: 1 });
chatMessageSchema.index({ user: 1, createdAt: -1 });
chatMessageSchema.index({ sessionId: 1, createdAt: 1 });
chatMessageSchema.index({ user: 1, context: 1 });

// Virtual for message length
chatMessageSchema.virtual('messageLength').get(function() {
  return this.content.length;
});

// Virtual for total tokens used
chatMessageSchema.virtual('totalTokens').get(function() {
  return this.metadata.tokens.total;
});

// Pre-save middleware to handle soft delete
chatMessageSchema.pre('save', function(next) {
  if (this.isModified('isDeleted') && this.isDeleted) {
    this.deletedAt = new Date();
  } else if (this.isModified('isDeleted') && !this.isDeleted) {
    this.deletedAt = null;
  }
  next();
});

// Method to add reaction
chatMessageSchema.methods.addReaction = function(reactionType) {
  // Remove existing reaction of the same type
  this.reactions = this.reactions.filter(r => r.type !== reactionType);
  // Add new reaction
  this.reactions.push({ type: reactionType });
  return this.save();
};

// Method to remove reaction
chatMessageSchema.methods.removeReaction = function(reactionType) {
  this.reactions = this.reactions.filter(r => r.type !== reactionType);
  return this.save();
};

// Method to edit message
chatMessageSchema.methods.editContent = function(newContent) {
  // Save current content to edit history
  this.editHistory.push({ content: this.content });
  this.content = newContent;
  this.isEdited = true;
  return this.save();
};

// Method to soft delete message
chatMessageSchema.methods.softDelete = function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

// Static method to get chat session
chatMessageSchema.statics.getChatSession = function(userId, sessionId, includeDeleted = false) {
  const query = { user: userId, sessionId };
  if (!includeDeleted) {
    query.isDeleted = { $ne: true };
  }
  return this.find(query).sort({ createdAt: 1 });
};

// Static method to get user's recent sessions
chatMessageSchema.statics.getRecentSessions = function(userId, limit = 10) {
  return this.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId), isDeleted: { $ne: true } } },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: '$sessionId',
        lastMessage: { $first: '$$ROOT' },
        messageCount: { $sum: 1 },
        lastActivity: { $first: '$createdAt' }
      }
    },
    { $sort: { lastActivity: -1 } },
    { $limit: limit }
  ]);
};

// Static method to get chat statistics
chatMessageSchema.statics.getChatStats = function(userId, startDate, endDate) {
  const matchStage = {
    user: mongoose.Types.ObjectId(userId),
    isDeleted: { $ne: true }
  };
  
  if (startDate && endDate) {
    matchStage.createdAt = { $gte: startDate, $lte: endDate };
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalMessages: { $sum: 1 },
        totalTokens: { $sum: '$metadata.tokens.total' },
        avgResponseTime: { $avg: '$metadata.responseTime' },
        sessionCount: { $addToSet: '$sessionId' }
      }
    },
    {
      $project: {
        _id: 0,
        totalMessages: 1,
        totalTokens: 1,
        avgResponseTime: 1,
        sessionCount: { $size: '$sessionCount' }
      }
    }
  ]);
};

// Static method to search messages
chatMessageSchema.statics.searchMessages = function(userId, query, limit = 50) {
  return this.find({
    user: userId,
    isDeleted: { $ne: true },
    content: { $regex: query, $options: 'i' }
  })
  .sort({ createdAt: -1 })
  .limit(limit);
};

module.exports = mongoose.model('ChatMessage', chatMessageSchema);