import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Calendar, Play, Bookmark, Share2 } from 'lucide-react';
import api from '../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const HiveDetail = () => {
  const { hiveId } = useParams();
  const navigate = useNavigate();
  const [hive, setHive] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHive();
  }, [hiveId]);

  const fetchHive = async () => {
    try {
      const response = await api.get(`/hives/${hiveId}`);
      setHive(response.data.hive);
    } catch (error) {
      toast.error('Failed to load hive details');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-warm-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-honey-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!hive) return null;

  return (
    <div className="min-h-screen bg-warm-50 p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-charcoal-600 hover:text-charcoal-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <div className="bg-white rounded-xl border border-soft-gray-200 overflow-hidden">
          <div className="aspect-video bg-charcoal-800 relative">
            {hive.thumbnail ? (
              <img src={hive.thumbnail} alt={hive.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Play className="w-16 h-16 text-honey-500/30" />
              </div>
            )}
          </div>

          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-charcoal-900">{hive.title}</h1>
                <p className="text-charcoal-600 mt-2">{hive.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <span className="px-3 py-1 bg-soft-gray-100 text-charcoal-700 text-sm rounded-lg capitalize">
                {hive.category}
              </span>
              <span className="px-3 py-1 bg-honey-500/10 text-honey-600 text-sm rounded-lg capitalize">
                {hive.hiveType} hive
              </span>
              <span className="flex items-center gap-1 text-sm text-charcoal-500">
                <Users className="w-4 h-4" />
                {hive.viewerCount} viewers
              </span>
            </div>

            {hive.hiveType === 'scheduled' && hive.scheduledAt && (
              <div className="flex items-center gap-2 text-sm text-honey-600 mb-6">
                <Calendar className="w-4 h-4" />
                Scheduled for {format(new Date(hive.scheduledAt), 'MMMM d, yyyy \'at\' h:mm a')}
              </div>
            )}

            <div className="flex items-center gap-3">
              {hive.status === 'live' ? (
                <Link
                  to={`/hive/${hive._id}`}
                  className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition"
                >
                  <Play className="w-5 h-5" />
                  Join Now
                </Link>
              ) : hive.status === 'scheduled' ? (
                <button className="flex items-center gap-2 px-6 py-3 bg-honey-500 text-charcoal-900 rounded-lg font-medium hover:bg-honey-400 transition">
                  <Calendar className="w-5 h-5" />
                  Set Reminder
                </button>
              ) : (
                <span className="px-4 py-2 bg-soft-gray-100 text-charcoal-500 rounded-lg">
                  Stream ended
                </span>
              )}
              <button className="p-3 rounded-lg border border-soft-gray-200 hover:bg-soft-gray-50 transition">
                <Bookmark className="w-5 h-5 text-charcoal-600" />
              </button>
              <button className="p-3 rounded-lg border border-soft-gray-200 hover:bg-soft-gray-50 transition">
                <Share2 className="w-5 h-5 text-charcoal-600" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HiveDetail;