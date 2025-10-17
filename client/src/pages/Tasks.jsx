import React, { useState } from 'react';
import { Plus, CheckSquare, Clock, Calendar } from 'lucide-react';

const Tasks = () => {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: 'Complete project proposal',
      description: 'Write and submit the Q1 project proposal',
      completed: false,
      priority: 'high',
      dueDate: '2024-01-15',
      createdAt: new Date('2024-01-10')
    },
    {
      id: 2,
      title: 'Review team feedback',
      description: 'Go through all team feedback from last sprint',
      completed: true,
      priority: 'medium',
      dueDate: '2024-01-12',
      createdAt: new Date('2024-01-08')
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: ''
  });

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    const task = {
      id: Date.now(),
      ...newTask,
      completed: false,
      createdAt: new Date()
    };

    setTasks(prev => [task, ...prev]);
    setNewTask({ title: '', description: '', priority: 'medium', dueDate: '' });
    setShowAddForm(false);
  };

  const toggleTask = (id) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30';
      case 'low': return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center animate-fade-in">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-medium">
            <CheckSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tasks</h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg">Manage your tasks and stay organized</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-primary animate-slide-in-right"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </button>
      </div>

      {/* Add Task Form */}
      {showAddForm && (
        <div className="card animate-slide-down">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-gradient-secondary rounded-xl flex items-center justify-center">
              <Plus className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add New Task</h2>
          </div>
          <form onSubmit={handleAddTask} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Title
              </label>
              <input
                type="text"
                value={newTask.title}
                onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                className="input-field"
                placeholder="Enter task title"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={newTask.description}
                onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                className="input-field h-24 resize-none"
                placeholder="Enter task description..."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Priority
                </label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value }))}
                  className="input-field"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="input-field"
                />
              </div>
            </div>
            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                className="btn-primary flex-1"
              >
                <CheckSquare className="w-4 h-4 mr-2" />
                Add Task
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="btn-outline flex-1"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tasks List */}
      <div className="space-y-4">
        {tasks.map((task, index) => (
          <div
            key={task.id}
            className={`card card-hover animate-slide-up ${task.completed ? 'opacity-75' : ''}`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-start space-x-4">
              <button
                onClick={() => toggleTask(task.id)}
                className={`mt-1 w-6 h-6 rounded-xl border-2 flex items-center justify-center transition-all ${
                  task.completed
                    ? 'bg-gradient-primary border-primary-600 text-white shadow-soft'
                    : 'border-gray-300 hover:border-primary-500 hover:bg-primary-50'
                }`}
              >
                {task.completed && <CheckSquare className="w-4 h-4" />}
              </button>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`text-lg font-bold ${task.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                    {task.title}
                  </h3>
                  <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wide ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
                
                {task.description && (
                  <p className={`text-sm mb-3 ${task.completed ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-300'}`}>
                    {task.description}
                  </p>
                )}
                
                <div className="flex items-center space-x-6 text-xs text-gray-500 dark:text-gray-400">
                  {task.dueDate && (
                    <div className="flex items-center bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-lg">
                      <Calendar className="w-3 h-3 mr-1" />
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                  )}
                  <div className="flex items-center bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-lg">
                    <Clock className="w-3 h-3 mr-1" />
                    Created: {task.createdAt.toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="card text-center py-16 animate-fade-in">
          <div className="w-20 h-20 bg-gradient-primary rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-large">
            <CheckSquare className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">No tasks yet</h3>
          <p className="text-gray-600 dark:text-gray-300 text-lg mb-6">Get started by creating your first task and stay organized.</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Task
          </button>
        </div>
      )}
    </div>
  );
};

export default Tasks;