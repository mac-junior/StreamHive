import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import toast from "react-hot-toast";

import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  SpeakerLayout,
  AudioVolumeIndicator,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";

import { StreamChat } from "stream-chat";
import {
  Chat,
  Channel,
  Window,
  MessageList,
  MessageComposer,
  MessageComposerUI,
  Thread,
} from "stream-chat-react";

import "stream-chat-react/dist/css/index.css";

/* ---------------- AUDIO MONITOR ---------------- */

const HostAudioMonitor = () => {
  const { useLocalParticipant } = useCallStateHooks();
  const localParticipant = useLocalParticipant();

  if (!localParticipant) {
    return (
      <span className="text-xs text-zinc-500">
        Syncing mic...
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2 bg-zinc-900 px-3 py-2 rounded-lg border border-zinc-800">
      <span className="text-xs text-zinc-400">Level:</span>
      <div className="w-16 h-4 flex items-center bg-zinc-950 rounded px-1">
        <AudioVolumeIndicator participant={localParticipant} />
      </div>
    </div>
  );
};

/* ---------------- MAIN COMPONENT ---------------- */

const LiveHive = () => {
  const { hiveId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const initialized = useRef(false);

  const [hive, setHive] = useState(null);
  const [videoClient, setVideoClient] = useState(null);
  const [call, setCall] = useState(null);
  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);

  const [isHost, setIsHost] = useState(false);
  const [loading, setLoading] = useState(true);
  const [micActive, setMicActive] = useState(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    loadLive();

    return () => {
      chatClient?.disconnectUser();
      videoClient?.disconnectUser?.();
    };
  }, []);

  const loadLive = async () => {
    try {
      const hiveRes = await api.get(`/hives/${hiveId}`);
      const hiveData = hiveRes.data.hive;
      setHive(hiveData);

      const creatorIdString = hiveData.creatorId?._id || hiveData.creatorId;
      const currentUserIdString = user?.id || user?._id;

      const host =
        creatorIdString &&
        currentUserIdString &&
        creatorIdString === currentUserIdString;

      setIsHost(!!host);

      const tokenRes = await api.get(`/hives/${hiveId}/token`);

      const {
        apiKey,
        token,
        userId,
        channelId,
        videoToken,
        chatToken,
      } = tokenRes.data;

      /* ---------------- VIDEO CLIENT ---------------- */

      const vClient = new StreamVideoClient({
        apiKey,
        user: {
          id: userId,
          name: user.username,
          role: host ? "host" : "user",
        },
        token: videoToken || token,
      });

      const callInstance = vClient.call("livestream", hiveId);

      await callInstance.join({
        create: true,
        audio: true,
        video: host,
      });

      if (host) {
        try {
          await callInstance.microphone.enable();
          await callInstance.camera.enable();
          setMicActive(true);
        } catch (err) {
          console.error("Media error:", err);
        }
      }

      setVideoClient(vClient);
      setCall(callInstance);

      /* ---------------- CHAT CLIENT ---------------- */

      const cClient = StreamChat.getInstance(apiKey);

      await cClient.connectUser(
        {
          id: userId,
          name: user.username,
          image: user.avatar || undefined,
        },
        chatToken || token
      );

      const ch = cClient.channel("livestream", channelId, {
        name: hiveData.title,
      });

      await ch.watch();

      setChatClient(cClient);
      setChannel(ch);

      setLoading(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load live session");
      setLoading(false);
    }
  };

  const handleEndLive = async () => {
    try {
      if (!isHost) {
        toast.error("Only host can end live");
        return;
      }

      await call?.endCall();
      await chatClient?.disconnectUser();

      toast.success("Live ended");
      navigate("/dashboard/my-hives");
    } catch (err) {
      console.error(err);
      navigate("/dashboard/my-hives");
    }
  };

  const toggleMic = async () => {
    if (!call) return;

    try {
      if (micActive) {
        await call.microphone.disable();
        setMicActive(false);
        toast.error("Mic muted");
      } else {
        await call.microphone.enable();
        setMicActive(true);
        toast.success("Mic enabled");
      }
    } catch (err) {
      toast.error("Mic toggle failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        Loading live session...
      </div>
    );
  }

  /* ---------------- SINGLE STREAM CONTEXT (IMPORTANT FIX) ---------------- */

  return (
    <StreamVideo client={videoClient}>
      <StreamCall call={call}>

        <div className="min-h-screen bg-black flex flex-col">

          {/* HEADER */}
          <div className="flex justify-between items-center p-3 border-b border-gray-800 text-white">
            <div>
              <h1 className="font-bold text-xl">
                {hive?.title || "Live Stream"}
              </h1>
              <p className="text-sm text-gray-400">
                Host: @{hive?.creatorId?.username || user?.username}
              </p>
            </div>

            {isHost && (
              <div className="flex items-center gap-3">
                <HostAudioMonitor />

                <button
                  onClick={toggleMic}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    micActive
                      ? "bg-gray-700"
                      : "bg-yellow-600 hover:bg-yellow-700"
                  }`}
                >
                  {micActive ? "🎙️ Mic ON" : "🔇 Mic OFF"}
                </button>

                <button
                  onClick={handleEndLive}
                  className="bg-red-500 px-4 py-2 rounded-lg text-white"
                >
                  End Live
                </button>
              </div>
            )}
          </div>

          {/* BODY */}
          <div className="flex flex-1">

            {/* VIDEO */}
            <div className="flex-1 bg-black flex items-center justify-center">
              <SpeakerLayout />
            </div>

            {/* CHAT */}
            <div className="w-96 border-l border-gray-800 bg-zinc-900 flex flex-col">
              {chatClient && channel ? (
                <Chat client={chatClient} theme="str-chat__theme-dark">
                  <Channel channel={channel}>
                    <Window>
                      <MessageList />
                      <MessageComposer>
                        <MessageComposerUI />
                      </MessageComposer>
                    </Window>
                    <Thread />
                  </Channel>
                </Chat>
              ) : (
                <div className="p-4 text-gray-400">
                  Connecting chat...
                </div>
              )}
            </div>

          </div>
        </div>

      </StreamCall>
    </StreamVideo>
  );
};

export default LiveHive;