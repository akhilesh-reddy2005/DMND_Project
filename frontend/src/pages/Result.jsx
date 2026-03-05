import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state;

  useEffect(() => {
    if (!data || !data.prediction) {
      navigate('/');
    }
  }, [data, navigate]);

  if (!data) {
    return null;
  }

  const { title, description, salary, prediction, confidence, error } = data;
  const isFake = prediction === 'Fake';

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-3">
            Analysis Complete
          </h1>
          <p className="text-lg text-gray-600">
            Here's what our AI detected
          </p>
        </div>

        {error ? (
          /* Error State */
          <div className="bg-white rounded-2xl border border-gray-200 p-8 sm:p-12 shadow-lg text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-red-600 mb-3">Analysis Error</h2>
            <p className="text-gray-600 mb-8 text-lg">{error}</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-indigo-200 transition-all"
            >
              ← Go Back
            </Link>
          </div>
        ) : (
          <>
            {/* Main Result Card */}
            <div className={`bg-white rounded-2xl border-2 shadow-xl overflow-hidden mb-8 ${
              isFake ? 'border-red-200' : 'border-green-200'
            }`}>
              
              {/* Top Bar */}
              <div className={`h-1 bg-gradient-to-r ${
                isFake 
                  ? 'from-red-500 to-red-600' 
                  : 'from-green-500 to-green-600'
              }`}></div>

              <div className="p-8 sm:p-12">
                
                {/* Prediction Result */}
                <div className="grid sm:grid-cols-2 gap-8 mb-12 items-center">
                  
                  {/* Left: Icon and Status */}
                  <div>
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center text-5xl mb-6 font-bold ${
                      isFake 
                        ? 'bg-red-100 text-red-600' 
                        : 'bg-green-100 text-green-600'
                    }`}>
                      {isFake ? '⚠️' : '✅'}
                    </div>
                    
                    <div className="mb-6">
                      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Prediction
                      </p>
                      <h2 className={`text-5xl font-bold ${
                        isFake ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {prediction}
                      </h2>
                    </div>

                    <p className={`text-lg leading-relaxed ${
                      isFake 
                        ? 'text-red-700' 
                        : 'text-green-700'
                    }`}>
                      {isFake
                        ? 'This job posting shows signs of being fraudulent. Be cautious.'
                        : 'This job posting appears to be legitimate. Good to apply!'}
                    </p>
                  </div>

                  {/* Right: Confidence Score */}
                  <div className="flex justify-center">
                    <div className="relative w-48 h-48">
                      <svg className="w-full h-full" viewBox="0 0 200 200">
                        <circle cx="100" cy="100" r="90" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                        <circle
                          cx="100"
                          cy="100"
                          r="90"
                          fill="none"
                          stroke={isFake ? '#ef4444' : '#10b981'}
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray={`${(confidence / 100) * 565} 565`}
                          className="transition-all duration-1000"
                          style={{
                            transform: 'rotate(-90deg)',
                            transformOrigin: '100px 100px'
                          }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-5xl font-bold ${
                          isFake ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {confidence}%
                        </span>
                        <span className="text-sm text-gray-600 mt-1">Confidence</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 pt-8 mb-8"></div>

                {/* Job Details */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Job Details</h3>
                  
                  <div className="space-y-4">
                    {title && (
                      <div>
                        <p className="text-sm font-semibold text-gray-600 mb-2">Job Title</p>
                        <p className="text-lg text-gray-900 bg-gray-50 rounded-lg p-4 border-l-4 border-indigo-500">
                          {title}
                        </p>
                      </div>
                    )}

                    {description && (
                      <div>
                        <p className="text-sm font-semibold text-gray-600 mb-2">Job Description</p>
                        <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-indigo-500 max-h-48 overflow-y-auto">
                          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                            {description}
                          </p>
                        </div>
                      </div>
                    )}

                    {salary && (
                      <div>
                        <p className="text-sm font-semibold text-gray-600 mb-2">Salary Range</p>
                        <p className="text-lg text-gray-900 bg-gray-50 rounded-lg p-4 border-l-4 border-emerald-500">
                          {salary}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* Alert Box */}
            <div className={`rounded-2xl p-6 sm:p-8 mb-8 border-l-4 ${
              isFake
                ? 'bg-red-50 border-red-500'
                : 'bg-green-50 border-green-500'
            }`}>
              <h4 className={`text-lg font-bold mb-3 ${
                isFake ? 'text-red-900' : 'text-green-900'
              }`}>
                {isFake ? '⚠️ Caution' : '✓ Recommendation'}
              </h4>
              
              {isFake ? (
                <ul className={`space-y-2 ${isFake ? 'text-red-800' : 'text-green-800'}`}>
                  <li>• Unrealistic salary or benefits promises</li>
                  <li>• Request for personal/financial info before hiring</li>
                  <li>• Poor grammar or spelling errors</li>
                  <li>• Vague job description</li>
                  <li>• No verifiable company information</li>
                </ul>
              ) : (
                <ul className="space-y-2 text-green-800">
                  <li>✓ Verify on company's official website</li>
                  <li>✓ Check employee reviews on Glassdoor</li>
                  <li>✓ Research the company background</li>
                  <li>✓ Verify contact information</li>
                </ul>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/"
                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-indigo-200 transition-all text-center"
              >
                Analyze Another Job
              </Link>
              
              <Link
                to="/history"
                className="px-8 py-3 border-2 border-indigo-600 text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition-all text-center"
              >
                View History
              </Link>
            </div>

          </>
        )}
      </div>
    </div>
  );
}

export default Result;
