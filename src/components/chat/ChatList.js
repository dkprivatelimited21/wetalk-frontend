import { useState, useContext, useEffect } from 'react';
import { Search, Plus } from 'lucide-react';
import ChatContext from '../../context/ChatContext';
import AuthContext from '../../context/AuthContext';
import { Users } from 'lucide-react';

const ChatList = ({ onNewChat }) => {
  const { chats, selectedChat, setSelectedChat, getChats } = useContext(ChatContext);
  const { user } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    getChats();
  }, []);

  const filteredChats = chats.filter(chat => 
    chat.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.lastMessage?.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.participants.some(p => 
      p._id !== user._id && 
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <div className="p-4 border-b dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold dark:text-white">Chats</h2>
          <button
            onClick={onNewChat}
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {filteredChats.map(chat => (
          <div
            key={chat._id}
            onClick={() => setSelectedChat(chat)}
            className={`p-4 border-b dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
              selectedChat?._id === chat._id ? 'bg-blue-50 dark:bg-gray-600' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {chat.isGroup ? chat.name.charAt(0) : chat.participants.find(p => p._id !== user._id)?.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold dark:text-white truncate">
                      {chat.isGroup ? chat.name : chat.participants.find(p => p._id !== user._id)?.name}
                    </h3>
                    {chat.isGroup && <Users className="h-4 w-4 text-gray-400" />}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                    {chat.lastMessage?.content || 'No messages yet'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(chat.lastMessage?.timestamp || chat.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </p>
                {chat.unreadCount > 0 && (
                  <span className="inline-block bg-red-500 text-white text-xs rounded-full px-2 py-1 mt-1">
                    {chat.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatList;