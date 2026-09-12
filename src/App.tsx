import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SearchPage from './components/SearchPage';
import VideoPlayer from './components/VideoPlayer';
import PlaylistsPage from './components/PlaylistsPage';
import Navbar from './components/Navbar';
import AuthProvider from './contexts/AuthContext';
import HomePage from './components/HomePage';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-900">
          <Navbar />
          <main className="pt-16"> {/* Account for fixed navbar */}
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/watch/:videoId" element={<VideoPlayer />} />
              <Route path="/playlists" element={<PlaylistsPage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
