import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Camera, Zap, Loader } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const hiveSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description must be less than 1000 characters'),
  category: z.enum(['gaming', 'music', 'education', 'technology', 'art', 'lifestyle', 'sports', 'entertainment', 'business', 'other'], {
    errorMap: () => ({ message: 'Please select a category' })
  }),
});

const InstantHive = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(hiveSchema)
  });

  const categories = ['gaming', 'music', 'education', 'technology', 'art', 'lifestyle', 'sports', 'entertainment', 'business', 'other'];

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('category', data.category);
      formData.append('hiveType', 'instant');
      
      if (data.thumbnail?.[0]) {
        formData.append('thumbnail', data.thumbnail[0]);
      }

      const response = await api.post('/hives', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Hive created successfully! Going live...');
      navigate(`/hive/${response.data.hive._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create hive');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl border border-soft-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-honey-500/10 rounded-lg">
            <Zap className="w-6 h-6 text-honey-500" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-charcoal-900">Start an Instant Hive</h2>
            <p className="text-sm text-charcoal-500">Go live now and connect with your community</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Thumbnail Upload */}
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-2">Thumbnail (optional)</label>
            <label className="cursor-pointer block">
              <div className="h-48 bg-soft-gray-50 border-2 border-dashed border-soft-gray-300 rounded-lg flex flex-col items-center justify-center hover:bg-soft-gray-100 transition">
                <Camera className="w-12 h-12 text-charcoal-400 mb-2" />
                <p className="text-sm text-charcoal-500">Click to upload thumbnail</p>
                <p className="text-xs text-charcoal-400 mt-1">JPEG, PNG or WebP (max 5MB)</p>
              </div>
              <input {...register('thumbnail')} type="file" accept="image/*" className="hidden" />
            </label>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-2">Hive Title *</label>
            <input
              {...register('title')}
              type="text"
              placeholder="Enter a compelling title for your stream..."
              className="w-full px-4 py-3 bg-soft-gray-50 border border-soft-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-honey-500 focus:border-transparent"
            />
            {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-2">Category *</label>
            <select
              {...register('category')}
              className="w-full px-4 py-3 bg-soft-gray-50 border border-soft-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-honey-500 focus:border-transparent capitalize"
            >
              <option value="">Select a category</option>
              {categories.map(cat => (
                <option key={cat} value={cat} className="capitalize">{cat}</option>
              ))}
            </select>
            {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-2">Description *</label>
            <textarea
              {...register('description')}
              rows={4}
              placeholder="What's this hive about? Let viewers know what to expect..."
              className="w-full px-4 py-3 bg-soft-gray-50 border border-soft-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-honey-500 focus:border-transparent resize-none"
            />
            {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-honey-500 text-charcoal-900 font-semibold rounded-lg hover:bg-honey-400 focus:outline-none focus:ring-2 focus:ring-honey-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Creating Hive...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Start Hive Now
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default InstantHive;
