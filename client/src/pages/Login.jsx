import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { Hexagon, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required')
});

const Login = () => {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data) => {
    await login(data.email, data.password);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-charcoal-900 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 border-8 border-honey-500 rounded-full"></div>
          <div className="absolute bottom-32 right-20 w-48 h-48 border-8 border-honey-500 rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <svg width="400" height="400" viewBox="0 0 400 400" fill="none">
              {[...Array(6)].map((_, i) => (
                <polygon
                  key={i}
                  points="200,50 350,137.5 350,312.5 200,400 50,312.5 50,137.5"
                  fill="none"
                  stroke="#F5A623"
                  strokeWidth="1"
                  transform={`rotate(${i * 30} 200 200)`}
                  opacity={0.3 - i * 0.05}
                />
              ))}
            </svg>
          </div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 text-center"
        >
          <div className="flex items-center justify-center mb-6">
            <img src="/logo.svg" alt="StreamHive" className="w-20 h-20" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">StreamHive</h1>
          <p className="text-xl text-warm-200">
            Where every stream sparks a conversation.
          </p>
        </motion.div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <img src="/logo.svg" alt="StreamHive" className="w-12 h-12 mx-auto mb-4 lg:hidden" />
            <h2 className="text-3xl font-bold text-charcoal-900">Welcome back</h2>
            <p className="text-charcoal-500 mt-2">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                  placeholder="Enter your password"
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

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-honey-500 text-charcoal-900 font-semibold rounded-lg hover:bg-honey-400 focus:outline-none focus:ring-2 focus:ring-honey-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-8 text-center text-charcoal-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-honey-600 hover:text-honey-500 font-medium">
              Create one
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;