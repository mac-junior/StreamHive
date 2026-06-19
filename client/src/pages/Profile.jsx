import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, UserPlus, UserMinus, Calendar } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const Profile = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const response = await api.get(`/users/${userId}`);
      setProfile(response.data.user);
      setIsFollowing(response.data.user.followers?.some(f => f._id === currentUser?.id));
    } catch (error) {
      toast.error('Failed to load profile');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    try {
      await api.post(`/users/${userId}/follow`);
      setIsFollowing(!isFollowing);
      fetchProfile();
    } catch (error) {
      toast.error('Failed to update follow status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-warm-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-honey-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-warm-50">
      <div className="max-w-4xl mx-auto p-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-charcoal-600 hover:text-charcoal-900 mb-6">
          <ArrowLeft className="w-5 h-5" />Back
        </button>
        <div className="bg-white rounded-xl border border-soft-gray-200 overflow-hidden">
          <div className="h-48 bg-gradient-to-r from-charcoal-800 to-charcoal-700" />
          <div className="px-6 pb-6">
            <div className="flex justify-between items-start">
              <div className="-mt-16">
                <div className="w-32 h-32 rounded-full border-4 border-white bg-white overflow-hidden">
                  {profile.avatar ? (
                    <img src={profile.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-honey-500/10 flex items-center justify-center">
                      <span className="text-4xl font-bold text-honey-500">{profile.fullname?.charAt(0)}</span>
                    </div>
                  )}
                </div>
              </div>
              {currentUser?.id !== userId && (
                <button onClick={handleFollow} className={`mt-4 flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition ${isFollowing ? 'bg-soft-gray-100 text-charcoal-700 hover:bg-soft-gray-200' : 'bg-honey-500 text-charcoal-900 hover:bg-honey-400'}`}>
                  {isFollowing ? <><UserMinus className="w-4 h-4" />Unfollow</> : <><UserPlus className="w-4 h-4" />Follow</>}
                </button>
              )}
            </div>
            <div className="mt-4">
              <h1 className="text-2xl font-bold text-charcoal-900">{profile.fullname}</h1>
              <p className="text-charcoal-500">@{profile.username}</p>
              {profile.bio && <p className="mt-3 text-charcoal-700">{profile.bio}</p>}
            </div>
            <div className="flex items-center gap-6 mt-6 pt-6 border-t border-soft-gray-200">
              <div className="text-center"><p className="text-2xl font-bold text-charcoal-900">{profile.followersCount}</p><p className="text-sm text-charcoal-500">Followers</p></div>
              <div className="text-center"><p className="text-2xl font-bold text-charcoal-900">{profile.followingCount}</p><p className="text-sm text-charcoal-500">Following</p></div>
              <div className="text-center"><p className="text-2xl font-bold text-charcoal-900">{profile.totalHives}</p><p className="text-sm text-charcoal-500">Hives</p></div>
            </div>
            <div className="flex items-center gap-2 mt-4 text-sm text-charcoal-500">
              <Calendar className="w-4 h-4" />Joined {format(new Date(profile.createdAt), 'MMMM yyyy')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;