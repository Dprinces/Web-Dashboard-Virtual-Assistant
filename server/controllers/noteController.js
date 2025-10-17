const { validationResult } = require('express-validator');
const Note = require('../models/Note');

// Create a new note
const createNote = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const noteData = {
      ...req.body,
      user: req.userId,
      lastEditedBy: req.userId
    };

    const note = new Note(noteData);
    await note.save();

    res.status(201).json({
      message: 'Note created successfully',
      note
    });

  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({
      error: 'Failed to create note',
      code: 'CREATE_ERROR'
    });
  }
};

// Get all notes for the user
const getNotes = async (req, res) => {
  try {
    const { 
      category, 
      page = 1, 
      limit = 20,
      sortBy = 'updatedAt',
      sortOrder = 'desc',
      search,
      archived = 'false',
      pinned
    } = req.query;

    const userId = req.userId;
    const skip = (page - 1) * limit;

    // Build query
    const query = { user: userId };
    
    if (category) query.category = category;
    query.isArchived = archived === 'true';
    if (pinned !== undefined) query.isPinned = pinned === 'true';

    if (search) {
      // Use text search if available, otherwise regex search
      try {
        const searchResults = await Note.searchNotes(userId, search);
        return res.json({
          notes: searchResults.slice(skip, skip + parseInt(limit)),
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: searchResults.length,
            pages: Math.ceil(searchResults.length / limit)
          },
          searchQuery: search
        });
      } catch (searchError) {
        // Fallback to regex search
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ];
      }
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    // Always prioritize pinned notes if not archived
    if (!query.isArchived) {
      sort.isPinned = -1;
    }

    const notes = await Note.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('lastEditedBy', 'firstName lastName username');

    const totalNotes = await Note.countDocuments(query);

    res.json({
      notes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalNotes,
        pages: Math.ceil(totalNotes / limit)
      }
    });

  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({
      error: 'Failed to get notes',
      code: 'GET_ERROR'
    });
  }
};

// Get a single note by ID
const getNoteById = async (req, res) => {
  try {
    const { noteId } = req.params;
    const userId = req.userId;

    const note = await Note.findOne({ _id: noteId, user: userId })
      .populate('lastEditedBy', 'firstName lastName username')
      .populate('collaborators.user', 'firstName lastName username email');

    if (!note) {
      return res.status(404).json({
        error: 'Note not found',
        code: 'NOTE_NOT_FOUND'
      });
    }

    res.json({ note });

  } catch (error) {
    console.error('Get note error:', error);
    res.status(500).json({
      error: 'Failed to get note',
      code: 'GET_ERROR'
    });
  }
};

// Update a note
const updateNote = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { noteId } = req.params;
    const userId = req.userId;
    const updateData = { ...req.body };

    // Remove user field from update data to prevent modification
    delete updateData.user;
    
    // Set lastEditedBy
    updateData.lastEditedBy = userId;

    const note = await Note.findOneAndUpdate(
      { _id: noteId, user: userId },
      updateData,
      { new: true, runValidators: true }
    ).populate('lastEditedBy', 'firstName lastName username');

    if (!note) {
      return res.status(404).json({
        error: 'Note not found',
        code: 'NOTE_NOT_FOUND'
      });
    }

    res.json({
      message: 'Note updated successfully',
      note
    });

  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({
      error: 'Failed to update note',
      code: 'UPDATE_ERROR'
    });
  }
};

// Delete a note
const deleteNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const userId = req.userId;

    const note = await Note.findOneAndDelete({ _id: noteId, user: userId });

    if (!note) {
      return res.status(404).json({
        error: 'Note not found',
        code: 'NOTE_NOT_FOUND'
      });
    }

    res.json({
      message: 'Note deleted successfully'
    });

  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({
      error: 'Failed to delete note',
      code: 'DELETE_ERROR'
    });
  }
};

// Toggle pin status
const togglePin = async (req, res) => {
  try {
    const { noteId } = req.params;
    const userId = req.userId;

    const note = await Note.findOne({ _id: noteId, user: userId });

    if (!note) {
      return res.status(404).json({
        error: 'Note not found',
        code: 'NOTE_NOT_FOUND'
      });
    }

    await note.togglePin();

    res.json({
      message: `Note ${note.isPinned ? 'pinned' : 'unpinned'} successfully`,
      note
    });

  } catch (error) {
    console.error('Toggle pin error:', error);
    res.status(500).json({
      error: 'Failed to toggle pin',
      code: 'PIN_ERROR'
    });
  }
};

// Toggle archive status
const toggleArchive = async (req, res) => {
  try {
    const { noteId } = req.params;
    const userId = req.userId;

    const note = await Note.findOne({ _id: noteId, user: userId });

    if (!note) {
      return res.status(404).json({
        error: 'Note not found',
        code: 'NOTE_NOT_FOUND'
      });
    }

    await note.toggleArchive();

    res.json({
      message: `Note ${note.isArchived ? 'archived' : 'unarchived'} successfully`,
      note
    });

  } catch (error) {
    console.error('Toggle archive error:', error);
    res.status(500).json({
      error: 'Failed to toggle archive',
      code: 'ARCHIVE_ERROR'
    });
  }
};

