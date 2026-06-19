import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { TrendingUp, Users, Video, Activity } from 'lucide-react';
import api from '../services/api';

const COLORS = ['#F5A623', '#353540', '#D1D1D6', '#E89518'];

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('6m');

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
    return <div className="text-center text-charcoal-500 py-12">No analytics data available</div>;
  }

  const categoryData = [
    { name: 'Gaming', value: 35 },
    { name: 'Music', value: 25 },
    { name: 'Education', value: 20 },
    { name: 'Technology', value: 20 },
  ];

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-charcoal-900">Performance Analytics</h2>
        <div className="flex gap-2">
          {['7d', '30d', '3m', '6m', '1y'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                timeRange === range
                  ? 'bg-charcoal-900 text-white'
                  : 'bg-white text-charcoal-600 border border-soft-gray-200'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Video, label: 'Total Hives', value: analytics.totalHives },
          { icon: Users, label: 'Total Viewers', value: analytics.totalViewers },
          { icon: Users, label: 'Followers', value: analytics.followers },
          { icon: TrendingUp, label: 'Engagement Rate', value: `${analytics.engagementRate}%` },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white rounded-xl border border-soft-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-honey-500/10 rounded-lg">
                  <Icon className="w-6 h-6 text-honey-500" />
                </div>
              </div>
              <p className="text-2xl font-bold text-charcoal-900">{stat.value}</p>
              <p className="text-sm text-charcoal-500 mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Viewer Growth */}
        <div className="bg-white rounded-xl border border-soft-gray-200 p-6">
          <h3 className="text-lg font-semibold text-charcoal-900 mb-6">Viewer Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analytics.monthlyData}>
              <defs>
                <linearGradient id="colorViewers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F5A623" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#F5A623" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E8" />
              <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
              <YAxis stroke="#6B7280" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1A1A23',
                  border: '1px solid #353540',
                  borderRadius: '8px',
                  color: '#E5E5E5'
                }}
              />
              <Area
                type="monotone"
                dataKey="viewers"
                stroke="#F5A623"
                fill="url(#colorViewers)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Hive Performance */}
        <div className="bg-white rounded-xl border border-soft-gray-200 p-6">
          <h3 className="text-lg font-semibold text-charcoal-900 mb-6">Hive Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E8" />
              <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
              <YAxis stroke="#6B7280" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1A1A23',
                  border: '1px solid #353540',
                  borderRadius: '8px',
                  color: '#E5E5E5'
                }}
              />
              <Bar dataKey="hives" fill="#F5A623" radius={[4, 4, 0, 0]} />
              <Bar dataKey="viewers" fill="#353540" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Engagement Trends */}
        <div className="bg-white rounded-xl border border-soft-gray-200 p-6">
          <h3 className="text-lg font-semibold text-charcoal-900 mb-6">Engagement Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E8" />
              <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
              <YAxis stroke="#6B7280" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1A1A23',
                  border: '1px solid #353540',
                  borderRadius: '8px',
                  color: '#E5E5E5'
                }}
              />
              <Line
                type="monotone"
                dataKey="viewers"
                stroke="#F5A623"
                strokeWidth={2}
                dot={{ fill: '#F5A623', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-xl border border-soft-gray-200 p-6">
          <h3 className="text-lg font-semibold text-charcoal-900 mb-6">Category Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1A1A23',
                  border: '1px solid #353540',
                  borderRadius: '8px',
                  color: '#E5E5E5'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-4 mt-4 justify-center">
            {categoryData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm text-charcoal-600">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;