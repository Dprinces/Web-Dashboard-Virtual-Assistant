import React, { useState } from 'react';
import { Send, MessageSquare } from 'lucide-react';

const Chat = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI assistant. How can I help you today?",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage = {
      id: Date.now(),
      text: message,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        text: "I understand your message. This is a placeholder response. The AI functionality will be implemented when the backend is connected.",
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-8rem)] space-y-6">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-soft">
          <MessageSquare className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white animate-fade-in">AI Chat</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Chat with your intelligent assistant</p>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 card overflow-hidden flex flex-col animate-slide-up">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, index) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div
                className={`max-w-xs lg:max-w-md px-6 py-4 rounded-2xl shadow-soft ${
                  msg.sender === 'user'
                    ? 'bg-gradient-primary text-white'
                    : 'bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-100 dark:border-gray-700'
                }`}
              >
                <p className="text-sm leading-relaxed">{msg.text}</p>
                <p className={`text-xs mt-2 ${
                  msg.sender === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {msg.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="border-t border-gray-100 p-6 bg-gray-50/50 backdrop-blur-sm">
          <form onSubmit={handleSendMessage} className="flex space-x-4">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="input-field flex-1"
            />
            <button
              type="submit"
              disabled={!message.trim()}
              className="btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;