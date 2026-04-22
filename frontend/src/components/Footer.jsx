import { Link } from "react-router-dom";
import { useAuth } from "../authContext";

function Footer() {
  const { currentUser } = useAuth();

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white font-bold text-xs">
                FJD
              </div>
              <span className="font-semibold text-gray-900">Fake Job Detector</span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed max-w-md">
              Detect suspicious job posts with AI-powered analysis before you apply.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3 text-sm">Quick Links</h4>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
              <Link to="/" className="hover:text-indigo-600 transition-colors">
                Home
              </Link>
              <Link to="/history" className="hover:text-indigo-600 transition-colors">
                History
              </Link>
              {!currentUser && (
                <>
                  <Link to="/login" className="hover:text-indigo-600 transition-colors">
                    Login
                  </Link>
                  <Link to="/register" className="hover:text-indigo-600 transition-colors">
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6 flex justify-center sm:justify-start">
          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} FakeJobDetector. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;