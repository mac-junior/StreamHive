import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { updateProfileValidator } from '../utils/validators.js';

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('followers', 'fullname username avatar')
      .populate('following', 'fullname username avatar');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user: {
        ...user.toObject(),
        followersCount: user.followers.length,
        followingCount: user.following.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching profile'
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const validatedData = updateProfileValidator.parse(req.body);
    
    if (validatedData.username) {
      const existingUser = await User.findOne({ 
        username: validatedData.username,
        _id: { $ne: req.user.id }
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Username already taken'
        });
      }
    }

    const updateData = { ...validatedData };
    if (req.file) {
      updateData.avatar = `/uploads/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        errors: error.errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating profile'
    });
  }
};

export const followUser = async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.userId);
    const currentUser = await User.findById(req.user.id);

    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (req.user.id === req.params.userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot follow yourself'
      });
    }

    const isFollowing = currentUser.following.includes(req.params.userId);

    if (isFollowing) {
      currentUser.following = currentUser.following.filter(
        id => id.toString() !== req.params.userId
      );
      userToFollow.followers = userToFollow.followers.filter(
        id => id.toString() !== req.user.id
      );
    } else {
      currentUser.following.push(req.params.userId);
      userToFollow.followers.push(req.user.id);

      await Notification.create({
        recipientId: req.params.userId,
        senderId: req.user.id,
        type: 'follow',
        message: `${currentUser.username} started following you`
      });
    }

    await currentUser.save();
    await userToFollow.save();

    res.status(200).json({
      success: true,
      isFollowing: !isFollowing
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error processing follow'
    });
  }
};