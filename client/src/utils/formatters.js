export const formatViewerCount = (count) => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
};

export const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

export const getCategoryColor = (category) => {
  const colors = {
    gaming: 'bg-blue-500/10 text-blue-600',
    music: 'bg-purple-500/10 text-purple-600',
    education: 'bg-green-500/10 text-green-600',
    technology: 'bg-cyan-500/10 text-cyan-600',
    art: 'bg-pink-500/10 text-pink-600',
    lifestyle: 'bg-orange-500/10 text-orange-600',
    sports: 'bg-red-500/10 text-red-600',
    entertainment: 'bg-yellow-500/10 text-yellow-600',
    business: 'bg-indigo-500/10 text-indigo-600',
  };
  return colors[category] || 'bg-gray-500/10 text-gray-600';
};

export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};