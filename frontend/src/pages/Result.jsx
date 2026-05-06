import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state;
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    if (!data || (!data.prediction && !data.error)) {
      navigate('/');
    }
  }, [data, navigate]);

  useEffect(() => {
    if (data?.confidence) {
      const controls = setInterval(() => {
        setAnimatedScore((prev) => {
          if (prev < data.confidence) return Math.min(prev + 2, data.confidence);
          clearInterval(controls);
          return data.confidence;
        });
      }, 20);
      return () => clearInterval(controls);
    }
  }, [data]);

  if (!data) return null;

  const { title, description, salary, prediction, error } = data;
  const isFake = prediction === 'Fake';
  
  // Design configuration based on outcome
  const theme = isFake 
    ? {
      gradient: 'from-rose-500 to-red-600',
      bgDrop: 'from-red-400',
      text: 'text-red-600',
      border: 'border-red-200/50',
      icon: '⚠️',
      ring: 'text-red-500',
      track: 'text-red-100',
      bg: 'bg-red-50/50'
    } : {
      gradient: 'from-emerald-500 to-teal-600',
      bgDrop: 'from-emerald-400',
      text: 'text-emerald-600',
      border: 'border-emerald-200/50',
      icon: '✓',
      ring: 'text-emerald-500',
      track: 'text-emerald-100',
      bg: 'bg-emerald-50/50'
    };

  return (
    <div className="min-h-screen relative pt-24 pb-12 px-4 sm:px-6 lg:px-8 selection:bg-brand-500 selection:text-white">
      
      {/* Background glow based on result */}
      <div className={`absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b ${theme.bgDrop} to-transparent opacity-10 blur-3xl rounded-full -z-10 animate-fade-in pointer-events-none`}></div>

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="text-center mb-12 animate-fade-up">
          <h1 className="text-4xl sm:text-5xl font-outfit font-bold text-slate-900 mb-4 tracking-tight">
            Analysis Complete
          </h1>
          <p className="text-lg text-slate-500">
            Review the AI verification results below
          </p>
        </div>

        {error ? (
          /* Error State */
          <div className="glass rounded-3xl p-10 sm:p-16 text-center animate-fade-in border-red-100 shadow-xl shadow-red-900/5">
            <div className="w-24 h-24 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h2 className="text-2xl font-outfit font-bold text-slate-900 mb-3">Analysis Failed</h2>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">{error}</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-slate-900 text-white font-medium rounded-xl hover:bg-brand-600 transition-colors shadow-lg hover:shadow-brand-500/30"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
              Return Home
            </Link>
          </div>
        ) : (
          <div className="animate-fade-up" style={{ animationDelay: "100ms" }}>
            
            {/* Main Result Card */}
            <div className={`glass rounded-3xl overflow-hidden mb-8 border ${theme.border} shadow-2xl`}>
              
              <div className={`h-2 w-full bg-gradient-to-r ${theme.gradient}`}></div>

              <div className="p-8 sm:p-12">
                
                <div className="grid md:grid-cols-2 gap-12 items-center mb-12">
                  
                  {/* Left: Result Details */}
                  <div className="text-center md:text-left">
                    <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 shadow-sm border ${theme.border} ${theme.bg}`}>
                      <span className={`text-4xl ${theme.text}`}>{theme.icon}</span>
                    </div>
                    
                    <div className="mb-6">
                      <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2 font-outfit">
                        Verdict
                      </p>
                      <h2 className={`text-5xl lg:text-6xl font-outfit font-bold ${theme.text} tracking-tight`}>
                        {prediction}
                      </h2>
                    </div>

                    <p className={`text-lg font-medium leading-relaxed ${isFake ? 'text-red-800/80' : 'text-slate-600'}`}>
                      {isFake
                        ? 'This job posting exhibits strong patterns of fraudulent activity. Proceed with extreme caution.'
                        : 'This looks good! The posting aligns with patterns of legitimate job offers.'}
                    </p>
                  </div>

                  {/* Right: Confidence Circle */}
                  <div className="flex justify-center md:justify-end">
                    <div className="relative w-56 h-56">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        {/* Background track */}
                        <circle 
                          className={theme.track}
                          strokeWidth="8"
                          stroke="currentColor"
                          fill="transparent"
                          r="40"
                          cx="50"
                          cy="50"
                        />
                        {/* Progress track */}
                        <circle 
                          className={`${theme.ring} drop-shadow-md transition-all duration-1000 ease-out`}
                          strokeWidth="8"
                          strokeDasharray={251.2}
                          strokeDashoffset={251.2 - (251.2 * animatedScore) / 100}
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="transparent"
                          r="40"
                          cx="50"
                          cy="50"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-5xl font-outfit font-bold ${theme.text}`}>
                          {Math.round(animatedScore)}<span className="text-3xl">%</span>
                        </span>
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">
                          Confidence
                        </span>
                      </div>
                    </div>
                  </div>

                </div>

                <div className="h-px w-full bg-slate-100 my-8"></div>

                {/* Job Details Provided */}
                <div>
                  <h3 className="text-lg font-outfit font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                    Analyzed Data
                  </h3>
                  
                  <div className="space-y-4">
                    {title && (
                      <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100">
                        <p className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Job Title</p>
                        <p className="text-slate-900 font-medium">{title}</p>
                      </div>
                    )}

                    {description && (
                      <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100">
                        <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Description</p>
                        <div className="max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                          <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                            {description}
                          </p>
                        </div>
                      </div>
                    )}

                    {salary && (
                      <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100">
                        <p className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Salary Included</p>
                        <p className="text-slate-900 font-medium">{salary}</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* Recommendation Alert */}
            <div className={`rounded-2xl p-6 sm:p-8 mb-10 border ${theme.border} ${theme.bg} shadow-sm flex gap-4 md:gap-6`}>
              <div className={`mt-1 hidden sm:block ${theme.text}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </div>
              <div className="flex-1">
                <h4 className={`text-lg font-bold font-outfit mb-3 ${theme.text}`}>
                  {isFake ? 'Red Flags Found' : 'Safe Practices'}
                </h4>
                
                {isFake ? (
                  <ul className="space-y-2 text-sm text-red-800/80">
                    <li className="flex gap-2"><span>•</span> Unrealistic salary or benefits promises</li>
                    <li className="flex gap-2"><span>•</span> Request for personal/financial info before hiring</li>
                    <li className="flex gap-2"><span>•</span> Poor grammar or spelling errors</li>
                    <li className="flex gap-2"><span>•</span> Vague job description</li>
                    <li className="flex gap-2"><span>•</span> No verifiable company information</li>
                  </ul>
                ) : (
                  <ul className="space-y-2 text-sm text-emerald-800/80">
                    <li className="flex gap-2"><span>✓</span> Still verify on the company's official website</li>
                    <li className="flex gap-2"><span>✓</span> Check employee reviews on Glassdoor</li>
                    <li className="flex gap-2"><span>✓</span> Research the company background</li>
                    <li className="flex gap-2"><span>✓</span> Verify contact information before responding</li>
                  </ul>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up" style={{ animationDelay: "200ms" }}>
              <Link
                to="/"
                className="px-8 py-3.5 bg-slate-900 text-white font-medium rounded-xl hover:bg-brand-600 transition-all duration-300 shadow-lg hover:shadow-brand-500/30 text-center hover:-translate-y-0.5"
              >
                Analyze Another Job
              </Link>
              
              <Link
                to="/history"
                className="px-8 py-3.5 bg-white text-slate-700 font-medium rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 transition-all duration-300 text-center shadow-sm"
              >
                View History Map
              </Link>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

export default Result;
