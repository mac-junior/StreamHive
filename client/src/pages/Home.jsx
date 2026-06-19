import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Users, Zap, ArrowRight, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';
import HiveCard from '../components/HiveCard';

const Home = () => {
  const [liveHives, setLiveHives] = useState([]);
  const [upcomingHives, setUpcomingHives] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHives();
  }, []);

  const fetchHives = async () => {
    try {
      const [liveRes, upcomingRes] = await Promise.all([
        api.get('/hives', { params: { status: 'live' } }),
        api.get('/hives', { params: { status: 'scheduled' } })
      ]);
      setLiveHives(liveRes.data.hives);
      setUpcomingHives(upcomingRes.data.hives);
    } catch (error) {
      console.error('Failed to fetch hives:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-honey-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl overflow-hidden bg-charcoal-900 h-[400px] flex items-center justify-center"
      >
        {/* Dark Blurry Background */}
        <div className="absolute inset-0">
          <img
            src="/hero-bg.jpg"
            alt=""
            className="w-full h-full object-cover opacity-40 blur-sm"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-charcoal-900/90 to-charcoal-900/70"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-6"
          >
            <img
              src="/logo.svg"
              alt="StreamHive"
              className="w-24 h-24 mx-auto"
            />
          </motion.div>
          
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-5xl md:text-7xl font-extrabold text-white mb-4"
          >
            Where every stream sparks
            <span className="block text-honey-500">a conversation.</span>
          </motion.h1>
          
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="text-lg md:text-xl text-soft-gray-300 mb-8 max-w-2xl mx-auto"
          >
            Join a community of creators and viewers. Stream, chat, and build meaningful connections in real-time.
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="flex flex-wrap gap-4 justify-center"
          >
            <Link
              to="/explore"
              className="px-8 py-4 bg-honey-500 text-charcoal-900 rounded-xl font-bold text-lg hover:bg-honey-400 transition inline-flex items-center gap-2"
            >
              <Play className="w-5 h-5" />
              Explore Live Hives
            </Link>
            <Link
              to="/dashboard"
              className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-bold text-lg hover:bg-white/20 transition inline-flex items-center gap-2 border border-white/20"
            >
              <Zap className="w-5 h-5" />
              Start Streaming
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Live Hives Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-charcoal-900 flex items-center gap-3">
            <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
            Live Now
          </h2>
          <Link to="/explore" className="text-honey-600 hover:text-honey-500 font-medium flex items-center gap-1">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {liveHives.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {liveHives.slice(0, 8).map((hive) => (
              <HiveCard key={hive._id} hive={hive} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-soft-gray-200">
            <Users className="w-12 h-12 text-charcoal-300 mx-auto mb-3" />
            <p className="text-charcoal-500">No live hives right now</p>
          </div>
        )}
      </section>

      {/* Upcoming Hives Section */}
      {upcomingHives.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-charcoal-900">Upcoming Hives</h2>
            <Link to="/upcoming" className="text-honey-600 hover:text-honey-500 font-medium flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {upcomingHives.slice(0, 4).map((hive) => (
              <HiveCard key={hive._id} hive={hive} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;