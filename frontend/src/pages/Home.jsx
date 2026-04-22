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

    // Validate text input
    if (!formData.title.trim() || !formData.description.trim()) {
      setError("Job title and description are required");
      return;
    }

    if (formData.description.length < 50) {
      setError("Description must be at least 50 characters");
      return;
    }

    setIsLoading(true);

    try {
      const userId = currentUser?.uid || null;

      // Call text-based prediction
      const result = await predictJob(
        formData.title,
        formData.description,
        formData.salary,
        userId
      );

      const recordTitle = result.title || formData.title;
      const recordDescription = result.description || formData.description;

      // Backup history in localStorage
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

      navigate("/result", { state: result });
    } catch (err) {
      const message =
        err?.response?.data?.error ||
        err?.message ||
        "Failed to analyze job posting";
      setError(message);
      console.error(err);
    }

    setIsLoading(false);
  };

  return (
    <div className="bg-white">

      {/* Hero Section */}
      <section className="py-20 text-center px-4">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Detect Fake Job Postings with
          <span className="block text-indigo-600">AI Intelligence</span>
        </h1>

        <p className="text-gray-600 max-w-2xl mx-auto text-lg mb-10">
          Protect yourself from scams and fraudulent job offers using our AI
          powered fake job detection system.
        </p>

        <button
          onClick={() =>
            document
              .getElementById("analysis-form")
              ?.scrollIntoView({ behavior: "smooth" })
          }
          className="px-8 py-4 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
        >
          Analyze Job Posting
        </button>
      </section>

      {/* Analysis Form */}
      <section id="analysis-form" className="py-16 px-4">
        <div className="max-w-2xl mx-auto bg-white border rounded-xl p-8 shadow">

          <h2 className="text-3xl font-bold text-center mb-2">
            Analyze a Job Posting
          </h2>

          <p className="text-center text-gray-500 mb-8">
            Enter the job details and our AI will analyze it instantly
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">

            {error && (
              <div className="bg-red-50 border border-red-200 p-4 rounded">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {/* Title */}
            <div>
              <label className="font-semibold block mb-2">
                Job Title *
              </label>

              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Senior Software Engineer"
                className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-600"
              />
            </div>

            {/* Description */}
            <div>
              <label className="font-semibold block mb-2">
                Job Description *
              </label>

              <textarea
                name="description"
                rows="7"
                value={formData.description}
                onChange={handleChange}
                placeholder="Paste the job description..."
                className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-600"
              />

              <p className="text-xs text-gray-500 mt-1">
                {formData.description.length} characters
              </p>
            </div>

            {/* Salary */}
            <div>
              <label className="font-semibold block mb-2">
                Salary (optional)
              </label>

              <input
                type="text"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                placeholder="$80,000 - $120,000"
                className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-600"
              />
            </div>



            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-70"
            >
              {isLoading ? "Analyzing..." : "Analyze Job Posting"}
            </button>

          </form>
        </div>
      </section>

    </div>
  );
}