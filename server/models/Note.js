const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Note title is required'],
    trim: true,
    maxlength: [200, 'Note title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Note content is required'],
    maxlength: [50000, 'Note content cannot exceed 50,000 characters']
  },
  category: {
    type: String,
    enum: ['personal', 'work', 'study', 'ideas', 'meeting', 'research', 'other'],
    default: 'personal'
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  isPinned: {
    type: Boolean,
    default: false
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  color: {
    type: String,
    enum: ['default', 'red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink'],
    default: 'default'
  },
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
  reminders: [{
    date: {
      type: Date,
      required: true
    },
    message: {
      type: String,
      maxlength: [200, 'Reminder message cannot exceed 200 characters']
    },
    isTriggered: {
      type: Boolean,
      default: false
    }
  }],
  collaborators: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    permission: {
      type: String,
      enum: ['read', 'write'],
      default: 'read'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  version: {
    type: Number,
    default: 1
  },
  lastEditedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
noteSchema.index({ user: 1, isArchived: 1 });
noteSchema.index({ user: 1, isPinned: 1 });
noteSchema.index({ user: 1, category: 1 });
noteSchema.index({ user: 1, tags: 1 });
noteSchema.index({ 'title': 'text', 'content': 'text' }); // Text search

// Virtual for word count
noteSchema.virtual('wordCount').get(function() {
  return this.content.split(/\s+/).filter(word => word.length > 0).length;
});

// Virtual for character count
noteSchema.virtual('characterCount').get(function() {
  return this.content.length;
});

// Virtual for reading time (assuming 200 words per minute)
noteSchema.virtual('readingTime').get(function() {
  const wordsPerMinute = 200;
  const words = this.wordCount;
  return Math.ceil(words / wordsPerMinute);
});

// Pre-save middleware to update version and lastEditedBy
noteSchema.pre('save', function(next) {
  if (this.isModified('content') || this.isModified('title')) {
    this.version += 1;
    // lastEditedBy should be set by the controller
  }
  next();
});

// Method to pin/unpin note
noteSchema.methods.togglePin = function() {
  this.isPinned = !this.isPinned;
  return this.save();
};

// Method to archive/unarchive note
noteSchema.methods.toggleArchive = function() {
  this.isArchived = !this.isArchived;
  return this.save();
};

// Method to add tag
noteSchema.methods.addTag = function(tag) {
  if (!this.tags.includes(tag)) {
    this.tags.push(tag);
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to remove tag
noteSchema.methods.removeTag = function(tag) {
  this.tags = this.tags.filter(t => t !== tag);
  return this.save();
};

// Method to add reminder
noteSchema.methods.addReminder = function(date, message = '') {
  this.reminders.push({ date, message });
  return this.save();
};

// Static method to search notes
noteSchema.statics.searchNotes = function(userId, query) {
  return this.find({
    user: userId,
    isArchived: false,
    $text: { $search: query }
  }).sort({ score: { $meta: 'textScore' } });
};

// Static method to get notes by category
noteSchema.statics.getByCategory = function(userId, category) {
  return this.find({ 
    user: userId, 
    category, 
    isArchived: false 
  }).sort({ isPinned: -1, updatedAt: -1 });
};

// Static method to get pinned notes
noteSchema.statics.getPinned = function(userId) {
  return this.find({ 
    user: userId, 
    isPinned: true, 
    isArchived: false 
  }).sort({ updatedAt: -1 });
};

// Static method to get archived notes
noteSchema.statics.getArchived = function(userId) {
  return this.find({ 
    user: userId, 
    isArchived: true 
  }).sort({ updatedAt: -1 });
};

module.exports = mongoose.model('Note', noteSchema);