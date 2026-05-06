import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { predictJob } from "../services/api";
import { useAuth } from "../authContext";

export default function Home() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    salary: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.title.trim() || !formData.description.trim()) {
      setError("Job title and description are required");
      return;
    }

    if (formData.description.length < 50) {
      setError("Description must be at least 50 characters to analyze accurately.");
      return;
    }

    setIsLoading(true);

    try {
      const userId = currentUser?.uid || null;

      const result = await predictJob(
        formData.title,
        formData.description,
        formData.salary,
        userId
      );

      const recordTitle = result.title || formData.title;
      const recordDescription = result.description || formData.description;

      const historyKey = userId ? `history_${userId}` : "history_guest";
      const existing = JSON.parse(localStorage.getItem(historyKey) || "[]");

      const record = {
        _id: Date.now().toString(),
        user_id: userId,
        title: recordTitle,
        description: recordDescription,
        salary: formData.salary,
        prediction: result.prediction,
        confidence: result.confidence,
        timestamp: new Date().toISOString(),
      };

      existing.unshift(record);
      localStorage.setItem(historyKey, JSON.stringify(existing));

      // Small delay for smooth animation before navigate
      setTimeout(() => navigate("/result", { state: result }), 500);
      
    } catch (err) {
      const message = err?.response?.data?.error || err?.message || "Failed to analyze job posting";
      setError(message);
      console.error(err);
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen pt-24 overflow-hidden selection:bg-brand-500 selection:text-white">
      
      {/* Dynamic Background Blobs */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-brand-300 opacity-20 blur-3xl animate-blob"></div>
      <div className="absolute top-40 left-0 -ml-20 w-72 h-72 rounded-full bg-indigo-300 opacity-20 blur-3xl animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/2 -mb-20 w-80 h-80 rounded-full bg-purple-300 opacity-20 blur-3xl animate-blob animation-delay-4000"></div>

      <div className="relative max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 lg:gap-8 items-center py-12 lg:py-20">
        
        {/* Left Hero Content */}
        <div className="max-w-xl animate-fade-in z-10">
          <h1 className="text-5xl lg:text-7xl font-outfit font-bold text-slate-900 leading-[1.1] mb-6 animate-fade-up" style={{ animationDelay: "100ms" }}>
            Identify <span className="text-gradient">Fake Jobs</span> instantly.
          </h1>
          <p className="text-lg text-slate-500 leading-relaxed mb-8 animate-fade-up max-w-md" style={{ animationDelay: "200ms" }}>
            Protect your career from scams. Paste the job details below and our advanced machine learning model will instantly calculate its authenticity.
          </p>
        </div>

        {/* Right Form Card */}
        <div id="analysis-form" className="relative w-full max-w-lg lg:ml-auto animate-fade-up z-10" style={{ animationDelay: "400ms" }}>
          
          <div className="absolute -inset-1 bg-gradient-to-br from-brand-400 to-indigo-500 rounded-2xl blur opacity-20"></div>
          
          <div className="relative glass shadow-2xl rounded-2xl p-8 border border-white/60">
            <h2 className="text-2xl font-outfit font-bold text-slate-900 mb-2">
              Analyze Job Posting
            </h2>
            <p className="text-slate-500 text-sm mb-6">
              Enter the details to verify the listing.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {error && (
                <div className="p-4 bg-red-50/80 backdrop-blur-sm border border-red-100 rounded-xl animate-fade-in">
                  <div className="flex gap-3 items-center">
                    <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 pl-1">Job Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Senior Software Engineer"
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all duration-300"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 pl-1">Job Description *</label>
                <div className="relative">
                  <textarea
                    name="description"
                    rows="6"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Paste the full job description here..."
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all duration-300 resize-none"
                  />
                  <div className={`absolute bottom-3 right-3 text-xs font-medium px-2 py-1 rounded-md ${formData.description.length > 50 ? 'bg-slate-100 text-slate-500' : 'bg-red-50 text-red-400'}`}>
                    {formData.description.length} / 50 min
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 pl-1">Salary (Optional)</label>
                <input
                  type="text"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  placeholder="e.g. $80,000 - $120,000"
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all duration-300"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="relative w-full overflow-hidden group bg-slate-900 text-white rounded-xl font-medium py-3.5 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed mt-2"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-brand-600 via-brand-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {isLoading ? (
                  <div className="relative flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Analyzing Request...</span>
                  </div>
                ) : (
                  <span className="relative flex items-center justify-center gap-2">
                    Analyze Job Posting
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                  </span>
                )}
              </button>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}