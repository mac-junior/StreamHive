import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Camera, Loader } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const scheduleSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.enum(['gaming', 'music', 'education', 'technology', 'art', 'lifestyle', 'sports', 'entertainment', 'business', 'other']),
  scheduledDate: z.string().min(1, 'Date is required'),
  scheduledTime: z.string().min(1, 'Time is required'),
});

const ScheduledHives = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(scheduleSchema)
  });

  const categories = [
    'gaming', 'music', 'education', 'technology', 
    'art', 'lifestyle', 'sports', 'entertainment', 'business', 'other'
  ];

  const onSubmit = async (data) => {
    try {
      const scheduledAt = new Date(`${data.scheduledDate}T${data.scheduledTime}:00`).toISOString();
      
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('category', data.category);
      formData.append('hiveType', 'scheduled');
      formData.append('scheduledAt', scheduledAt);
      
      if (data.thumbnail?.[0]) {
        formData.append('thumbnail', data.thumbnail[0]);
      }

      await api.post('/hives', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Hive scheduled successfully!');
      navigate('/dashboard/my-hives');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to schedule hive');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl border border-soft-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-honey-500/10 rounded-lg">
            <Calendar className="w-6 h-6 text-honey-500" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-charcoal-900">Schedule a Hive</h2>
            <p className="text-sm text-charcoal-500">Plan your future stream</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-2">
              Thumbnail (optional)
            </label>
            <label className="cursor-pointer block">
              <div className="h-48 bg-soft-gray-50 border-2 border-dashed border-soft-gray-300 rounded-lg flex flex-col items-center justify-center hover:bg-soft-gray-100 transition">
                <Camera className="w-12 h-12 text-charcoal-400 mb-2" />
                <p className="text-sm text-charcoal-500">Click to upload thumbnail</p>
              </div>
              <input
                {...register('thumbnail')}
                type="file"
                accept="image/*"
                className="hidden"
              />
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-2">
              Title *
            </label>
            <input
              {...register('title')}
              type="text"
              placeholder="What's your hive about?"
              className="w-full px-4 py-3 bg-soft-gray-50 border border-soft-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-honey-500 focus:border-transparent"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-2">
              Category *
            </label>
            <select
              {...register('category')}
              className="w-full px-4 py-3 bg-soft-gray-50 border border-soft-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-honey-500 focus:border-transparent"
            >
              <option value="">Select category</option>
              {categories.map(cat => (
                <option key={cat} value={cat} className="capitalize">{cat}</option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-500">{errors.category.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-2">
                Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-charcoal-400" />
                <input
                  {...register('scheduledDate')}
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full pl-10 pr-4 py-3 bg-soft-gray-50 border border-soft-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-honey-500 focus:border-transparent"
                />
              </div>
              {errors.scheduledDate && (
                <p className="mt-1 text-sm text-red-500">{errors.scheduledDate.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-2">
                Time *
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-charcoal-400" />
                <input
                  {...register('scheduledTime')}
                  type="time"
                  className="w-full pl-10 pr-4 py-3 bg-soft-gray-50 border border-soft-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-honey-500 focus:border-transparent"
                />
              </div>
              {errors.scheduledTime && (
                <p className="mt-1 text-sm text-red-500">{errors.scheduledTime.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-2">
              Description *
            </label>
            <textarea
              {...register('description')}
              rows={4}
              placeholder="Describe what viewers can expect..."
              className="w-full px-4 py-3 bg-soft-gray-50 border border-soft-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-honey-500 focus:border-transparent resize-none"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-honey-500 text-charcoal-900 font-semibold rounded-lg hover:bg-honey-400 focus:outline-none focus:ring-2 focus:ring-honey-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Scheduling...
              </>
            ) : (
              <>
                <Calendar className="w-5 h-5" />
                Schedule Hive
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ScheduledHives;