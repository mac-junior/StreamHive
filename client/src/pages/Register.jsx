import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Camera, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

const registerSchema = z.object({
  fullname: z.string().min(2, 'Full name must be at least 2 characters'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

const Register = () => {
  const { register: registerUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(registerSchema)
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
    const formData = new FormData();
    formData.append('fullname', data.fullname);
    formData.append('username', data.username);
    formData.append('email', data.email);
    formData.append('password', data.password);
    formData.append('confirmPassword', data.confirmPassword);
    
    if (data.avatar?.[0]) {
      formData.append('avatar', data.avatar[0]);
    }

    await registerUser(formData);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <img src="/logo.svg" alt="StreamHive" className="w-12 h-12 mx-auto mb-4 lg:hidden" />
            <h2 className="text-3xl font-bold text-charcoal-900">Join StreamHive</h2>
            <p className="text-charcoal-500 mt-2">Create your account and start streaming</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Avatar Upload */}
            <div className="flex justify-center mb-6">
              <label className="cursor-pointer group relative">
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-soft-gray-300 flex items-center justify-center bg-soft-gray-50 hover:bg-soft-gray-100 transition overflow-hidden">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-8 h-8 text-charcoal-400" />
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-honey-500 rounded-full flex items-center justify-center">
                  <Camera className="w-4 h-4 text-charcoal-900" />
                </div>
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
              <label className="block text-sm font-medium text-charcoal-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-charcoal-400" />
                <input
                  {...register('fullname')}
                  type="text"
                  placeholder="Mac Shadow"
                  className="w-full pl-10 pr-4 py-3 bg-soft-gray-50 border border-soft-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-honey-500 focus:border-transparent transition"
                />
              </div>
              {errors.fullname && (
                <p className="mt-1 text-sm text-red-500">{errors.fullname.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-2">
                Username
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal-400">@</span>
                <input
                  {...register('username')}
                  type="text"
                  placeholder="yourname"
                  className="w-full pl-8 pr-4 py-3 bg-soft-gray-50 border border-soft-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-honey-500 focus:border-transparent transition"
                />
              </div>
              {errors.username && (
                <p className="mt-1 text-sm text-red-500">{errors.username.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-charcoal-400" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-soft-gray-50 border border-soft-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-honey-500 focus:border-transparent transition"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-charcoal-400" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  className="w-full pl-10 pr-12 py-3 bg-soft-gray-50 border border-soft-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-honey-500 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-charcoal-400 hover:text-charcoal-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-charcoal-400" />
                <input
                  {...register('confirmPassword')}
                  type="password"
                  placeholder="Repeat your password"
                  className="w-full pl-10 pr-4 py-3 bg-soft-gray-50 border border-soft-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-honey-500 focus:border-transparent transition"
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-honey-500 text-charcoal-900 font-semibold rounded-lg hover:bg-honey-400 focus:outline-none focus:ring-2 focus:ring-honey-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-8 text-center text-charcoal-500">
            Already have an account?{' '}
            <Link to="/login" className="text-honey-600 hover:text-honey-500 font-medium">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-charcoal-900 items-center justify-center p-12 relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 text-center"
        >
          <div className="flex items-center justify-center mb-6">
            <img src="/logo.svg" alt="StreamHive" className="w-20 h-20" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Start Your Journey</h1>
          <p className="text-lg text-warm-200">
            Create engaging live experiences and build your community.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;