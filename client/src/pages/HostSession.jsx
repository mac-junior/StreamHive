import React, { useEffect, useRef, useState } from "react";
import { useSession } from "../context/sessionContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  StreamCall,
  StreamTheme,
  SpeakerLayout,
  CallControls,
  StreamVideoClient,
} from "@stream-io/video-react-sdk";

import { getStreamToken } from "../service/streamService";
import { API_ENDPOINTS, ROUTES } from "../utils/constants";
import { copyToClipboard } from "../utils/helpers";
import api from "../service/api";
import toast from "react-hot-toast";
import { FaSpinner } from "react-icons/fa";

import SessionHeader from "../components/session/SessionHeader";
import SessionInfoCard from "../components/session/SessionInfoCard";
import ParticipantsList from "../components/session/ParticipantsList";

const HostSession = () => {
  const [sessionInfo, setSessionInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const { currentSession, getSession, clearSession } = useSession();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const clientRef = useRef(null);
  const callRef = useRef(null);
  const joinedRef = useRef(false);

  const roomId = searchParams.get("roomId") || currentSession?.roomId;

  /**
   * LOAD SESSION
   */
  useEffect(() => {
    let alive = true;

    const load = async () => {
      if (!roomId) return navigate(ROUTES.DASHBOARD);

      setLoading(true);
      const res = await getSession(roomId);

      if (!alive) return;

      if (res.success) setSessionInfo(res.session);
      else navigate(ROUTES.DASHBOARD);

      setLoading(false);
    };

    load();

    return () => {
      alive = false;
    };
  }, [roomId]);

  /**
   * STREAM INIT (FIXED STABLE VERSION)
   */
  useEffect(() => {
    const init = async () => {
      if (!sessionInfo || !roomId) return;
      if (joinedRef.current) return;

      joinedRef.current = true;

      try {
        const token = await getStreamToken(user.id);

        // ✅ create client once
        if (!clientRef.current) {
          clientRef.current = new StreamVideoClient({
            apiKey: import.meta.env.VITE_STREAM_API_KEY,
            user: {
              id: user.id,
              name: user.name,
            },
            token,
          });
        }

        const client = clientRef.current;

        const call = client.call("default", roomId);

        callRef.current = call;

        // ✅ ONLY join ONCE
        await call.join({ create: true });

      } catch (err) {
        console.error("Stream error:", err);
        toast.error("Video connection failed");
        joinedRef.current = false;
      }
    };

    init();

    return () => {
      callRef.current?.leave().catch(() => {});
      joinedRef.current = false;
    };
  }, [sessionInfo, roomId]);

  /**
   * POLLING
   */
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!roomId) return;

      const res = await getSession(roomId);
      if (res.success) setSessionInfo(res.session);
    }, 5000);

    return () => clearInterval(interval);
  }, [roomId]);

  /**
   * COPY
   */
  const copyRoom = async () => {
    if (!roomId) return;
    const ok = await copyToClipboard(roomId);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const link = `${window.location.origin}/${ROUTES.JOIN}?roomId=${roomId}`;

  /**
   * END
   */
  const endSession = async () => {
    try {
      await callRef.current?.leave();
      await api.post(`${API_ENDPOINTS.SESSION.END}/${sessionInfo.id}`);
      clearSession();
      navigate(ROUTES.DASHBOARD);
    } catch (e) {
      toast.error("Failed to end session");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
      </div>
    );
  }

  if (!sessionInfo) return null;

  return (
    <div className="min-h-screen bg-gray-50">

      <SessionHeader
        title="Hosting Session"
        roomId={roomId}
        userName={user?.name}
        onEndSession={endSession}
      />

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-3 gap-6">

        <div className="col-span-2 space-y-6">

          <SessionInfoCard
            roomId={roomId}
            shareableLink={link}
            status={sessionInfo.status}
            participantCount={sessionInfo.participantCount}
            copied={copied}
            onCopyRoomId={copyRoom}
            onCopyLink={copyRoom}
          />

          {/* ✅ STABLE STREAM RENDER */}
          <div className="h-[500px] bg-black rounded-xl overflow-hidden">
            {callRef.current ? (
              <StreamCall call={callRef.current}>
                <StreamTheme>
                  <div className="h-full flex flex-col">
                    <div className="flex-1">
                      <SpeakerLayout />
                    </div>
                    <CallControls />
                  </div>
                </StreamTheme>
              </StreamCall>
            ) : (
              <div className="h-full flex items-center justify-center text-white">
                Connecting...
              </div>
            )}
          </div>

        </div>

        <ParticipantsList
          participants={sessionInfo.participants}
          hostName={sessionInfo.hostName}
        />

      </main>
    </div>
  );
};

export default HostSession;