import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { predictJob } from '../services/api';
import { useAuth } from '../authContext';

export default function Home() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    salary: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Stats animation
  const [stats, setStats] = useState({
    fastAnalysis: 0,
    accuracy: 0,
    savedJobs: 0,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prev) => ({
        fastAnalysis: Math.min(prev.fastAnalysis + 50, 2000),
        accuracy: Math.min(prev.accuracy + 3, 94),
        savedJobs: Math.min(prev.savedJobs + 2500, 50000),
      }));
    }, 30);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Job Title and Description are required');
      return;
    }

    if (formData.description.trim().length < 50) {
      setError('Job description must be at least 50 characters');
      return;
    }

    setIsLoading(true);

    try {
      const userId = currentUser?.uid || null;
      const result = await predictJob(formData.title, formData.description, formData.salary, userId);
      
      // Also save to localStorage as backup
      try {
        const historyKey = userId ? `history_${userId}` : 'history_anonymous';
        const existing = JSON.parse(localStorage.getItem(historyKey) || '[]');
        const newRecord = {
          _id: Date.now().toString(),
          user_id: userId,
          title: formData.title,
          description: formData.description,
          salary: formData.salary,
          prediction: result.prediction,
          confidence: result.confidence,
          timestamp: new Date().toISOString()
        };
        existing.unshift(newRecord);
        localStorage.setItem(historyKey, JSON.stringify(existing));
      } catch (e) {
        console.log('Could not save to localStorage:', e);
      }
      
      navigate('/result', { state: result });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to analyze job posting. Please try again.');
      setIsLoading(false);
    }
  };

  const steps = [
    { number: '1', title: 'Enter Job Details', description: 'Copy and paste the job posting details including title and description into our platform.', icon: '📋' },
    { number: '2', title: 'AI Text Analysis', description: 'Our advanced AI scans for suspicious patterns, red flags, and common scam indicators.', icon: '🔍' },
    { number: '3', title: 'Machine Learning', description: 'Our trained models analyze the data against thousands of real and fake job patterns.', icon: '🧠' },
    { number: '4', title: 'Get Results', description: 'Receive an instant prediction with confidence score and detailed analysis.', icon: '✅' },
  ];

  return (
    <div className="bg-white">
      
      {/* Hero Section */}
      <section className="relative py-20 sm:py-28 px-4 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 right-10 w-72 h-72 bg-indigo-100 rounded-full blur-3xl opacity-40 animate-pulse"></div>
          <div className="absolute bottom-20 left-10 w-72 h-72 bg-blue-100 rounded-full blur-3xl opacity-40 animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-200 mb-8">
            <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
            <span className="text-sm font-medium text-indigo-700">Powered by Advanced Machine Learning</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Detect Fake Job Postings with
            <span className="block bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI Intelligence
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Protect yourself from scams and fraudulent job offers. Our AI analyzes thousands of job postings to identify suspicious patterns and help you find legitimate opportunities.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => document.getElementById('analysis-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold text-lg hover:shadow-xl hover:shadow-indigo-200 transition-all duration-200 hover:scale-105"
            >
              Analyze a Job Posting
            </button>
            <button
              onClick={() => navigate('/history')}
              className="px-8 py-4 rounded-lg border border-gray-300 bg-white text-gray-900 font-semibold text-lg hover:bg-gray-50 transition-all duration-200"
            >
              View History
            </button>
          </div>

          <div className="mt-16 pt-16 border-t border-gray-200 flex flex-col sm:flex-row justify-around items-center gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600">10,000+</div>
              <div className="text-sm text-gray-600 mt-1">Jobs Analyzed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600">94%</div>
              <div className="text-sm text-gray-600 mt-1">Detection Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600">50K+</div>
              <div className="text-sm text-gray-600 mt-1">Job Seekers Protected</div>
            </div>
          </div>
        </div>
      </section>

      {/* Job Analysis Form */}
      <section id="analysis-form" className="py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 sm:p-10 shadow-lg hover:shadow-xl transition-shadow duration-300">
            
            <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">Analyze a Job Posting</h2>
            <p className="text-center text-gray-600 mb-8">Enter the job details below and our AI will analyze it instantly</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {error && (
                <div className="p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3">
                  <span className="text-red-600 text-lg">⚠️</span>
                  <div>
                    <h3 className="font-semibold text-red-900">Error</h3>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="title" className="block text-sm font-semibold text-gray-900 mb-3">Job Title *</label>
                <input
                  id="title"
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Senior Software Engineer"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all placeholder-gray-400"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-gray-900 mb-3">Job Description *</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Paste the full job posting here (minimum 50 characters)..."
                  rows="8"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all placeholder-gray-400 resize-none"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500 mt-2">{formData.description.length} characters</p>
              </div>

              <div>
                <label htmlFor="salary" className="block text-sm font-semibold text-gray-900 mb-3">
                  Salary Range <span className="text-gray-500 font-normal">(optional)</span>
                </label>
                <input
                  id="salary"
                  type="text"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  placeholder="e.g., $80,000 - $120,000 per year"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all placeholder-gray-400"
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-6 py-3.5 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-indigo-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <span className="inline-block animate-spin">⚙️</span>
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <span>✨</span>
                    <span>Analyze Job Posting</span>
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center">Your submissions are processed instantly and securely.</p>

            </form>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Why Trust FakeJobDetector?</h2>
            <p className="text-lg text-gray-600">Industry-leading performance and protection</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              <div className="relative bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-all duration-300 hover:border-indigo-300">
                <div className="w-14 h-14 rounded-xl bg-indigo-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{Math.round(stats.fastAnalysis)}</h3>
                <p className="text-4xl font-bold text-indigo-600">ms</p>
                <p className="text-gray-600 mt-4">Average analysis time</p>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              <div className="relative bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-all duration-300 hover:border-blue-300">
                <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="text-4xl font-bold text-indigo-600 mb-2">{stats.accuracy}%</h3>
                <p className="text-gray-600 mt-4">Detection accuracy</p>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              <div className="relative bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-all duration-300 hover:border-purple-300">
                <div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">🛡️</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{(stats.savedJobs / 1000).toFixed(1)}K+</h3>
                <p className="text-gray-900 font-semibold">Protected Job Seekers</p>
                <p className="text-gray-600 mt-2 text-sm">And growing every day</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-600">Simple, instant, and accurate job posting analysis</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 relative">
            
            <div className="hidden md:block absolute top-20 left-0 right-0 h-1 bg-gradient-to-r from-indigo-200 via-blue-200 to-transparent -z-10"></div>

            {steps.map((step, index) => (
              <div key={index} className="relative">
                
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg group hover:scale-110 transition-transform duration-300">
                  {step.number}
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300 hover:border-indigo-300">
                  
                  <div className="text-4xl mb-4">{step.icon}</div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  
                  <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>

                </div>

              </div>
            ))}

          </div>

          <div className="mt-16 text-center">
            <p className="text-gray-600 mb-6">Ready to check a job posting?</p>
            <a
              href="#analysis-form"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold hover:shadow-lg hover:shadow-indigo-200 transition-all duration-200"
            >
              <span>Start Analyzing</span>
              <span>→</span>
            </a>
          </div>

        </div>
      </section>

    </div>
  );
}