export const formatHiveResponse = (hive) => {
  return {
    id: hive._id,
    title: hive.title,
    description: hive.description,
    category: hive.category,
    hiveType: hive.hiveType,
    status: hive.status,
    viewerCount: hive.viewerCount,
    engagementRate: hive.engagementRate,
    scheduledAt: hive.scheduledAt,
    startedAt: hive.startedAt,
    endedAt: hive.endedAt,
    creator: hive.creatorId ? {
      id: hive.creatorId._id,
      fullname: hive.creatorId.fullname,
      username: hive.creatorId.username,
      avatar: hive.creatorId.avatar
    } : null,
    createdAt: hive.createdAt,
    updatedAt: hive.updatedAt
  };
};

export const calculateEngagementRate = (hive) => {
  if (hive.viewerCount === 0) return 0;
  const participationRate = (hive.questions?.length || 0) / hive.viewerCount;
  return Math.min(100, participationRate * 100);
};

export const sanitizeUsername = (username) => {
  return username.toLowerCase().replace(/[^a-zA-Z0-9_]/g, '');
};

export const generateStreamToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '24h'
  });
};

export const paginateResults = (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return { skip, limit: parseInt(limit) };
};

export const filterHivesByStatus = (hives, status) => {
  if (!status || status === 'all') return hives;
  return hives.filter(hive => hive.status === status);
};

export const getTimeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
    }
  }
  
  return 'just now';
};

export const generateUniqueId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const sanitizeHtml = (text) => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};