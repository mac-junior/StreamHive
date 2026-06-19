import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Hexagon, Home, Compass, Calendar, Bookmark, Clock, Bell,
  User, LogOut, Menu, Search, Users, Play, ChevronLeft, ChevronRight
} from 'lucide-react';
import api from '../services/api';
import HiveCard from '../components/HiveCard';

const ViewerDashboard = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [hives, setHives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const categories = [
    'gaming', 'music', 'education', 'technology', 
    'art', 'lifestyle', 'sports', 'entertainment'
  ];

  useEffect(() => {
    fetchHives();
    fetchUnreadCount();
  }, [activeCategory]);

  const fetchHives = async () => {
    try {
      const params = { status: 'live' };
      if (activeCategory !== 'all') {
        params.category = activeCategory;
      }
      const response = await api.get('/hives', { params });
      setHives(response.data.hives);
    } catch (error) {
      console.error('Failed to fetch hives:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/notifications');
      setUnreadNotifications(response.data.unreadCount);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const navigationItems = [
    { path: '/home', icon: Home, label: 'Home' },
    { path: '/explore', icon: Compass, label: 'Explore Hives' },
    { path: '/upcoming', icon: Calendar, label: 'Upcoming' },
    { path: '/bookmarks', icon: Bookmark, label: 'Bookmarked' },
    { path: '/history', icon: Clock, label: 'Hive History' },
  ];

  return (
    <div className="min-h-screen bg-warm-50 flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 bg-charcoal-900 transform transition-all duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } ${sidebarCollapsed ? 'w-20' : 'w-64'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-charcoal-700 flex items-center justify-between">
            <Link to="/home" className="flex items-center gap-3">
              <img src="/logo.svg" alt="StreamHive" className="w-8 h-8" />
              {!sidebarCollapsed && (
                <span className="text-xl font-bold text-white">StreamHive</span>
              )}
            </Link>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 rounded-lg hover:bg-charcoal-700 text-soft-gray-400 hidden lg:block"
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    isActive
                      ? 'bg-honey-500/10 text-honey-500'
                      : 'text-soft-gray-300 hover:bg-charcoal-800 hover:text-white'
                  }`}
                  title={sidebarCollapsed ? item.label : ''}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
                </Link>
              );
            })}

            <div className="pt-4 mt-4 border-t border-charcoal-700">
              <Link
                to="/notifications"
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  location.pathname === '/notifications'
                    ? 'bg-honey-500/10 text-honey-500'
                    : 'text-soft-gray-300 hover:bg-charcoal-800 hover:text-white'
                }`}
                title={sidebarCollapsed ? 'Notifications' : ''}
              >
                <div className="relative">
                  <Bell className="w-5 h-5" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-honey-500 text-charcoal-900 text-xs rounded-full flex items-center justify-center font-bold">
                      {unreadNotifications}
                    </span>
                  )}
                </div>
                {!sidebarCollapsed && <span className="font-medium">Notifications</span>}
              </Link>
            </div>
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-charcoal-700">
            <Link
              to={`/profile/${user?.id}`}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-charcoal-800 transition"
              title={sidebarCollapsed ? user?.fullname : ''}
            >
              <div className="w-10 h-10 rounded-full bg-honey-500/20 border-2 border-honey-500 flex items-center justify-center overflow-hidden flex-shrink-0">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.fullname} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-honey-500 font-semibold text-lg">
                    {user?.fullname?.charAt(0)}
                  </span>
                )}
              </div>
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user?.fullname}</p>
                  <p className="text-xs text-soft-gray-400 truncate">@{user?.username}</p>
                </div>
              )}
            </Link>
            <button
              onClick={logout}
              className="flex items-center gap-3 px-4 py-3 mt-2 w-full rounded-lg text-soft-gray-300 hover:bg-charcoal-800 hover:text-red-500 transition"
              title={sidebarCollapsed ? 'Logout' : ''}
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="font-medium">Logout</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
        sidebarOpen && !sidebarCollapsed ? 'lg:ml-64' : sidebarOpen ? 'lg:ml-20' : ''
      }`}>
        {/* Top Bar */}
        <header className="bg-white border-b border-soft-gray-200 sticky top-0 z-40">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-soft-gray-100"
              >
                <Menu className="w-6 h-6 text-charcoal-700" />
              </button>
              {!sidebarOpen && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="hidden lg:block p-2 rounded-lg hover:bg-soft-gray-100"
                >
                  <Menu className="w-6 h-6 text-charcoal-700" />
                </button>
              )}
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-charcoal-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search hives, creators..."
                  className="w-full pl-10 pr-4 py-2.5 bg-soft-gray-50 border border-soft-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-honey-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/dashboard"
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-honey-500 text-charcoal-900 rounded-lg font-medium hover:bg-honey-400 transition"
              >
                <Play className="w-4 h-4" />
                Go Live
              </Link>
            </div>
          </div>

          {/* Categories */}
          <div className="px-6 pb-3 flex gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                activeCategory === 'all'
                  ? 'bg-charcoal-900 text-white'
                  : 'bg-soft-gray-100 text-charcoal-600 hover:bg-soft-gray-200'
              }`}
            >
              All Hives
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap capitalize transition ${
                  activeCategory === category
                    ? 'bg-charcoal-900 text-white'
                    : 'bg-soft-gray-100 text-charcoal-600 hover:bg-soft-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-12 h-12 border-4 border-honey-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : hives.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {hives.map((hive) => (
                <HiveCard key={hive._id} hive={hive} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-charcoal-500">
              <Users className="w-16 h-16 mb-4 text-charcoal-300" />
              <p className="text-lg font-medium">No live hives right now</p>
              <p className="text-sm">Check back later or explore upcoming streams</p>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && !sidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default ViewerDashboard;