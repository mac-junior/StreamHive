import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import api from '../services/api';
import HiveCard from '../components/HiveCard';

const ExploreHives = () => {
  const [hives, setHives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  useEffect(() => {
    fetchHives();
  }, [category]);

  const fetchHives = async () => {
    try {
      const params = {};
      if (category !== 'all') params.category = category;
      if (search) params.search = search;
      const response = await api.get('/hives', { params });
      setHives(response.data.hives);
    } catch (error) {
      console.error('Failed to fetch hives:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-charcoal-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && fetchHives()}
            placeholder="Search hives..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-soft-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-honey-500"
          />
        </div>
        <button
          onClick={fetchHives}
          className="px-4 py-2.5 bg-honey-500 text-charcoal-900 rounded-lg font-medium hover:bg-honey-400"
        >
          Search
        </button>
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
        <div className="text-center py-12 text-charcoal-500">No hives found</div>
      )}
    </div>
  );
};

export default ExploreHives;