import { useState, useContext, useEffect, useRef } from 'react';
import { Send, ArrowLeft, Phone, MoreHorizontal, Check, CheckCheck } from 'lucide-react';
import { format } from 'date-fns';
import ChatContext from '../../context/ChatContext';
import AuthContext from '../../context/AuthContext';

const ChatWindow = ({ onBack }) => {
  const { selectedChat, sendMessage, typingUsers, sendTyping } = useContext(ChatContext);
  const { user } = useContext(AuthContext);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedChat?.messages]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isTyping) {
        sendTyping(selectedChat._id, false);
        setIsTyping(false);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [isTyping, selectedChat?._id, sendTyping]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    await sendMessage(selectedChat._id, message);
    setMessage('');
    setIsTyping(false);
  };

  const handleChange = (e) => {
    setMessage(e.target.value);
    if (!isTyping) {
      sendTyping(selectedChat._id, true);
      setIsTyping(true);
    }
  };

  const getTypingText = () => {
    if (typingUsers.length === 0) return null;
    
    const typingNames = typingUsers.map(userId => {
      const user = selectedChat.participants.find(p => p._id === userId);
      return user?.name || 'Someone';
    });

    if (typingNames.length === 1) {
      return `${typingNames[0]} is typing...`;
    } else if (typingNames.length === 2) {
      return `${typingNames[0]} and ${typingNames[1]} are typing...`;
    } else {
      return 'Several people are typing...';
    }
  };

  if (!selectedChat) return null;

  return (
    <div className="h-full flex flex-col">
      {/* Chat header */}
      <div className="p-4 border-b dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded md:hidden"
            >
              <ArrowLeft className="h-5 w-5 dark:text-white" />
            </button>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
              {selectedChat.isGroup 
                ? selectedChat.name.charAt(0) 
                : selectedChat.participants.find(p => p._id !== user._id)?.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-semibold dark:text-white">
                {selectedChat.isGroup 
                  ? selectedChat.name 
                  : selectedChat.participants.find(p => p._id !== user._id)?.name}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {selectedChat.isGroup 
                  ? `${selectedChat.participants.length} members` 
                  : selectedChat.participants.find(p => p._id !== user._id)?.isOnline 
                    ? 'Online' 
                    : 'Offline'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
              <Phone className="h-5 w-5 dark:text-white" />
            </button>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
              <MoreHorizontal className="h-5 w-5 dark:text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
        {selectedChat.messages.map(msg => {
          const isOwn = msg.sender._id === user._id;
          
          return (
            <div key={msg._id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                isOwn 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
              }`}>
                {!isOwn && selectedChat.isGroup && (
                  <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
                    {msg.sender.name}
                  </p>
                )}
                <p className="text-sm">{msg.content}</p>
                <div className="flex items-center justify-end space-x-1 mt-1">
                  <span className={`text-xs ${isOwn ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
                    {format(new Date(msg.timestamp), 'h:mm a')}
                  </span>
                  {isOwn && (
                    msg.seen ? (
                      <CheckCheck className="h-4 w-4 text-blue-300" />
                    ) : (
                      <Check className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    )
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing indicator */}
      {typingUsers.length > 0 && (
        <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">
            {getTypingText()}
          </p>
        </div>
      )}

      {/* Message input */}
      <div className="p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-800">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <input
            type="text"
            value={message}
            onChange={handleChange}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
          <button
            type="submit"
            disabled={!message.trim()}
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;