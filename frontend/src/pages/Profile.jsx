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
    <div className="min-h-screen relative pt-24 pb-12 px-4 sm:px-6 lg:px-8 selection:bg-brand-500 selection:text-white overflow-hidden flex justify-center">
      
      {/* Background Ambience */}
      <div className="fixed top-1/4 left-1/4 w-[400px] h-[400px] bg-brand-200/50 blur-[120px] rounded-full animate-blob pointer-events-none -z-10"></div>
      <div className="fixed bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-300/40 blur-[150px] rounded-full animate-blob animation-delay-2000 pointer-events-none -z-10"></div>

      <div className="max-w-3xl w-full relative z-10 animate-fade-up">
        <div className="glass rounded-3xl overflow-hidden shadow-2xl border border-white/60">
          
          {/* Header Section */}
          <div className="bg-gradient-to-r from-brand-600 to-indigo-600 px-8 py-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
            
            <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-end gap-6 text-center sm:text-left">
              <div className="h-28 w-28 rounded-full bg-white flex items-center justify-center text-4xl font-bold text-brand-600 shadow-xl border-4 border-white overflow-hidden">
                {currentUser?.photoURL ? (
                  <img 
                    src={currentUser.photoURL} 
                    alt="Profile" 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>{currentUser?.displayName?.charAt(0) || currentUser?.email?.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="text-white pb-2">
                <h1 className="text-4xl font-outfit font-bold tracking-tight mb-2">
                  {currentUser?.displayName || 'User Profile'}
                </h1>
                <p className="text-brand-100 flex items-center justify-center sm:justify-start gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                  {currentUser?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="px-8 py-10 bg-white/40">
            <h2 className="text-xl font-outfit font-bold text-slate-900 mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
              Account Information
            </h2>
            
            <div className="grid sm:grid-cols-2 gap-6 mb-10">
              <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
                  Display Name
                </label>
                <p className="text-lg font-medium text-slate-900">
                  {currentUser?.displayName || 'Not set'}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
                  Account Status
                </label>
                <div className="mt-1">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${
                    currentUser?.emailVerified 
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                      : 'bg-amber-50 text-amber-600 border border-amber-100'
                  }`}>
                    {currentUser?.emailVerified ? '✓ Verified' : '✕ Unverified'}
                  </span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
                  System ID
                </label>
                <p className="text-sm text-slate-600 font-mono bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">
                  {currentUser?.uid}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm sm:col-span-2 flex justify-between items-center">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">
                    Member Since
                  </label>
                  <p className="text-slate-900 font-medium font-outfit">
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
                <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center text-brand-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-200/50">
              <button
                onClick={() => navigate('/history')}
                className="flex-1 bg-slate-900 text-white py-3.5 px-6 rounded-xl font-medium hover:bg-brand-600 transition-all duration-300 shadow-lg hover:shadow-brand-500/30 hover:-translate-y-0.5"
              >
                Access History Map
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 bg-white border border-red-200 text-red-600 py-3.5 px-6 rounded-xl font-medium hover:bg-red-50 transition-all duration-300 shadow-sm hover:shadow"
              >
                Sign Out
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Profile;
