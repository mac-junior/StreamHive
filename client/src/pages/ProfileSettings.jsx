import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { Camera, Save, User } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const profileSchema = z.object({
  fullname: z.string().min(2, 'Name must be at least 2 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  bio: z.string().max(300, 'Bio must be less than 300 characters').optional(),
});

const ProfileSettings = () => {
  const { user, fetchCurrentUser } = useAuth();
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
  const [isSaving, setIsSaving] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullname: user?.fullname || '',
      username: user?.username || '',
      bio: user?.bio || '',
    }
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('fullname', data.fullname);
      formData.append('username', data.username);
      formData.append('bio', data.bio || '');
      
      if (data.avatar?.[0]) {
        formData.append('avatar', data.avatar[0]);
      }

      await api.put('/users/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      await fetchCurrentUser();
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl border border-soft-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-honey-500/10 rounded-lg">
            <User className="w-6 h-6 text-honey-500" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-charcoal-900">Profile Settings</h2>
            <p className="text-sm text-charcoal-500">Manage your profile information</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full border-2 border-soft-gray-200 overflow-hidden bg-soft-gray-50">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-12 h-12 text-charcoal-300" />
                  </div>
                )}
              </div>
              <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition cursor-pointer">
                <Camera className="w-6 h-6 text-white" />
                <input
                  {...register('avatar')}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
            <div>
              <p className="font-medium text-charcoal-900">{user?.fullname}</p>
              <p className="text-sm text-charcoal-500">@{user?.username}</p>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-2">
              Full Name
            </label>
            <input
              {...register('fullname')}
              type="text"
              className="w-full px-4 py-3 bg-soft-gray-50 border border-soft-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-honey-500 focus:border-transparent"
            />
            {errors.fullname && (
              <p className="mt-1 text-sm text-red-500">{errors.fullname.message}</p>
            )}
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-2">
              Username
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal-400">@</span>
              <input
                {...register('username')}
                type="text"
                className="w-full pl-8 pr-4 py-3 bg-soft-gray-50 border border-soft-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-honey-500 focus:border-transparent"
              />
            </div>
            {errors.username && (
              <p className="mt-1 text-sm text-red-500">{errors.username.message}</p>
            )}
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-2">
              Bio
            </label>
            <textarea
              {...register('bio')}
              rows={4}
              placeholder="Tell the community about yourself..."
              className="w-full px-4 py-3 bg-soft-gray-50 border border-soft-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-honey-500 focus:border-transparent resize-none"
            />
            {errors.bio && (
              <p className="mt-1 text-sm text-red-500">{errors.bio.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 bg-honey-500 text-charcoal-900 font-semibold rounded-lg hover:bg-honey-400 focus:outline-none focus:ring-2 focus:ring-honey-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSettings;