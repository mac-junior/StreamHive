import { Link } from 'react-router-dom';
import { Users, Clock, Hexagon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const HiveCard = ({ hive }) => {
  const isLive = hive.status === 'live';
  
  const categoryColors = {
    gaming: 'bg-blue-500/10 text-blue-600',
    music: 'bg-purple-500/10 text-purple-600',
    education: 'bg-green-500/10 text-green-600',
    technology: 'bg-cyan-500/10 text-cyan-600',
    art: 'bg-pink-500/10 text-pink-600',
    lifestyle: 'bg-orange-500/10 text-orange-600',
    sports: 'bg-red-500/10 text-red-600',
    entertainment: 'bg-yellow-500/10 text-yellow-600',
    business: 'bg-indigo-500/10 text-indigo-600',
    other: 'bg-gray-500/10 text-gray-600'
  };

  return (
    <Link to={`/hive/${hive._id}`} className="group">
      <div className="bg-white rounded-xl border border-soft-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-honey-400">
        {/* Thumbnail */}
        <div className="relative aspect-video bg-charcoal-800 overflow-hidden">
          {hive.thumbnail ? (
            <img
              src={hive.thumbnail}
              alt={hive.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Hexagon className="w-12 h-12 text-honey-500/30" strokeWidth={1.5} />
            </div>
          )}
          
          {isLive && (
            <div className="absolute top-3 left-3 px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
              LIVE
            </div>
          )}

          <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-black/70 backdrop-blur-sm text-white text-xs rounded-full flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            {hive.viewerCount}
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <h3 className="font-semibold text-charcoal-900 group-hover:text-honey-600 transition line-clamp-1">
              {hive.title}
            </h3>
            <span className={`px-2 py-1 rounded-lg text-xs font-medium capitalize whitespace-nowrap ${categoryColors[hive.category] || categoryColors.other}`}>
              {hive.category}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-honey-500/20 border border-honey-500 flex items-center justify-center overflow-hidden flex-shrink-0">
              {hive.creatorId?.avatar ? (
                <img src={hive.creatorId.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-honey-500 font-semibold text-sm">
                  {hive.creatorId?.fullname?.charAt(0) || '?'}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-charcoal-700 truncate">
                {hive.creatorId?.fullname || 'Unknown'}
              </p>
              <p className="text-xs text-charcoal-400 truncate">
                @{hive.creatorId?.username || 'unknown'}
              </p>
            </div>
          </div>

          {hive.hiveType === 'scheduled' && hive.scheduledAt && (
            <div className="mt-3 flex items-center gap-1.5 text-xs text-charcoal-500">
              <Clock className="w-3.5 h-3.5" />
              {formatDistanceToNow(new Date(hive.scheduledAt), { addSuffix: true })}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default HiveCard;