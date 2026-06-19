import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import api from '../services/api';
import HiveCard from '../components/HiveCard';

const UpcomingHives = () => {
  const [hives, setHives] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUpcomingHives();
  }, []);

  const fetchUpcomingHives = async () => {
    try {
      const response = await api.get('/hives', { params: { status: 'scheduled' } });
      setHives(response.data.hives);
    } catch (error) {
      console.error('Failed to fetch upcoming hives:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Calendar className="w-6 h-6 text-honey-500" />
        <h1 className="text-2xl font-bold text-charcoal-900">Upcoming Hives</h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-12 h-12 border-4 border-honey-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : hives.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {hives.map((hive) => (
            <HiveCard key={hive._id} hive={hive} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-charcoal-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-charcoal-700">No upcoming hives</h3>
          <p className="text-charcoal-500 mt-1">Check back later for scheduled streams</p>
        </div>
      )}
    </div>
  );
};

export default UpcomingHives;