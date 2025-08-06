import { useState, useContext } from 'react';
import { X, UserPlus, QrCode } from 'lucide-react';
import AuthContext from '../../context/AuthContext';
import api from '../../services/api';

const AddContactModal = ({ isOpen, onClose }) => {
  const { user } = useContext(AuthContext);
  const [contactInfo, setContactInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddContact = async () => {
    if (!contactInfo.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      await api.post('/contacts', { 
        identifier: contactInfo,
        currentUserId: user._id 
      });
      onClose();
      setContactInfo('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add contact');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold dark:text-white">Add Contact</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <X className="h-5 w-5 dark:text-white" />
          </button>
        </div>
        
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Email or Phone Number"
            value={contactInfo}
            onChange={(e) => setContactInfo(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
          
          {error && (
            <div className="text-red-500 dark:text-red-400 text-sm">{error}</div>
          )}

          <div className="flex space-x-2">
            <button className="flex-1 flex items-center justify-center space-x-2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <QrCode className="h-5 w-5 dark:text-white" />
              <span className="dark:text-white">Scan QR</span>
            </button>
            <button
              onClick={handleAddContact}
              disabled={loading || !contactInfo.trim()}
              className="flex-1 bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                'Adding...'
              ) : (
                <>
                  <UserPlus className="inline mr-2 h-5 w-5" />
                  Add Contact
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddContactModal;