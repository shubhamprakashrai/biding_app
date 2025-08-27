'use client';

import { useState } from 'react';
import { Message } from '@/types';
import { Send, ArrowLeft } from 'lucide-react';

interface ChatComponentProps {
  projectId: string;
  projectTitle: string;
  messages: Message[];
  currentUserId: string;
  currentUserRole: 'USER' | 'ADMIN';
  onClose: () => void;
  onSendMessage: (content: string) => void;
}

export default function ChatComponent({ 
  projectId, 
  projectTitle, 
  messages, 
  currentUserId, 
  currentUserRole, 
  onClose, 
  onSendMessage 
}: ChatComponentProps) {
  const [newMessage, setNewMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Project Communication</h2>
            <p className="text-gray-600 mt-1">{projectTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200 flex items-center space-x-2"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.filter(msg => msg.projectId === projectId).map((message) => (
            <div
              key={message.id}
              className={`flex ${message.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                  message.senderId === currentUserId
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <div className="text-sm font-medium mb-1">
                  {message.senderName} ({message.senderRole})
                </div>
                <div className="text-sm leading-relaxed">{message.content}</div>
                <div className={`text-xs mt-2 ${
                  message.senderId === currentUserId ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {formatTimestamp(message.timestamp)}
                </div>
              </div>
            </div>
          ))}

          {messages.filter(msg => msg.projectId === projectId).length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <p>No messages yet. Start the conversation!</p>
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="p-6 border-t border-gray-200">
          <form onSubmit={handleSubmit} className="flex space-x-4">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2"
            >
              <Send size={20} />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}