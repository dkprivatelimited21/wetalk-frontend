import { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MessageCircle, 
  Users, 
  Settings, 
  Search, 
  Plus, 
  Send, 
  MoreHorizontal,
  Phone,
  UserPlus,
  LogOut,
  Moon,
  Sun,
  Check,
  CheckCheck,
  ArrowLeft
} from 'lucide-react';
import AuthContext from '../context/AuthContext';
import ChatContext from '../context/ChatContext';
import ChatList from '../components/ChatList';
import ChatWindow from '../components/ChatWindow';
import NewChatModal from '../components/modals/NewChatModal';
import AddContactModal from '../components/modals/AddContactModal';

const ChatPage = () => {
  const { user, logout, isAuthenticated } = useContext(AuthContext);
  const { 
    chats, 
    selectedChat, 
    getChats, 
    setSelectedChat,
    socket
  } = useContext(ChatContext);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      getChats();
      if (socket) {
        socket.emit('join', { userId: user._id });
      }
    }
  }, [isAuthenticated, socket, user]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  if (!isAuthenticated) return null;

  return (
    <div className={`flex h-screen ${isDarkMode ? 'dark' : ''}`}>
      <div className="flex w-full bg-white dark:bg-gray-900">
        {/* Sidebar */}
        <div className="w-80 border-r dark:border-gray-700 flex flex-col">
          {/* Navigation */}
          <div className="p-4 border-b dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {user?.name?.charAt(0)}
                </div>
                <div>
                  <h2 className="font-semibold dark:text-white">{user?.name}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{user?.status}</p>
                </div>
              </div>
              <button
                onClick={toggleTheme}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                {isDarkMode ? <Sun className="h-5 w-5 text-white" /> : <Moon className="h-5 w-5" />}
              </button>
            </div>
            
            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md bg-white dark:bg-gray-600 shadow-sm">
                <MessageCircle className="h-4 w-4 dark:text-white" />
                <span className="text-sm font-medium dark:text-white">Chats</span>
              </button>
              <button
                onClick={() => setShowContactModal(true)}
                className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <UserPlus className="h-4 w-4 dark:text-white" />
                <span className="text-sm font-medium dark:text-white">Contacts</span>
              </button>
              <button
                onClick={logout}
                className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <LogOut className="h-4 w-4 dark:text-white" />
                <span className="text-sm font-medium dark:text-white">Logout</span>
              </button>
            </div>
          </div>

          {/* Chat list */}
          <ChatList 
            chats={chats} 
            selectedChat={selectedChat} 
            setSelectedChat={setSelectedChat}
            onNewChat={() => setShowNewChatModal(true)}
          />
        </div>

        {/* Main content area */}
        <div className="flex-1">
          {selectedChat ? (
            <ChatWindow 
              chat={selectedChat} 
              onBack={() => setSelectedChat(null)}
            />
          ) : (
            <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-800">
              <div className="text-center">
                <MessageCircle className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Select a chat to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <NewChatModal 
        isOpen={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
      />
      <AddContactModal 
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
      />
    </div>
  );
};

export default ChatPage;