import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Play,
  Calendar,
  CheckCircle,
  Clock,
  MoreVertical,
  Trash2
} from 'lucide-react';
import api from '../services/api';
import { format } from 'date-fns';

const MyHives = () => {
  const [hives, setHives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const [openMenuId, setOpenMenuId] = useState(null);

  // modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedHiveId, setSelectedHiveId] = useState(null);

  useEffect(() => {
    fetchMyHives();
  }, []);

  const fetchMyHives = async () => {
    try {
      const response = await api.get('/hives');
      setHives(response.data.hives);
    } catch (error) {
      console.error('Failed to fetch hives:', error);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (id) => {
    setSelectedHiveId(id);
    setDeleteModalOpen(true);
    setOpenMenuId(null);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/hives/${selectedHiveId}`);

      setHives(prev =>
        prev.filter(hive => hive._id !== selectedHiveId)
      );

      setDeleteModalOpen(false);
      setSelectedHiveId(null);
    } catch (error) {
      console.error('Failed to delete hive:', error);
      alert('Failed to delete hive');
    }
  };

  const filteredHives = hives.filter(hive => {
    if (filter === 'all') return true;
    return hive.status === filter;
  });

  const getStatusBadge = (status) => {
    const styles = {
      live: 'bg-red-500/10 text-red-600',
      scheduled: 'bg-honey-500/10 text-honey-600',
      ended: 'bg-soft-gray-200 text-charcoal-500'
    };

    const icons = {
      live: Play,
      scheduled: Clock,
      ended: CheckCircle
    };

    const Icon = icons[status];

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        <Icon className="w-3.5 h-3.5" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
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
      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {['all', 'live', 'scheduled', 'ended'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${
              filter === f
                ? 'bg-charcoal-900 text-white'
                : 'bg-white text-charcoal-600 border border-soft-gray-200 hover:bg-soft-gray-50'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {filteredHives.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-charcoal-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-charcoal-700">
            No hives found
          </h3>
          <p className="text-charcoal-500 mt-1">
            Create your first hive to get started
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-soft-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-soft-gray-50 border-b border-soft-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-charcoal-700">Hive</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-charcoal-700">Category</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-charcoal-700">Status</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-charcoal-700">Viewers</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-charcoal-700">Date</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-charcoal-700">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-soft-gray-100">
              {filteredHives.map((hive) => (
                <tr key={hive._id} className="hover:bg-soft-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center flex-shrink-0">
                        {hive.thumbnail ? (
                          <img
                            src={hive.thumbnail}
                            alt=""
                            className="w-full h-full rounded-lg object-cover"
                          />
                        ) : (
                          <Play className="w-5 h-5 text-charcoal-400" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="font-medium text-charcoal-900 truncate">
                          {hive.title}
                        </p>
                        <p className="text-xs text-charcoal-500 truncate">
                          {hive.hiveType}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className="text-sm text-charcoal-600 capitalize">
                      {hive.category}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    {getStatusBadge(hive.status)}
                  </td>

                  <td className="px-6 py-4">
                    <span className="text-sm text-charcoal-600">
                      {hive.viewerCount}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span className="text-sm text-charcoal-500">
                      {format(new Date(hive.createdAt), 'MMM d, yyyy')}
                    </span>
                  </td>

                  <td className="px-6 py-4 relative">
                    <div className="flex items-center gap-2">
                      {hive.status === 'scheduled' && (
                        <Link
                          to={`/hive/${hive._id}`}
                          className="px-3 py-1.5 bg-honey-500 text-charcoal-900 text-xs font-medium rounded-lg hover:bg-honey-400 transition"
                        >
                          Start
                        </Link>
                      )}

                      {hive.status === 'live' && (
                        <Link
                          to={`/hive/${hive._id}`}
                          className="px-3 py-1.5 bg-red-500 text-white text-xs font-medium rounded-lg hover:bg-red-600 transition"
                        >
                          Manage
                        </Link>
                      )}

                      <button
                        onClick={() =>
                          setOpenMenuId(openMenuId === hive._id ? null : hive._id)
                        }
                        className="p-1.5 rounded-lg hover:bg-soft-gray-200 text-charcoal-400 transition"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>

                    {openMenuId === hive._id && (
                      <div className="absolute right-6 mt-2 w-32 bg-white border border-soft-gray-200 rounded-lg shadow-lg z-10">
                        <button
                          onClick={() => openDeleteModal(hive._id)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ✅ DELETE MODAL */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl p-6">
            <h2 className="text-lg font-semibold text-charcoal-900">
              Delete Hive
            </h2>

            <p className="text-sm text-charcoal-600 mt-2">
              Are you sure you want to delete this hive? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 text-sm rounded-lg border border-soft-gray-300 hover:bg-soft-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyHives;