import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getHistory } from '../services/api';
import { useAuth } from '../authContext';

function History() {
  const { currentUser } = useAuth();
  const [predictions, setPredictions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    if (currentUser) {
      fetchHistory();
    }
  }, [currentUser]);

  const fetchHistory = async () => {
    try {
      const data = await getHistory(currentUser.uid);
      let predictions = Array.isArray(data) ? data : [];
      
      if (predictions.length === 0) {
        const historyKey = `history_${currentUser.uid}`;
        const localData = localStorage.getItem(historyKey);
        if (localData) {
          predictions = JSON.parse(localData);
        }
      }
      
      setPredictions(predictions);
      setError('');
    } catch (err) {
      console.error('Error fetching from MongoDB, trying localStorage:', err);
      try {
        const historyKey = `history_${currentUser.uid}`;
        const localData = localStorage.getItem(historyKey);
        if (localData) {
          const predictions = JSON.parse(localData);
          setPredictions(predictions);
        }
        setError('');
      } catch (localErr) {
        setError('Failed to load history');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPredictionDate = (prediction) => prediction?.timestamp || prediction?.created_at || null;

  const getFilteredPredictions = () => {
    let filtered = predictions;
    if (filterType !== 'all') {
      filtered = filtered.filter(p => p.prediction?.toLowerCase() === filterType.toLowerCase());
    }
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered.sort((a, b) => new Date(getPredictionDate(b)) - new Date(getPredictionDate(a)));
  };

  const filteredPredictions = getFilteredPredictions();

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 selection:bg-brand-500 selection:text-white relative z-0">
      
      {/* Background Blobs */}
      <div className="fixed top-20 left-10 w-96 h-96 rounded-full bg-brand-200/40 blur-3xl -z-10 animate-blob"></div>
      <div className="fixed bottom-20 right-10 w-[500px] h-[500px] rounded-full bg-indigo-200/40 blur-3xl -z-10 animate-blob animation-delay-4000"></div>

      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-10 animate-fade-down">
          <h1 className="text-4xl sm:text-5xl font-outfit font-bold text-slate-900 mb-4 tracking-tight">
            Analysis History
          </h1>
          <p className="text-lg text-slate-500">
            Review your previously analyzed job postings
          </p>
        </div>

        {error && (
          <div className="glass border-red-200 bg-red-50/80 p-4 mb-8 rounded-2xl animate-fade-in shadow-sm">
            <p className="text-red-700 font-medium flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {error}
            </p>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-32 animate-fade-in">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
              <div className="absolute inset-0 rounded-full border-4 border-brand-500 border-t-transparent animate-spin"></div>
            </div>
            <p className="text-slate-500 font-medium text-lg">Loading history securely...</p>
          </div>
        ) : predictions.length === 0 ? (
          <div className="glass rounded-3xl p-16 text-center animate-fade-in shadow-xl">
            <div className="w-24 h-24 mx-auto bg-brand-50 rounded-full flex items-center justify-center mb-6 text-brand-500">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            </div>
            <h3 className="text-2xl font-outfit font-bold text-slate-900 mb-3">No Analyses Yet</h3>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto">You haven't run any job postings through our AI verification yet.</p>
            <Link to="/" className="inline-flex items-center gap-2 px-8 py-3.5 bg-slate-900 text-white font-medium rounded-xl hover:bg-brand-600 transition-all duration-300 shadow-lg hover:shadow-brand-500/30 hover:-translate-y-0.5">
              Start Analyzing Now
            </Link>
          </div>
        ) : (
          <div className="animate-fade-up" style={{ animationDelay: '100ms' }}>
            
            {/* Filters Bar */}
            <div className="glass rounded-2xl p-4 mb-8 shadow-md">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="md:col-span-2 relative">
                  <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  <input
                    type="text"
                    placeholder="Search by job title or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all placeholder:text-slate-400 text-slate-700"
                  />
                </div>
                <div className="relative">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full px-4 py-3 appearance-none bg-slate-50/50 border border-slate-200 rounded-xl focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all text-slate-700 cursor-pointer"
                  >
                    <option value="all">All Outcomes</option>
                    <option value="fake">Fake Only</option>
                    <option value="genuine">Genuine Only</option>
                  </select>
                  <svg className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>

            <div className="mb-6 flex items-center gap-2 text-sm text-slate-500 font-medium px-2">
              Found <span className="px-2 py-0.5 bg-slate-200 rounded-md text-slate-700">{filteredPredictions.length}</span> records
            </div>

            {/* Data Table / Cards */}
            {filteredPredictions.length === 0 ? (
              <div className="glass rounded-3xl p-16 text-center shadow-md">
                <div className="text-4xl mb-4 opacity-50">🔍</div>
                <p className="text-slate-500 text-lg">No results found matching your filters.</p>
              </div>
            ) : (
              <div className="glass rounded-3xl overflow-hidden shadow-xl border border-white/60">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-100">
                        <th className="px-6 py-4 font-outfit font-semibold text-slate-600 text-sm whitespace-nowrap">Analyzed On</th>
                        <th className="px-6 py-4 font-outfit font-semibold text-slate-600 text-sm">Job Title</th>
                        <th className="px-6 py-4 font-outfit font-semibold text-slate-600 text-sm">Verdict</th>
                        <th className="px-6 py-4 font-outfit font-semibold text-slate-600 text-sm whitespace-nowrap">Confidence</th>
                        <th className="px-6 py-4 font-outfit font-semibold text-slate-600 text-sm text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/50">
                      {filteredPredictions.map((pred, idx) => {
                        const isFake = pred.prediction === 'Fake';
                        return (
                          <tr key={idx} className="group hover:bg-slate-50/50 transition-colors duration-200">
                            <td className="px-6 py-5 text-sm text-slate-500 whitespace-nowrap">
                              {formatDate(getPredictionDate(pred))}
                            </td>
                            <td className="px-6 py-5">
                              <span className="text-slate-800 font-medium line-clamp-1">{pred.title || "Untitled Job"}</span>
                            </td>
                            <td className="px-6 py-5">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${isFake ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                                {isFake ? 'Fake' : 'Genuine'}
                              </span>
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-3 max-w-[120px]">
                                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                  <div className={`h-full rounded-full ${isFake ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${pred.confidence}%` }}></div>
                                </div>
                                <span className="text-sm font-semibold text-slate-700 w-10">{pred.confidence}%</span>
                              </div>
                            </td>
                            <td className="px-6 py-5 text-center">
                              <button 
                                onClick={() => { setSelectedPrediction(pred); setShowModal(true); }} 
                                className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:border-brand-500 hover:text-brand-600 transition-colors text-sm font-medium shadow-sm group-hover:shadow"
                              >
                                Review
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modern Modal */}
      {showModal && selectedPrediction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          
          {/* Modal Content */}
          <div className="relative w-full max-w-2xl glass rounded-3xl shadow-2xl overflow-hidden animate-fade-up flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className={`px-8 py-6 border-b border-white/50 flex items-center justify-between ${selectedPrediction.prediction === 'Fake' ? 'bg-gradient-to-r from-red-50 to-white' : 'bg-gradient-to-r from-emerald-50 to-white'}`}>
              <h2 className="text-2xl font-outfit font-bold text-slate-900 tracking-tight">Analysis Report</h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-8 bg-white/50">
              
              <div className="grid sm:grid-cols-2 gap-8">
                <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm relative overflow-hidden">
                  <div className={`absolute top-0 right-0 w-20 h-20 -mr-10 -mt-10 rounded-full opacity-20 ${selectedPrediction.prediction === 'Fake' ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Verdict</p>
                  <p className={`text-3xl font-outfit font-bold ${selectedPrediction.prediction === 'Fake' ? 'text-red-600' : 'text-emerald-600'}`}>
                    {selectedPrediction.prediction}
                  </p>
                </div>
                
                <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 -mr-10 -mt-10 rounded-full opacity-20 bg-brand-500"></div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Confidence Score</p>
                  <p className="text-3xl font-outfit font-bold text-brand-600">{selectedPrediction.confidence}%</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-500 mb-2">Job Title</p>
                <p className="text-lg font-medium text-slate-900 bg-white p-4 rounded-xl border border-slate-100">{selectedPrediction.title || 'N/A'}</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-500 mb-2">Job Description</p>
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 max-h-48 overflow-y-auto custom-scrollbar shadow-inner">
                  <p className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">{selectedPrediction.description || 'N/A'}</p>
                </div>
              </div>

              {selectedPrediction.salary && (
                <div>
                  <p className="text-sm font-semibold text-slate-500 mb-2">Salary Data</p>
                  <p className="text-slate-900 bg-white p-4 rounded-xl border border-slate-100">{selectedPrediction.salary}</p>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-xs font-medium text-slate-400 pb-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Analyzed on {formatDate(getPredictionDate(selectedPrediction))}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default History;
