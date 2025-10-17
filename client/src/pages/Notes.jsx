import React, { useState, useMemo } from 'react';
import { Plus, FileText, Search, Tag, X, Filter, SortAsc, SortDesc, Calendar, Pin } from 'lucide-react';

const Notes = () => {
  const [notes, setNotes] = useState([
    {
      id: 1,
      title: 'Meeting Notes',
      content: 'Discussed project timeline and deliverables for Q1.',
      tags: ['work', 'meeting'],
      pinned: true,
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-10')
    },
    {
      id: 2,
      title: 'Ideas for App',
      content: 'Consider adding dark mode, better search functionality, and mobile responsiveness.',
      tags: ['ideas', 'development'],
      pinned: false,
      createdAt: new Date('2024-01-08'),
      updatedAt: new Date('2024-01-09')
    },
    {
      id: 3,
      title: 'Shopping List',
      content: 'Groceries: milk, bread, eggs, fruits, vegetables.',
      tags: ['personal', 'shopping'],
      pinned: false,
      createdAt: new Date('2024-01-12'),
      updatedAt: new Date('2024-01-12')
    },
    {
      id: 4,
      title: 'Book Recommendations',
      content: 'Clean Code by Robert Martin, The Pragmatic Programmer, Design Patterns.',
      tags: ['books', 'development', 'learning'],
      pinned: true,
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-01-11')
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    tags: [],
    pinned: 'all', // 'all', 'pinned', 'unpinned'
    sortBy: 'updatedAt', // 'updatedAt', 'createdAt', 'title'
    sortOrder: 'desc' // 'asc', 'desc'
  });
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    tags: ''
  });

  // Get all unique tags from notes
  const allTags = useMemo(() => {
    const tagSet = new Set();
    notes.forEach(note => {
      note.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [notes]);

  // Enhanced filtering and sorting
  const filteredAndSortedNotes = useMemo(() => {
    let filtered = notes.filter(note => {
      // Text search
      const matchesSearch = searchTerm === '' || 
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      // Tag filter
      const matchesTags = filters.tags.length === 0 || 
        filters.tags.some(filterTag => note.tags.includes(filterTag));

      // Pinned filter
      const matchesPinned = filters.pinned === 'all' ||
        (filters.pinned === 'pinned' && note.pinned) ||
        (filters.pinned === 'unpinned' && !note.pinned);

      return matchesSearch && matchesTags && matchesPinned;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (filters.sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'createdAt':
          aValue = a.createdAt;
          bValue = b.createdAt;
          break;
        case 'updatedAt':
        default:
          aValue = a.updatedAt;
          bValue = b.updatedAt;
          break;
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [notes, searchTerm, filters]);

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!newNote.title.trim()) return;

    const note = {
      id: Date.now(),
      title: newNote.title,
      content: newNote.content,
      tags: newNote.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      pinned: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setNotes(prev => [note, ...prev]);
    setNewNote({ title: '', content: '', tags: '' });
    setShowAddForm(false);
  };

  const togglePin = (id) => {
    setNotes(prev => prev.map(note => 
      note.id === id ? { ...note, pinned: !note.pinned, updatedAt: new Date() } : note
    ));
  };

  const toggleTagFilter = (tag) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) 
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const clearFilters = () => {
    setFilters({
      tags: [],
      pinned: 'all',
      sortBy: 'updatedAt',
      sortOrder: 'desc'
    });
    setSearchTerm('');
  };

  const pinnedNotes = filteredAndSortedNotes.filter(note => note.pinned);
  const regularNotes = filteredAndSortedNotes.filter(note => !note.pinned);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-soft">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white animate-fade-in">Notes</h1>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className={`btn-primary animate-slide-in-right w-full sm:w-auto ${showAddForm ? 'btn-outline' : ''}`}
        >
          {showAddForm ? (
            <>
              Cancel
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Add Note
            </>
          )}
        </button>
      </div>

      {/* Enhanced Search and Filters */}
      <div className="space-y-4 animate-slide-down">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search notes by title, content, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-12 pr-12"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg border transition-all text-sm ${
                showFilters || filters.tags.length > 0 || filters.pinned !== 'all'
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
              {(filters.tags.length > 0 || filters.pinned !== 'all') && (
                <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {filters.tags.length + (filters.pinned !== 'all' ? 1 : 0)}
                </span>
              )}
            </button>

            {/* Sort Controls */}
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
              className="px-2 sm:px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs sm:text-sm"
            >
              <option value="updatedAt">Updated</option>
              <option value="createdAt">Created</option>
              <option value="title">Title</option>
            </select>

            <button
              onClick={() => setFilters(prev => ({ 
                ...prev, 
                sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' 
              }))}
              className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {filters.sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
            </button>

            {/* Clear Filters */}
            {(searchTerm || filters.tags.length > 0 || filters.pinned !== 'all') && (
              <button
                onClick={clearFilters}
                className="px-2 sm:px-3 py-2 text-xs sm:text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          {/* Results Count */}
          <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 sm:ml-auto">
            {filteredAndSortedNotes.length} of {notes.length} notes
          </span>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="card animate-slide-down">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Advanced Filters</h3>
            
            {/* Tag Filters */}
            <div className="space-y-3">
              <label className="label">Filter by Tags</label>
              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTagFilter(tag)}
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm transition-all ${
                      filters.tags.includes(tag)
                        ? 'bg-blue-500 text-white shadow-sm'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Pinned Filter */}
            <div className="space-y-3">
              <label className="label">Filter by Status</label>
              <div className="flex space-x-2">
                {[
                  { value: 'all', label: 'All Notes', icon: FileText },
                  { value: 'pinned', label: 'Pinned Only', icon: Pin },
                  { value: 'unpinned', label: 'Unpinned Only', icon: FileText }
                ].map(({ value, label, icon: Icon }) => ( // eslint-disable-line no-unused-vars
                  <button
                    key={value}
                    onClick={() => setFilters(prev => ({ ...prev, pinned: value }))}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm transition-all ${
                      filters.pinned === value
                        ? 'bg-blue-500 text-white shadow-sm'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Note Form */}
      {showAddForm && (
        <div className="card animate-slide-down">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-soft">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add New Note</h2>
          </div>
          <form onSubmit={handleAddNote} className="space-y-6">
            <div>
              <label className="label">
                Title
              </label>
              <input
                type="text"
                value={newNote.title}
                onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                className="input-field"
                placeholder="Enter note title"
                required
              />
            </div>
            <div>
              <label className="label">
                Content
              </label>
              <textarea
                value={newNote.content}
                onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                className="input-field resize-none"
                rows="6"
                placeholder="Write your note here..."
              />
            </div>
            <div>
              <label className="label">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={newNote.tags}
                onChange={(e) => setNewNote(prev => ({ ...prev, tags: e.target.value }))}
                className="input-field"
                placeholder="work, ideas, personal"
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="btn-primary"
              >
                <FileText className="w-4 h-4 mr-2" />
                Add Note
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="btn-outline"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Pinned Notes */}
      {pinnedNotes.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Pinned Notes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pinnedNotes.map((note) => (
              <NoteCard key={note.id} note={note} onTogglePin={togglePin} />
            ))}
          </div>
        </div>
      )}

      {/* Regular Notes */}
      <div>
        {pinnedNotes.length > 0 && (
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">All Notes</h2>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {regularNotes.map((note) => (
            <NoteCard key={note.id} note={note} onTogglePin={togglePin} />
          ))}
        </div>
      </div>

      {filteredAndSortedNotes.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {searchTerm || filters.tags.length > 0 || filters.pinned !== 'all' ? 'No notes found' : 'No notes yet'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchTerm || filters.tags.length > 0 || filters.pinned !== 'all' ? 'Try adjusting your search terms or filters.' : 'Get started by creating your first note.'}
          </p>
        </div>
      )}
    </div>
  );
};

const NoteCard = ({ note, onTogglePin }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/20 p-4 hover:shadow-md dark:hover:shadow-gray-900/30 transition-all border border-gray-100 dark:border-gray-700 animate-fade-in">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-gray-900 dark:text-white truncate">{note.title}</h3>
        <button
          onClick={() => onTogglePin(note.id)}
          className={`text-xs px-2 py-1 rounded transition-colors ${
            note.pinned 
              ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' 
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          {note.pinned ? 'Pinned' : 'Pin'}
        </button>
      </div>
      
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-3">
        {note.content}
      </p>
      
      {note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {note.tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded transition-colors"
            >
              <Tag className="w-3 h-3 mr-1" />
              {tag}
            </span>
          ))}
        </div>
      )}
      
      <div className="text-xs text-gray-500 dark:text-gray-400">
        Updated: {note.updatedAt.toLocaleDateString()}
      </div>
    </div>
  );
};

export default Notes;