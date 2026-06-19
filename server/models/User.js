import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },

    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 30,
      match: [
        /^[a-zA-Z0-9_]+$/,
        'Username can only contain letters, numbers, and underscores',
      ],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false,
    },

    avatar: {
      type: String,
      default: null,
    },

    bio: {
      type: String,
      default: '',
      maxlength: 300,
    },

    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    savedHives: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hive',
      },
    ],

    attendedHives: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hive',
      },
    ],

    totalHives: {
      type: Number,
      default: 0,
    },

    totalViewers: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

/// 🔐 SAFE PASSWORD HASH (NO next(), NO CRASHES)
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  this.password = await bcrypt.hash(this.password, 12);
});

/// 🔑 PASSWORD CHECK METHOD
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);