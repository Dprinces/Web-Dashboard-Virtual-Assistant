import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, CheckSquare, FileText, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const stats = [
    {
      name: 'Total Tasks',
      value: '12',
      icon: CheckSquare,
      color: 'bg-blue-500',
      href: '/tasks'
    },
    {
      name: 'Notes',
      value: '8',
      icon: FileText,
      color: 'bg-green-500',
      href: '/notes'
    },
    {
      name: 'Chat Sessions',
      value: '5',
      icon: MessageSquare,
      color: 'bg-purple-500',
      href: '/chat'
    },
    {
      name: 'Productivity',
      value: '85%',
      icon: TrendingUp,
      color: 'bg-orange-500',
      href: '#'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 mb-2">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-medium">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300">Welcome back! Here's what's happening.</p>
          </div>
        </div>
        <div className="w-16 sm:w-24 h-1 bg-gradient-primary rounded-full"></div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 animate-slide-up">
        {stats.map((stat, index) => (
          <div
            key={stat.name}
            className="card hover:shadow-large transition-all duration-300 hover:-translate-y-1 group"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors truncate">
                  {stat.name}
                </p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white group-hover:scale-105 transition-transform">
                  {stat.value}
                </p>
              </div>
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shadow-soft group-hover:shadow-medium transition-all flex-shrink-0 ${stat.color}`}>
                <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="card animate-slide-up" style={{ animationDelay: '0.4s' }}>
        <div className="flex items-center space-x-3 mb-4 sm:mb-6">
          <div className="w-8 h-8 bg-gradient-secondary rounded-xl flex items-center justify-center">
            <CheckSquare className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Quick Actions</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <Link
            to="/chat"
            className="group flex items-center p-4 sm:p-6 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl hover:bg-purple-50/50 dark:hover:bg-purple-900/20 hover:border-purple-200 dark:hover:border-purple-600 transition-all hover:shadow-soft"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center group-hover:bg-purple-500 transition-all group-hover:scale-110 flex-shrink-0">
              <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500 group-hover:text-white transition-colors" />
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-300 text-sm sm:text-base">Start Chat</h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">Ask AI assistant</p>
            </div>
          </Link>
          
          <Link
            to="/tasks"
            className="group flex items-center p-4 sm:p-6 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl hover:bg-blue-50/50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-600 transition-all hover:shadow-soft"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center group-hover:bg-blue-500 transition-all group-hover:scale-110 flex-shrink-0">
              <CheckSquare className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 group-hover:text-white transition-colors" />
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-300 text-sm sm:text-base">Add Task</h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">Create new task</p>
            </div>
          </Link>
          
          <Link
            to="/notes"
            className="group flex items-center p-4 sm:p-6 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl hover:bg-green-50/50 dark:hover:bg-green-900/20 hover:border-green-200 dark:hover:border-green-600 transition-all hover:shadow-soft sm:col-span-2 lg:col-span-1"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center group-hover:bg-green-500 transition-all group-hover:scale-110 flex-shrink-0">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 group-hover:text-white transition-colors" />
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-green-700 dark:group-hover:text-green-300 text-sm sm:text-base">New Note</h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">Write a note</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;