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
      // Try to fetch from MongoDB first
      const data = await getHistory(currentUser.uid);
      let predictions = Array.isArray(data) ? data : [];
      
      // If MongoDB returns empty, try localStorage
      if (predictions.length === 0) {
        const historyKey = `history_${currentUser.uid}`;
        const localData = localStorage.getItem(historyKey);
        if (localData) {
          predictions = JSON.parse(localData);
          console.log('Loaded from localStorage:', predictions);
        }
      }
      
      setPredictions(predictions);
      setError('');
    } catch (err) {
      console.error('Error fetching from MongoDB, trying localStorage:', err);
      
      // Fallback to localStorage if API fails
      try {
        const historyKey = `history_${currentUser.uid}`;
        const localData = localStorage.getItem(historyKey);
        if (localData) {
          const predictions = JSON.parse(localData);
          setPredictions(predictions);
          setError('');
        } else {
          setError('');
        }
      } catch (localErr) {
        console.error('Error loading from localStorage:', localErr);
        setError('Failed to load history');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

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
    return filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  };

  const filteredPredictions = getFilteredPredictions();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-3">Analysis History</h1>
          <p className="text-lg text-gray-600">View all your previous job posting analyses</p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 mb-8">
            <p className="text-red-700 font-medium">❌ {error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-20">
            <div className="inline-block">
              <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
            <p className="mt-6 text-gray-600 font-medium">Loading your history...</p>
          </div>
        ) : predictions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Predictions Yet</h3>
            <p className="text-gray-600 mb-8">You haven't analyzed any job postings yet. Start by analyzing your first one!</p>
            <Link to="/" className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-indigo-200 transition-all">
              Start Analyzing
            </Link>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    placeholder="Search by job title or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none"
                  />
                </div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none"
                >
                  <option value="all">All Predictions</option>
                  <option value="fake">Fake Only</option>
                  <option value="genuine">Genuine Only</option>
                </select>
              </div>
            </div>

            <div className="mb-6 flex items-center gap-2 text-gray-600">
              <span className="font-semibold text-gray-900">{filteredPredictions.length}</span>
              <span>result{filteredPredictions.length !== 1 ? 's' : ''}</span>
            </div>

            {filteredPredictions.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <div className="text-4xl mb-4">🔍</div>
                <p className="text-gray-600">No results found matching your criteria</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-lg">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Job Title</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Prediction</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Confidence</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPredictions.map((pred, idx) => (
                        <tr key={idx} className="border-b border-gray-200 hover:bg-indigo-50 transition-colors">
                          <td className="px-6 py-4 text-sm text-gray-600">{formatDate(pred.timestamp)}</td>
                          <td className="px-6 py-4"><span className="text-gray-900 font-medium">{pred.title.substring(0, 40)}{pred.title.length > 40 ? '...' : ''}</span></td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${pred.prediction === 'Fake' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                              {pred.prediction === 'Fake' ? '🚫' : '✅'} {pred.prediction}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div className={`h-full ${pred.prediction === 'Fake' ? 'bg-red-600' : 'bg-green-600'}`} style={{ width: `${pred.confidence}%` }}></div>
                              </div>
                              <span className="text-sm font-semibold text-gray-900">{pred.confidence}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button onClick={() => { setSelectedPrediction(pred); setShowModal(true); }} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-semibold">View</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="mt-12 text-center">
              <Link to="/" className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-indigo-200 transition-all">
                Analyze Another Job
              </Link>
            </div>
          </>
        )}
      </div>

      {showModal && selectedPrediction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className={`px-6 sm:px-8 py-6 border-b border-gray-200 flex items-center justify-between ${selectedPrediction.prediction === 'Fake' ? 'bg-red-50' : 'bg-green-50'}`}>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Details</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
            </div>

            <div className="px-6 sm:px-8 py-6 space-y-6">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Job Title</p>
                <p className="text-lg font-semibold text-gray-900">{selectedPrediction.title}</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Job Description</p>
                <div className="bg-gray-50 rounded-lg p-4 max-h-32 overflow-y-auto border-l-4 border-indigo-500">
                  <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">{selectedPrediction.description}</p>
                </div>
              </div>

              {selectedPrediction.salary && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Salary</p>
                  <p className="text-gray-900">{selectedPrediction.salary}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Prediction</p>
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-bold ${selectedPrediction.prediction === 'Fake' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {selectedPrediction.prediction === 'Fake' ? '❌' : '✅'} {selectedPrediction.prediction}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Confidence</p>
                  <p className="text-3xl font-bold text-indigo-600">{selectedPrediction.confidence}%</p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Analyzed</p>
                <p className="text-gray-700">{formatDate(selectedPrediction.timestamp)}</p>
              </div>
            </div>

            <div className="px-6 sm:px-8 py-4 bg-gray-50 border-t border-gray-200 flex gap-3 justify-end">
              <button onClick={() => setShowModal(false)} className="px-6 py-2 bg-gray-200 text-gray-900 font-semibold rounded-lg hover:bg-gray-300 transition">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default History;
