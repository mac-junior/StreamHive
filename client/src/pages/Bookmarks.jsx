import { useState, useEffect } from 'react';
import { Bookmark, Video } from 'lucide-react';
import api from '../services/api';
import HiveCard from '../components/HiveCard';

const Bookmarks = () => {
  const [bookmarkedHives, setBookmarkedHives] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookmarkedHives();
  }, []);

  const fetchBookmarkedHives = async () => {
    try {
      const response = await api.get('/hives');
      const hives = response.data.hives.filter(hive => 
        hive.bookmarks?.includes(localStorage.getItem('userId'))
      );
      setBookmarkedHives(hives);
    } catch (error) {
      console.error('Failed to fetch bookmarked hives:', error);
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
        <Bookmark className="w-6 h-6 text-honey-500" />
        <h1 className="text-2xl font-bold text-charcoal-900">Bookmarked Hives</h1>
      </div>

      {bookmarkedHives.length === 0 ? (
        <div className="text-center py-12">
          <Bookmark className="w-16 h-16 text-charcoal-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-charcoal-700">No bookmarked hives</h3>
          <p className="text-charcoal-500 mt-1">Bookmark hives to save them for later</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookmarkedHives.map((hive) => (
            <HiveCard key={hive._id} hive={hive} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Bookmarks;