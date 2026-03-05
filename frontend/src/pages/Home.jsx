import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { predictJob, predictJobFromImage } from "../services/api";
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
  const [selectedFile, setSelectedFile] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate: if no file, require text input
    if (!selectedFile) {
      if (!formData.title.trim() || !formData.description.trim()) {
        setError("Job title and description are required if no file is uploaded");
        return;
      }

      if (formData.description.length < 50) {
        setError("Description must be at least 50 characters");
        return;
      }
    }

    setIsLoading(true);

    try {
      const userId = currentUser?.uid || null;

      // Call Vision OCR if file is uploaded, otherwise use text input
      const result = selectedFile
        ? await predictJobFromImage(selectedFile, formData.salary, userId)
        : await predictJob(
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
      setError("Failed to analyze job posting");
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

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">OR</span>
              </div>
            </div>

            {/* File Upload */}
            <div>
              <label className="font-semibold block mb-2">
                Upload Job Posting (Image, PDF, or Word Doc)
              </label>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 transition">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*,.pdf,.doc,.docx"
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <svg
                    className="w-12 h-12 text-gray-400 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <span className="text-indigo-600 font-medium">
                    Click to upload
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    {selectedFile
                      ? selectedFile.name
                      : "PNG, JPG, PDF, or Word (max 10MB)"}
                  </span>
                </label>
              </div>

              {selectedFile && (
                <div className="mt-2 flex items-center justify-between bg-indigo-50 p-3 rounded">
                  <span className="text-sm text-indigo-700">
                    {selectedFile.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              )}
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