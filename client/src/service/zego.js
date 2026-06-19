import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { ZEGO_CONFIG } from '../utils/constants';

let zegoInstance = null;
let userHasJoined = false;
let isDestroying = false;

/**
 * ✅ SAFE APP ID PARSING
 */
const getAppId = () => {
    const rawAppId = ZEGO_CONFIG.APP_ID;

    if (!rawAppId) {
        throw new Error('ZEGOCLOUD App Id not configured');
    }

    const appId = Number(String(rawAppId).trim());

    if (!Number.isInteger(appId)) {
        throw new Error(`Invalid ZEGOCLOUD App Id: ${rawAppId}`);
    }

    return appId;
};

/**
 * Generate Zego Kit Token
 */
export const generateKitToken = (roomId, userId, userName) => {
    try {
        const appId = getAppId();

        const serverSecret = ZEGO_CONFIG.SERVER_SECRET;

        if (!serverSecret) {
            throw new Error('ZEGOCLOUD Server Secret not configured');
        }

        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
            appId,
            serverSecret,
            roomId,
            String(userId),
            userName || `User_${userId}`
        );

        if (!kitToken) {
            throw new Error('Token generation returned empty token');
        }

        return kitToken;
    } catch (error) {
        console.error('Token generation error:', error);
        throw new Error(`Failed to generate Zego token: ${error.message}`);
    }
};

/**
 * Request camera + microphone permission
 */
const requestMediaPermission = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });

        stream.getTracks().forEach(track => track.stop());
        return true;
    } catch (error) {
        console.warn('Media permission denied or failed:', error);
        return false;
    }
};

/**
 * JOIN ROOM
 */
export const joinRoom = async (
    roomId,
    userId,
    userName,
    container,
    onJoinCallback,
    onLeaveCallback
) => {
    if (!container) {
        throw new Error('Container element is required');
    }

    const appId = getAppId();

    // Cleanup existing instance
    if (zegoInstance && !isDestroying) {
        try {
            isDestroying = true;

            const instance = zegoInstance;
            zegoInstance = null;

            if (instance?.destroy) {
                instance.destroy();
            }

            userHasJoined = false;
        } catch (error) {
            console.error('Error cleaning existing Zego instance:', error);
        } finally {
            isDestroying = false;
        }
    }

    // Request permissions
    const hasPermission = await requestMediaPermission();

    let kitToken;
    try {
        kitToken = generateKitToken(roomId, userId, userName);
    } catch (error) {
        throw error;
    }

    // Create instance
    let zp;
    try {
        zp = ZegoUIKitPrebuilt.create(kitToken);

        if (!zp) {
            throw new Error('Failed to create Zego UIKit instance');
        }
    } catch (error) {
        throw new Error(`Failed to create Zego instance: ${error.message}`);
    }

    await new Promise(resolve => setTimeout(resolve, 100));

    // Join room
    try {
        zp.joinRoom({
            container,
            scenario: {
                mode: ZegoUIKitPrebuilt.GroupCall,
            },

            turnOnCameraWhenJoining: hasPermission,
            turnOnMicrophoneWhenJoining: hasPermission,

            showMyCameraToggleButton: true,
            showMyMicrophoneToggleButton: true,
            showAudioVideoSettingsButton: true,
            showTextChat: true,
            showUserList: true,

            onJoinRoom: () => {
                userHasJoined = true;
                onJoinCallback?.();
            },

            onLeaveRoom: () => {
                userHasJoined = false;
                onLeaveCallback?.();
            },

            onError: (error) => {
                console.error('Zego room error:', error);
            },
        });
    } catch (error) {
        console.error('Error joining room:', error);

        try {
            zp?.destroy?.();
        } catch (e) {
            console.error('Error destroying instance after failure:', e);
        }

        zegoInstance = null;
        userHasJoined = false;

        throw new Error(`Failed to join room: ${error.message}`);
    }

    zegoInstance = zp;
    return zp;
};

/**
 * LEAVE ROOM
 */
export const leaveRoom = (onLeaveCallback) => {
    if (!zegoInstance || isDestroying) {
        onLeaveCallback?.();
        return;
    }

    isDestroying = true;

    const instance = zegoInstance;
    zegoInstance = null;
    userHasJoined = false;

    try {
        onLeaveCallback?.();
    } catch (error) {
        console.error('Leave callback error:', error);
    }

    try {
        instance?.leaveRoom?.();
        instance?.destroy?.();
    } catch (error) {
        console.error('Error leaving room:', error);
    } finally {
        isDestroying = false;
    }
};

/**
 * GET INSTANCE
 */
export const getZegoInstance = () => zegoInstance;

/**
 * USER STATUS
 */
export const hasUserJoined = () => userHasJoined;