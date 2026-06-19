import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Zap, Calendar, Video, BarChart3,
  User, LogOut, Menu, Plus, ChevronLeft, ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import Overview from '../pages/Overview';
import InstantHive from '../pages/InstantHive';
import ScheduledHives from '../pages/ScheduledHives';
import MyHives from '../pages/MyHives';
import Analytics from '../pages/Analytics';
import ProfileSettings from '../pages/ProfileSettings';

const BroadcasterDashboard = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const navigationItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Overview', component: Overview },
    { path: '/dashboard/instant-hive', icon: Zap, label: 'Instant Hive', component: InstantHive },
    { path: '/dashboard/scheduled', icon: Calendar, label: 'Scheduled', component: ScheduledHives },
    { path: '/dashboard/my-hives', icon: Video, label: 'My Hives', component: MyHives },
    { path: '/dashboard/analytics', icon: BarChart3, label: 'Analytics', component: Analytics },
    { path: '/dashboard/settings', icon: User, label: 'Settings', component: ProfileSettings },
  ];

  const currentPage = navigationItems.find(item => item.path === location.pathname) || navigationItems[0];
  const ActiveComponent = currentPage.component;

  return (
    <div className="min-h-screen bg-warm-50 flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 bg-charcoal-900 transform transition-all duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } ${sidebarCollapsed ? 'w-20' : 'w-64'}`}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-charcoal-700 flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center gap-3">
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
          </nav>

          <div className="p-4 border-t border-charcoal-700">
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-10 h-10 rounded-full bg-honey-500/20 border-2 border-honey-500 flex items-center justify-center overflow-hidden flex-shrink-0">
                {user?.avatar ? (
                  <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-honey-500 font-semibold">{user?.fullname?.charAt(0)}</span>
                )}
              </div>
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user?.fullname}</p>
                  <p className="text-xs text-soft-gray-400">Broadcaster</p>
                </div>
              )}
            </div>
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
      <div className={`flex-1 min-w-0 transition-all duration-300 ${
        sidebarOpen && !sidebarCollapsed ? 'lg:ml-64' : sidebarOpen ? 'lg:ml-20' : ''
      }`}>
        <header className="bg-white border-b border-soft-gray-200 sticky top-0 z-40">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-soft-gray-100"
              >
                <Menu className="w-6 h-6 text-charcoal-700" />
              </button>
              <h1 className="text-xl font-semibold text-charcoal-900">{currentPage.label}</h1>
            </div>
            <Link
              to="/dashboard/instant-hive"
              className="flex items-center gap-2 px-4 py-2 bg-honey-500 text-charcoal-900 rounded-lg font-medium hover:bg-honey-400 transition"
            >
              <Plus className="w-4 h-4" />
              Create Hive
            </Link>
          </div>
        </header>

        <main className="p-6">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ActiveComponent />
          </motion.div>
        </main>
      </div>

      {sidebarOpen && !sidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default BroadcasterDashboard;