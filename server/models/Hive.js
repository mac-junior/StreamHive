import mongoose from 'mongoose';

const hiveSchema = new mongoose.Schema({
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Hive title is required'],
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: 1000
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
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
    ]
  },
  thumbnail: {
    type: String,
    default: null
  },
  hiveType: {
    type: String,
    required: true,
    enum: ['instant', 'scheduled']
  },
  scheduledAt: {
    type: Date,
    default: null
  },
  startedAt: {
    type: Date,
    default: null
  },
  endedAt: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['scheduled', 'live', 'ended'],
    default: 'scheduled'
  },
  streamId: {
    type: String,
    default: null
  },
  chatChannelId: {
    type: String,
    default: null
  },
  viewers: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  viewerCount: {
    type: Number,
    default: 0
  },
  bookmarks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  questions: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    question: {
      type: String,
      required: true
    },
    answer: {
      type: String,
      default: null
    },
    answeredAt: {
      type: Date,
      default: null
    },
    isAnswered: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  engagementRate: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

hiveSchema.index({ status: 1, category: 1 });
hiveSchema.index({ creatorId: 1, createdAt: -1 });

export default mongoose.model('Hive', hiveSchema);