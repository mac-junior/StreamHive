import React, { useEffect, useRef, useState } from "react";
import { useSession } from "../context/sessionContext";
import { useNavigate, useSearchParams } from "react-router-dom";

import { StreamVideoClient } from "@stream-io/video-client";
import { getStreamToken } from ".././service/streamService";

import { API_ENDPOINTS, APP_CONFIG, ROUTES } from "../utils/constants";
import api from "../service/api";

import SessionHeader from "../components/session/SessionHeader";
import JoinForm from "../components/session/JoinForm";
import ParticipantsList from "../components/session/ParticipantsList";

const JoinSession = () => {
  const [roomId, setRoomId] = useState("");
  const [localError, setLocalError] = useState("");
  const [sessionJoined, setSessionJoined] = useState(false);
  const [sessionInfo, setSessionInfo] = useState(null);

  const clientRef = useRef(null);
  const callRef = useRef(null);

  const [searchParams] = useSearchParams();

  const { joinSession, getSession, error } = useSession();
  const navigate = useNavigate();

  /**
   * Load roomId from URL
   */
  useEffect(() => {
    const urlRoomId = searchParams.get("roomId");
    if (urlRoomId) {
      setRoomId(urlRoomId);
    }
  }, [searchParams]);

  /**
   * Handle input
   */
  const handleChange = (e) => {
    setRoomId(e.target.value.toUpperCase().trim());
    setLocalError("");
  };

  /**
   * JOIN SESSION (DB + STREAM)
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");

    if (!roomId) {
      setLocalError("Please enter a room ID");
      return;
    }

    const result = await joinSession(roomId);

    if (!result.success) {
      setLocalError("Session not found");
      return;
    }

    setSessionInfo(result.session);
    setSessionJoined(true);
  };

  /**
   * INIT STREAM CALL (MAIN LOGIC)
   */
  useEffect(() => {
    const initCall = async () => {
      if (!sessionJoined || !roomId || clientRef.current) return;

      try {
        const token = await getStreamToken(roomId);

        const client = new StreamVideoClient({
          apiKey: import.meta.env.VITE_STREAM_API_KEY,
          user: {
            id: roomId, // or user.id if you prefer auth user
            name: "Participant",
          },
          token,
        });

        const call = client.call("default", roomId);

        await call.join();

        clientRef.current = client;
        callRef.current = call;
      } catch (err) {
        console.error("Stream join error:", err);
        setLocalError("Failed to join video call");
      }
    };

    initCall();

    return () => {
      if (callRef.current) {
        callRef.current.leave().catch(() => {});
      }
    };
  }, [sessionJoined, roomId]);

  /**
   * POLL SESSION (optional but kept)
   */
  useEffect(() => {
    if (!sessionJoined || !roomId) return;

    const interval = setInterval(async () => {
      const res = await getSession(roomId);

      if (res.success) {
        setSessionInfo(res.session);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [sessionJoined, roomId, getSession]);

  /**
   * LEAVE SESSION
   */
  const handleLeave = async () => {
    try {
      if (callRef.current) {
        await callRef.current.leave();
      }

      await api.post(API_ENDPOINTS.SESSION.LEAVE, { roomId });

      navigate(ROUTES.DASHBOARD);
    } catch (err) {
      console.error(err);
      navigate(ROUTES.DASHBOARD);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <SessionHeader
        title={APP_CONFIG.SESSION_CONTENT.HEADER.JOINING_TITLE}
        roomId={sessionJoined ? roomId : ""}
        onBack={() => navigate(ROUTES.DASHBOARD)}
      />

      <main className="max-w-7xl mx-auto px-4 py-12">
        {!sessionJoined ? (
          <JoinForm
            roomId={roomId}
            error={error || localError}
            onChange={handleChange}
            onSubmit={handleSubmit}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* VIDEO AREA */}
            <div className="lg:col-span-2 space-y-6">
              <div className="w-full h-[500px] bg-black rounded-xl flex items-center justify-center text-white">
                🎥 Stream Call Active
              </div>

              <button
                onClick={handleLeave}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Leave Call
              </button>
            </div>

            {/* PARTICIPANTS */}
            <div className="lg:col-span-1">
              <ParticipantsList
                participants={sessionInfo?.participants || []}
                hostName={sessionInfo?.hostName}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default JoinSession;