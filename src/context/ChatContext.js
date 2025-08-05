import { createContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import api from '../services/api';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(process.env.REACT_APP_API_URL, {
      withCredentials: true
    });
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('message', (data) => {
      setChats(prevChats => {
        return prevChats.map(chat => {
          if (chat._id === data.chatId) {
            return {
              ...chat,
              messages: [...chat.messages, data.message],
              lastMessage: data.message
            };
          }
          return chat;
        });
      });

      if (selectedChat && selectedChat._id === data.chatId) {
        setSelectedChat(prev => ({
          ...prev,
          messages: [...prev.messages, data.message],
          lastMessage: data.message
        }));
      }
    });

    socket.on('typing', (data) => {
      if (data.isTyping) {
        setTypingUsers(prev => [...prev, data.userId]);
      } else {
        setTypingUsers(prev => prev.filter(id => id !== data.userId));
      }
    });

    socket.on('userStatus', (data) => {
      setChats(prevChats => {
        return prevChats.map(chat => {
          const updatedParticipants = chat.participants.map(participant => {
            if (participant._id === data.userId) {
              return { ...participant, isOnline: data.isOnline };
            }
            return participant;
          });
          return { ...chat, participants: updatedParticipants };
        });
      });

      if (selectedChat) {
        const updatedParticipants = selectedChat.participants.map(participant => {
          if (participant._id === data.userId) {
            return { ...participant, isOnline: data.isOnline };
          }
          return participant;
        });
        setSelectedChat({ ...selectedChat, participants: updatedParticipants });
      }
    });

    return () => {
      socket.off('message');
      socket.off('typing');
      socket.off('userStatus');
    };
  }, [socket, selectedChat]);

  const getChats = async () => {
    const res = await api.get('/chats');
    setChats(res.data.data);
  };

  const getChat = async (chatId) => {
    const res = await api.get(`/chats/${chatId}`);
    setSelectedChat(res.data.data);
  };

  const createChat = async (participants, isGroup = false, name = '') => {
    const res = await api.post('/chats', { participants, isGroup, name });
    setChats(prev => [res.data.data, ...prev]);
    return res.data.data;
  };

  const sendMessage = async (chatId, content) => {
    const res = await api.post(`/chats/${chatId}/messages`, { content });
    if (socket) {
      socket.emit('typing', { chatId, isTyping: false });
    }
    return res.data.data;
  };

  const sendTyping = (chatId, isTyping) => {
    if (socket) {
      socket.emit('typing', { chatId, isTyping });
    }
  };

  return (
    <ChatContext.Provider
      value={{
        chats,
        selectedChat,
        onlineUsers,
        typingUsers,
        socket,
        getChats,
        getChat,
        createChat,
        sendMessage,
        sendTyping,
        setSelectedChat
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export default ChatContext;