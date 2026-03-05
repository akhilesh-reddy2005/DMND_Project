import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './authContext'
import Home from './pages/Home'
import Result from './pages/Result'
import History from './pages/History'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="flex flex-col min-h-screen bg-white">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/result" element={<Result />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route 
                path="/history" 
                element={
                  <ProtectedRoute>
                    <History />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App
