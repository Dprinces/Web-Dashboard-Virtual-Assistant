import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { 
  LayoutDashboard, 
  MessageSquare, 
  CheckSquare, 
  FileText, 
  Menu, 
  X, 
  LogOut, 
  User,
  Bell,
  Moon,
  Sun
} from 'lucide-react';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Chat', href: '/chat', icon: MessageSquare },
    { name: 'Tasks', href: '/tasks', icon: CheckSquare },
    { name: 'Notes', href: '/notes', icon: FileText },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-gray-800/30 dark:to-gray-700/30">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm"></div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md shadow-large border-r border-gray-200/50 dark:border-gray-700/50 transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-xl flex items-center justify-center shadow-soft">
              <LayoutDashboard className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-xl text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="mt-8 px-4">
          <div className="space-y-2">
            {navigation.map((item, index) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 animate-slide-in-right ${
                    isActive
                      ? 'bg-gradient-primary text-white shadow-medium'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white hover:shadow-soft'
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className={`mr-3 w-5 h-5 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400'
                  }`} />
                  {item.name}
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse-soft"></div>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User profile */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50/50 dark:bg-gray-700/50 hover:bg-gray-100/50 dark:hover:bg-gray-600/50 transition-all cursor-pointer group">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-soft">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user?.email || 'user@example.com'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-gray-400 dark:text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all opacity-0 group-hover:opacity-100"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Header - Always visible on mobile, hidden on desktop */}
        <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-soft border-b border-gray-200/50 dark:border-gray-700/50 lg:hidden">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-xl text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all focus-ring"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-primary rounded-xl flex items-center justify-center shadow-soft">
                  <LayoutDashboard className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white hidden sm:block">Dashboard</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={toggleTheme}
                className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-all focus-ring"
                title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? (
                  <Sun className="w-4 h-4 text-yellow-500" />
                ) : (
                  <Moon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                )}
              </button>
              <div className="relative">
                <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-all cursor-pointer">
                  <Bell className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse-soft"></div>
              </div>
              <div className="w-8 h-8 bg-gradient-primary rounded-xl flex items-center justify-center shadow-soft sm:hidden">
                <User className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </header>

        {/* Desktop Header - Only visible on desktop */}
        <header className="hidden lg:flex bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-soft border-b border-gray-200/50 dark:border-gray-700/50 h-16 px-8">
          <div className="flex items-center justify-end w-full space-x-4">
            <button
              onClick={toggleTheme}
              className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-all focus-ring"
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-yellow-500" />
              ) : (
                <Moon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              )}
            </button>
            <div className="relative">
              <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-all cursor-pointer">
                <Bell className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse-soft"></div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50/50 via-blue-50/20 to-indigo-50/20 dark:from-gray-900/50 dark:via-gray-800/20 dark:to-gray-700/20 p-4 sm:p-6 lg:p-8">
          <div className="animate-slide-up max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;