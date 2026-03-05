function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Column */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white font-bold text-xs">
                FJD
              </div>
              <span className="font-semibold text-gray-900">
                Fake Job Detector
              </span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Protect yourself from fraudulent job postings using advanced AI and machine learning technology.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4 text-sm">Quick Links</h4>
            <ul className="space-y-3 text-sm text-gray-600">
              <li>
                <a href="/" className="hover:text-indigo-600 transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="/history" className="hover:text-indigo-600 transition-colors">
                  History
                </a>
              </li>
              <li>
                <a href="/" className="hover:text-indigo-600 transition-colors">
                  About
                </a>
              </li>
            </ul>
          </div>

          {/* Technologies */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4 text-sm">Tech Stack</h4>
            <ul className="space-y-3 text-sm text-gray-600">
              <li>React + Vite</li>
              <li>Flask API</li>
              <li>Machine Learning</li>
              <li>TailwindCSS</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4 text-sm">Connect</h4>
            <ul className="space-y-3 text-sm text-gray-600">
              <li>
                <a href="#" className="hover:text-indigo-600 transition-colors">
                  GitHub
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-indigo-600 transition-colors">
                  Twitter
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-indigo-600 transition-colors">
                  Email
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} FakeJobDetector. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-gray-600">
            <a href="#" className="hover:text-indigo-600 transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-indigo-600 transition-colors">
              Terms
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}

export default Footer;