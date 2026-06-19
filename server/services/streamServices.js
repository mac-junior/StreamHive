import { StreamChat } from 'stream-chat';

class StreamService {
  constructor() {
    this.serverClient = null;
  }

  getClient() {
    if (this.serverClient) return this.serverClient;

    const { GETSTREAM_API_KEY, GETSTREAM_API_SECRET } = process.env;

    if (!GETSTREAM_API_KEY || !GETSTREAM_API_SECRET) {
      throw new Error('GetStream API credentials not configured');
    }

    this.serverClient = StreamChat.getInstance(
      GETSTREAM_API_KEY,
      GETSTREAM_API_SECRET
    );

    return this.serverClient;
  }

  async createChannel(channelId, data = {}) {
    try {
      const client = this.getClient();

      const channel = client.channel('livestream', channelId, {
        name: data.name || 'Live Stream',
        created_by_id: data.createdBy,
        ...data.customData,
      });

      // create channel if not exists
      await channel.create();

      return channel;
    } catch (error) {
      console.error('Stream createChannel error:', error);
      throw new Error('Failed to create Stream channel');
    }
  }

  generateToken(userId) {
    try {
      const client = this.getClient();

      if (!userId) {
        throw new Error('userId is required to generate token');
      }

      return client.createToken(userId);
    } catch (error) {
      console.error('Stream generateToken error:', error);
      throw error;
    }
  }

  async upsertUser(userData = {}) {
    try {
      const client = this.getClient();

      if (!userData.id) {
        throw new Error('User ID is required for upsertUser');
      }

      await client.upsertUser({
        id: userData.id,
        name: userData.name || userData.id,
        image: userData.image || undefined,
        role: 'user',
      });
    } catch (error) {
      console.error('Failed to upsert Stream user:', error);
      throw new Error('Stream upsertUser failed');
    }
  }

  async deleteChannel(channelId) {
    try {
      const client = this.getClient();

      if (!channelId) {
        throw new Error('channelId is required');
      }

      const channel = client.channel('livestream', channelId);

      await channel.delete();
    } catch (error) {
      console.error('Stream deleteChannel error:', error);
      throw new Error('Failed to delete Stream channel');
    }
  }
}

export default new StreamService();