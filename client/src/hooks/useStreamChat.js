import { useEffect, useState } from 'react';
import { StreamVideoClient } from '@stream-io/video-client';
import api from '../services/api';

export const useHiveCall = (hiveId) => {
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hiveId) return;

    const init = async () => {
      try {
        const { data } = await api.get(`/hives/${hiveId}/token`);
        const { token, apiKey, userId, callId } = data;

        const videoClient = new StreamVideoClient({
          apiKey,
          user: { id: userId },
          token,
        });

        const callInstance = videoClient.call('livestream', callId);

        await callInstance.join({ create: true });

        await callInstance.microphone.enable(); // 🔥 AUDIO FIX

        setClient(videoClient);
        setCall(callInstance);
      } catch (err) {
        console.error('Call error:', err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [hiveId]);

  return { client, call, loading };
};