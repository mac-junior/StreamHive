import { useState, useEffect } from 'react';
import { Clock, Play, Calendar } from 'lucide-react';
import api from '../services/api';
import { format } from 'date-fns';

const HiveHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('attended');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await api.get('/hives');
      setHistory(response.data.hives.filter(h => h.status === 'ended'));
    } catch (error) {
      console.error('Failed to fetch history:', error);
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
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Clock className="w-6 h-6 text-honey-500" />
        <h1 className="text-2xl font-bold text-charcoal-900">Hive History</h1>
      </div>

      <div className="flex gap-2 mb-6">
        {[
          { id: 'attended', label: 'Attended' },
          { id: 'created', label: 'Created' },
          { id: 'scheduled', label: 'Scheduled' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              tab === t.id
                ? 'bg-charcoal-900 text-white'
                : 'bg-white text-charcoal-600 border border-soft-gray-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {history.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-charcoal-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-charcoal-700">No hive history</h3>
          <p className="text-charcoal-500 mt-1">Hives you've attended will appear here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {history.map((hive) => (
            <div key={hive._id} className="bg-white rounded-xl border border-soft-gray-200 p-4">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-medium text-charcoal-900 truncate">{hive.title}</h3>
                <span className="text-xs text-charcoal-500">
                  {format(new Date(hive.endedAt || hive.createdAt), 'MMM d')}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-charcoal-500">
                <Play className="w-4 h-4" />
                <span>{hive.viewerCount} viewers</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HiveHistory;