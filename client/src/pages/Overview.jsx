import { useState, useEffect } from 'react';
import { Users, Video, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import api from '../services/api';

const Overview = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/hives/analytics');
      setAnalytics(response.data.analytics);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
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

  if (!analytics) {
    return <div className="text-center text-charcoal-500">No analytics available</div>;
  }

  const statCards = [
    { icon: Video, label: 'Total Hives', value: analytics.totalHives, color: 'text-blue-600', bg: 'bg-blue-500/10' },
    { icon: Users, label: 'Followers', value: analytics.followers, color: 'text-green-600', bg: 'bg-green-500/10' },
    { icon: Users, label: 'Total Viewers', value: analytics.totalViewers, color: 'text-purple-600', bg: 'bg-purple-500/10' },
    { icon: TrendingUp, label: 'Engagement Rate', value: `${analytics.engagementRate}%`, color: 'text-honey-600', bg: 'bg-honey-500/10' }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl border border-soft-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.bg} p-3 rounded-lg`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-charcoal-900">{stat.value}</p>
              <p className="text-sm text-charcoal-500 mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-soft-gray-200 p-6">
          <h3 className="text-lg font-semibold text-charcoal-900 mb-4">Viewer Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E8" />
              <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
              <YAxis stroke="#6B7280" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#1A1A23', border: '1px solid #353540', borderRadius: '8px', color: '#E5E5E5' }} />
              <Line type="monotone" dataKey="viewers" stroke="#F5A623" strokeWidth={2} dot={{ fill: '#F5A623', strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-soft-gray-200 p-6">
          <h3 className="text-lg font-semibold text-charcoal-900 mb-4">Hive Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E8" />
              <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
              <YAxis stroke="#6B7280" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#1A1A23', border: '1px solid #353540', borderRadius: '8px', color: '#E5E5E5' }} />
              <Bar dataKey="hives" fill="#F5A623" radius={[4, 4, 0, 0]} />
              <Bar dataKey="viewers" fill="#353540" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Overview;