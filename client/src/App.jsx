import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import ViewerDashboard from './layouts/ViewerDashboard';
import BroadcasterDashboard from './layouts/BroadcasterDashboard';
import LiveHive from './pages/LiveHive';
import HiveDetail from './pages/HiveDetail';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-honey-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-charcoal-600">Loading StreamHive...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-honey-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-charcoal-600">Loading StreamHive...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={!isAuthenticated ? <Login /> : <Navigate to="/home" />} 
      />
      <Route 
        path="/register" 
        element={!isAuthenticated ? <Register /> : <Navigate to="/home" />} 
      />
      
      {/* Viewer Routes */}
      <Route path="/home" element={<ProtectedRoute><ViewerDashboard /></ProtectedRoute>} />
      <Route path="/explore" element={<ProtectedRoute><ViewerDashboard /></ProtectedRoute>} />
      <Route path="/upcoming" element={<ProtectedRoute><ViewerDashboard /></ProtectedRoute>} />
      <Route path="/bookmarks" element={<ProtectedRoute><ViewerDashboard /></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute><ViewerDashboard /></ProtectedRoute>} />
      
      {/* Notifications */}
      <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
      
      {/* Profile */}
      <Route path="/profile/:userId" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      
      {/* Broadcaster Routes */}
      <Route path="/dashboard" element={<ProtectedRoute><BroadcasterDashboard /></ProtectedRoute>} />
      <Route path="/dashboard/instant-hive" element={<ProtectedRoute><BroadcasterDashboard /></ProtectedRoute>} />
      <Route path="/dashboard/scheduled" element={<ProtectedRoute><BroadcasterDashboard /></ProtectedRoute>} />
      <Route path="/dashboard/my-hives" element={<ProtectedRoute><BroadcasterDashboard /></ProtectedRoute>} />
      <Route path="/dashboard/analytics" element={<ProtectedRoute><BroadcasterDashboard /></ProtectedRoute>} />
      <Route path="/dashboard/settings" element={<ProtectedRoute><BroadcasterDashboard /></ProtectedRoute>} />
      
      {/* Live Hive & Details */}
      <Route path="/hive/:hiveId" element={<ProtectedRoute><LiveHive /></ProtectedRoute>} />
      <Route path="/hive/:hiveId/detail" element={<ProtectedRoute><HiveDetail /></ProtectedRoute>} />
      
      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/home" />} />
      <Route path="*" element={<Navigate to="/home" />} />
    </Routes>
  );
}

export default App;