// Add tag to note
const addTag = async (req, res) => {
  try {
    const { noteId } = req.params;
    const { tag } = req.body;
    const userId = req.userId;

    if (!tag || tag.trim().length === 0) {
      return res.status(400).json({
        error: 'Tag is required',
        code: 'VALIDATION_ERROR'
      });
    }

    const note = await Note.findOne({ _id: noteId, user: userId });

    if (!note) {
      return res.status(404).json({
        error: 'Note not found',
        code: 'NOTE_NOT_FOUND'
      });
    }

    await note.addTag(tag.trim().toLowerCase());

    res.json({
      message: 'Tag added successfully',
      note
    });

  } catch (error) {
    console.error('Add tag error:', error);
    res.status(500).json({
      error: 'Failed to add tag',
      code: 'TAG_ERROR'
    });
  }
};

// Remove tag from note
const removeTag = async (req, res) => {
  try {
    const { noteId, tag } = req.params;
    const userId = req.userId;

    const note = await Note.findOne({ _id: noteId, user: userId });

    if (!note) {
      return res.status(404).json({
        error: 'Note not found',
        code: 'NOTE_NOT_FOUND'
      });
    }

    await note.removeTag(tag);

    res.json({
      message: 'Tag removed successfully',
      note
    });

  } catch (error) {
    console.error('Remove tag error:', error);
    res.status(500).json({
      error: 'Failed to remove tag',
      code: 'TAG_ERROR'
    });
  }
};

// Add reminder to note
const addReminder = async (req, res) => {
  try {
    const { noteId } = req.params;
    const { date, message } = req.body;
    const userId = req.userId;

    if (!date) {
      return res.status(400).json({
        error: 'Reminder date is required',
        code: 'VALIDATION_ERROR'
      });
    }

    const reminderDate = new Date(date);
    if (reminderDate <= new Date()) {
      return res.status(400).json({
        error: 'Reminder date must be in the future',
        code: 'INVALID_DATE'
      });
    }

    const note = await Note.findOne({ _id: noteId, user: userId });

    if (!note) {
      return res.status(404).json({
        error: 'Note not found',
        code: 'NOTE_NOT_FOUND'
      });
    }

    await note.addReminder(reminderDate, message || '');

    res.json({
      message: 'Reminder added successfully',
      note
    });

  } catch (error) {
    console.error('Add reminder error:', error);
    res.status(500).json({
      error: 'Failed to add reminder',
      code: 'REMINDER_ERROR'
    });
  }
};

// Get notes by category
const getNotesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const userId = req.userId;

    const notes = await Note.getByCategory(userId, category);

    res.json({
      notes,
      category,
      count: notes.length
    });

  } catch (error) {
    console.error('Get notes by category error:', error);
    res.status(500).json({
      error: 'Failed to get notes by category',
      code: 'CATEGORY_ERROR'
    });
  }
};

// Get pinned notes
const getPinnedNotes = async (req, res) => {
  try {
    const userId = req.userId;

    const notes = await Note.getPinned(userId);

    res.json({
      notes,
      count: notes.length
    });

  } catch (error) {
    console.error('Get pinned notes error:', error);
    res.status(500).json({
      error: 'Failed to get pinned notes',
      code: 'PINNED_ERROR'
    });
  }
};

// Get archived notes
const getArchivedNotes = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const userId = req.userId;
    const skip = (page - 1) * limit;

    const notes = await Note.getArchived(userId)
      .skip(skip)
      .limit(parseInt(limit));

    const totalArchived = await Note.countDocuments({
      user: userId,
      isArchived: true
    });

    res.json({
      notes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalArchived,
        pages: Math.ceil(totalArchived / limit)
      }
    });

  } catch (error) {
    console.error('Get archived notes error:', error);
    res.status(500).json({
      error: 'Failed to get archived notes',
      code: 'ARCHIVED_ERROR'
    });
  }
};

// Get all unique tags for user
const getUserTags = async (req, res) => {
  try {
    const userId = req.userId;

    const tags = await Note.aggregate([
      { $match: { user: userId, isArchived: false } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      tags: tags.map(tag => ({
        name: tag._id,
        count: tag.count
      }))
    });

  } catch (error) {
    console.error('Get user tags error:', error);
    res.status(500).json({
      error: 'Failed to get tags',
      code: 'TAGS_ERROR'
    });
  }
};

// Get note statistics
const getNoteStats = async (req, res) => {
  try {
    const userId = req.userId;

    const stats = await Note.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          archived: {
            $sum: { $cond: ['$isArchived', 1, 0] }
          },
          pinned: {
            $sum: { $cond: ['$isPinned', 1, 0] }
          },
          totalWords: { $sum: '$wordCount' },
          totalCharacters: { $sum: '$characterCount' }
        }
      }
    ]);

    const categoryStats = await Note.aggregate([
      { $match: { user: userId, isArchived: false } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      overview: stats[0] || {
        total: 0,
        archived: 0,
        pinned: 0,
        totalWords: 0,
        totalCharacters: 0
      },
      byCategory: categoryStats
    });

  } catch (error) {
    console.error('Get note stats error:', error);
    res.status(500).json({
      error: 'Failed to get note statistics',
      code: 'STATS_ERROR'
    });
  }
};

module.exports = {
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
};