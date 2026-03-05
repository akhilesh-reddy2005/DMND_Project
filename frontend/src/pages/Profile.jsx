import { useAuth } from '../authContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-indigo-600 to-blue-500 px-8 py-12">
            <div className="flex items-center space-x-6">
              <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center text-4xl font-bold text-indigo-600 shadow-lg">
                {currentUser?.photoURL ? (
                  <img 
                    src={currentUser.photoURL} 
                    alt="Profile" 
                    className="h-24 w-24 rounded-full object-cover"
                  />
                ) : (
                  <span>{currentUser?.displayName?.charAt(0) || currentUser?.email?.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="text-white">
                <h1 className="text-3xl font-bold mb-2">
                  {currentUser?.displayName || 'User Profile'}
                </h1>
                <p className="text-indigo-100">
                  {currentUser?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="px-8 py-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Information</h2>
            
            <div className="space-y-4">
              <div className="border-b border-gray-200 pb-4">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Display Name
                </label>
                <p className="text-lg text-gray-900">
                  {currentUser?.displayName || 'Not set'}
                </p>
              </div>

              <div className="border-b border-gray-200 pb-4">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Email Address
                </label>
                <p className="text-lg text-gray-900">
                  {currentUser?.email}
                </p>
              </div>

              <div className="border-b border-gray-200 pb-4">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  User ID
                </label>
                <p className="text-sm text-gray-700 font-mono bg-gray-50 px-3 py-2 rounded">
                  {currentUser?.uid}
                </p>
              </div>

              <div className="border-b border-gray-200 pb-4">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Email Verified
                </label>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  currentUser?.emailVerified 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {currentUser?.emailVerified ? '✓ Verified' : '✕ Not Verified'}
                </span>
              </div>

              <div className="pb-4">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Account Created
                </label>
                <p className="text-lg text-gray-900">
                  {currentUser?.metadata?.creationTime 
                    ? new Date(currentUser.metadata.creationTime).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : 'N/A'
                  }
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex gap-4">
              <button
                onClick={() => navigate('/history')}
                className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-700 transition duration-200"
              >
                View History
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-red-700 transition duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
