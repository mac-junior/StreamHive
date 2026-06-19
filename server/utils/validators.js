import { z } from 'zod';

export const registerValidator = z.object({
  fullname: z.string()
    .min(2, 'Full name must be at least 2 characters')
    .max(50, 'Full name must be less than 50 characters'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be less than 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string()
    .email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

export const loginValidator = z.object({
  email: z.string()
    .email('Please enter a valid email address'),
  password: z.string()
    .min(1, 'Password is required')
});

export const hiveValidator = z.object({
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be less than 100 characters'),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must be less than 1000 characters'),
  category: z.enum([
    'gaming',
    'music',
    'education',
    'technology',
    'art',
    'lifestyle',
    'sports',
    'entertainment',
    'business',
    'other'
  ], {
    errorMap: () => ({ message: 'Please select a valid category' })
  }),
  hiveType: z.enum(['instant', 'scheduled'], {
    errorMap: () => ({ message: 'Hive type must be instant or scheduled' })
  }),
  scheduledAt: z.string()
    .datetime({ message: 'Invalid date format' })
    .optional()
    .nullable()
});

export const updateProfileValidator = z.object({
  fullname: z.string()
    .min(2, 'Full name must be at least 2 characters')
    .max(50, 'Full name must be less than 50 characters')
    .optional(),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be less than 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .optional(),
  bio: z.string()
    .max(300, 'Bio must be less than 300 characters')
    .optional()
});

export const questionValidator = z.object({
  question: z.string()
    .min(1, 'Question cannot be empty')
    .max(500, 'Question must be less than 500 characters')
});

export const answerValidator = z.object({
  answer: z.string()
    .min(1, 'Answer cannot be empty')
    .max(1000, 'Answer must be less than 1000 characters')
});

export const searchValidator = z.object({
  query: z.string()
    .min(1, 'Search query cannot be empty')
    .max(100, 'Search query too long')
    .optional(),
  category: z.enum([
    'gaming',
    'music',
    'education',
    'technology',
    'art',
    'lifestyle',
    'sports',
    'entertainment',
    'business',
    'other'
  ]).optional(),
  status: z.enum(['scheduled', 'live', 'ended']).optional()
});