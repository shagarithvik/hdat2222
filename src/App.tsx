import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import Login from './components/Login';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import VideoPlayer from './components/VideoPlayer';
import DocumentLearning from './components/DocumentLearning';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const handleLogin = (licenseKey: string) => {
    if (licenseKey.length > 0) {
      setIsAuthenticated(true);
    }
  };

  return (
    <Router>
      <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
        {!isAuthenticated ? (
          <Login onLogin={handleLogin} darkMode={darkMode} />
        ) : (
          <>
            <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
            <Routes>
              <Route path="/" element={<Dashboard darkMode={darkMode} />} />
              <Route path="/video-player" element={<VideoPlayer url="" darkMode={darkMode} />} />
              <Route path="/document-learning" element={<DocumentLearning />} />
            </Routes>
          </>
        )}
      </div>
    </Router>
  );
}

export default App;