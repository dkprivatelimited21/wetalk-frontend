import { useState, useContext } from 'react';
import { X, Users, UserPlus } from 'lucide-react';
import AuthContext from '../../context/AuthContext';
import ChatContext from '../../context/ChatContext';

const NewChatModal = ({ isOpen, onClose }) => {
  const { user } = useContext(AuthContext);
  const { createChat } = useContext(ChatContext);
  const [selectedTab, setSelectedTab] = useState('contacts');
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [groupName, setGroupName] = useState('');

  const handleCreateChat = async (contactId) => {
    await createChat([contactId], false);
    onClose();
  };

  const handleCreateGroup = async () => {
    if (groupName.trim() && selectedContacts.length > 0) {
      await createChat(selectedContacts, true, groupName);
      setGroupName('');
      setSelectedContacts([]);
      onClose();
    }
  };

  const toggleContact = (contactId) => {
    setSelectedContacts(prev => 
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold dark:text-white">New Chat</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <X className="h-5 w-5 dark:text-white" />
          </button>
        </div>
        
        <div className="flex border-b dark:border-gray-700 mb-4">
          <button
            onClick={() => setSelectedTab('contacts')}
            className={`flex-1 py-2 font-medium text-sm ${
              selectedTab === 'contacts'
                ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            Contacts
          </button>
          <button
            onClick={() => setSelectedTab('group')}
            className={`flex-1 py-2 font-medium text-sm ${
              selectedTab === 'group'
                ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            New Group
          </button>
        </div>
        
        {selectedTab === 'contacts' ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {user.contacts.map(contact => (
              <button
                key={contact._id}
                onClick={() => handleCreateChat(contact._id)}
                className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {contact.name.charAt(0)}
                </div>
                <div className="text-left">
                  <p className="font-medium dark:text-white">{contact.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{contact.status}</p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
            
            <div>
              <h4 className="font-medium mb-3 dark:text-white">Select Members</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {user.contacts.map(contact => (
                  <label
                    key={contact._id}
                    className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedContacts.includes(contact._id)}
                      onChange={() => toggleContact(contact._id)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {contact.name.charAt(0)}
                    </div>
                    <span className="dark:text-white">{contact.name}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <button
              onClick={handleCreateGroup}
              disabled={!groupName.trim() || selectedContacts.length === 0}
              className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Group
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewChatModal;