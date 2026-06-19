import Hive from '../models/Hive.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { StreamChat } from 'stream-chat';
import { z } from 'zod';

const hiveSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(1000),
  category: z.enum(['gaming', 'music', 'education', 'technology', 'art', 'lifestyle', 'sports', 'entertainment', 'business', 'other']),
  hiveType: z.enum(['instant', 'scheduled']),
  scheduledAt: z.string().datetime().optional().nullable()
});

export const createHive = async (req, res) => {
  try {
    const validatedData = hiveSchema.parse(req.body);

    // Initialize Stream Chat
    const serverClient = StreamChat.getInstance(
      process.env.GETSTREAM_API_KEY,
      process.env.GETSTREAM_API_SECRET
    );

    // Create a unique channel for the hive
    const channelId = `hive-${Date.now()}`;
    const channel = serverClient.channel('livestream', channelId, {
      name: validatedData.title,
      created_by_id: req.user.id,
    });

    await channel.create();

    const hiveData = {
      ...validatedData,
      creatorId: req.user.id,
      scheduledAt: validatedData.scheduledAt ? new Date(validatedData.scheduledAt) : null,
      status: validatedData.hiveType === 'instant' ? 'live' : 'scheduled',
      startedAt: validatedData.hiveType === 'instant' ? new Date() : null,
      streamId: channelId,
      chatChannelId: channelId,
      thumbnail: req.file ? `/uploads/${req.file.filename}` : null
    };

    const hive = await Hive.create(hiveData);

    // Update user's total hives
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { totalHives: 1 }
    });

    // Notify followers
    const user = await User.findById(req.user.id);
    if (user.followers.length > 0) {
      const notifications = user.followers.map(followerId => ({
        recipientId: followerId,
        senderId: req.user.id,
        type: 'hive_started',
        hiveId: hive._id,
        message: `${user.username} started a new hive: ${hive.title}`
      }));
      await Notification.insertMany(notifications);
    }

    await hive.populate('creatorId', 'fullname username avatar');

    res.status(201).json({
      success: true,
      hive
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        errors: error.errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating hive'
    });
  }
};

export const getStreamToken = async (req, res) => {
  try {
    const { hiveId } = req.params;
    const hive = await Hive.findById(hiveId);

    if (!hive) {
      return res.status(404).json({
        success: false,
        message: 'Hive not found'
      });
    }

    const serverClient = StreamChat.getInstance(
      process.env.GETSTREAM_API_KEY,
      process.env.GETSTREAM_API_SECRET
    );

    const token = serverClient.createToken(req.user.id);

    await serverClient.upsertUser({
      id: req.user.id,
      name: req.user.username,
      image: req.user.avatar,
    });

    if (!hive.viewers.find(v => v.userId.toString() === req.user.id)) {
      hive.viewers.push({ userId: req.user.id });
      hive.viewerCount = hive.viewers.length;
      await hive.save();
    }

    await User.findByIdAndUpdate(req.user.id, {
      $addToSet: { attendedHives: hiveId }
    });

    return res.status(200).json({
      success: true,
      token,
      apiKey: process.env.GETSTREAM_API_KEY,
      userId: req.user.id,
      channelId: hive.chatChannelId
    });

  } catch (error) {
    console.error("STREAM TOKEN ERROR FULL:", error);

    return res.status(500).json({
      success: false,
      message: 'Error generating stream token',
      error: error.message
    });
  }
};

export const endHive = async (req, res) => {
  try {
    const { hiveId } = req.params;
    const hive = await Hive.findById(hiveId);

    if (!hive) {
      return res.status(404).json({
        success: false,
        message: 'Hive not found'
      });
    }

    if (hive.creatorId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to end this hive'
      });
    }

    hive.status = 'ended';
    hive.endedAt = new Date();
    
    // Calculate engagement rate
    if (hive.viewerCount > 0) {
      hive.engagementRate = (hive.viewers.length / hive.viewerCount) * 100;
    }

    await hive.save();

    res.status(200).json({
      success: true,
      hive
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error ending hive'
    });
  }
};

export const getAllHives = async (req, res) => {
  try {
    const { status, category, search } = req.query;
    const query = {};

    if (status) query.status = status;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const hives = await Hive.find(query)
      .populate('creatorId', 'fullname username avatar')
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      hives
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching hives'
    });
  }
};

export const getSingleHive = async (req, res) => {
  try {
    const hive = await Hive.findById(req.params.hiveId)
      .populate('creatorId', 'fullname username avatar bio followers totalHives')
      .populate('viewers.userId', 'fullname username avatar');

    if (!hive) {
      return res.status(404).json({
        success: false,
        message: 'Hive not found'
      });
    }

    res.status(200).json({
      success: true,
      hive
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching hive'
    });
  }
};

export const getBroadcasterAnalytics = async (req, res) => {
  try {
    const hives = await Hive.find({ creatorId: req.user.id });
    
    const totalHives = hives.length;
    const totalViewers = hives.reduce((sum, hive) => sum + hive.viewerCount, 0);
    const averageEngagement = hives.length > 0 
      ? hives.reduce((sum, hive) => sum + hive.engagementRate, 0) / hives.length 
      : 0;

    // Monthly analytics
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const monthHives = hives.filter(hive => 
        hive.createdAt >= monthStart && hive.createdAt <= monthEnd
      );

      monthlyData.push({
        month: date.toLocaleString('default', { month: 'short' }),
        hives: monthHives.length,
        viewers: monthHives.reduce((sum, h) => sum + h.viewerCount, 0)
      });
    }

    res.status(200).json({
      success: true,
      analytics: {
        totalHives,
        totalViewers,
        followers: (await User.findById(req.user.id)).followers.length,
        engagementRate: averageEngagement.to(1),
        monthlyData
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics'
    });
  }
};

export const addQuestion = async (req, res) => {
  try {
    const { hiveId } = req.params;
    const { question } = req.body;

    const hive = await Hive.findById(hiveId);
    
    if (!hive) {
      return res.status(404).json({
        success: false,
        message: 'Hive not found'
      });
    }

    hive.questions.push({
      userId: req.user.id,
      question,
    });

    await hive.save();
    await hive.populate('questions.userId', 'fullname username avatar');

    res.status(201).json({
      success: true,
      questions: hive.questions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding question'
    });
  }
};

export const answerQuestion = async (req, res) => {
  try {
    const { hiveId, questionId } = req.params;
    const { answer } = req.body;

    const hive = await Hive.findById(hiveId);
    
    if (!hive) {
      return res.status(404).json({
        success: false,
        message: 'Hive not found'
      });
    }

    if (hive.creatorId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only the broadcaster can answer questions'
      });
    }

    const question = hive.questions.id(questionId);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    question.answer = answer;
    question.isAnswered = true;
    question.answeredAt = new Date();

    await hive.save();

    // Notify the question asker
    await Notification.create({
      recipientId: question.userId,
      senderId: req.user.id,
      type: 'question_answered',
      hiveId: hive._id,
      message: `Your question was answered in "${hive.title}"`
    });

    res.status(200).json({
      success: true,
      questions: hive.questions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error answering question'
    });
  }
};

export const toggleBookmark = async (req, res) => {
  try {
    const { hiveId } = req.params;
    const hive = await Hive.findById(hiveId);
    
    if (!hive) {
      return res.status(404).json({
        success: false,
        message: 'Hive not found'
      });
    }

    const user = await User.findById(req.user.id);
    const isBookmarked = user.savedHives.includes(hiveId);

    if (isBookmarked) {
      user.savedHives = user.savedHives.filter(id => id.toString() !== hiveId);
      hive.bookmarks = hive.bookmarks.filter(id => id.toString() !== req.user.id);
    } else {
      user.savedHives.push(hiveId);
      hive.bookmarks.push(req.user.id);
    }

    await user.save();
    await hive.save();

    res.status(200).json({
      success: true,
      isBookmarked: !isBookmarked
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error toggling bookmark'
    });
  }
};