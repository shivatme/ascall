import React, { createContext, useContext, useRef, useState } from "react";
import { MediaStream, RTCPeerConnection } from "react-native-webrtc";

interface CallContextProps {
  peerConnection: React.MutableRefObject<RTCPeerConnection | null>;
  localStream: MediaStream | null;
  setLocalStream: (stream: MediaStream | null) => void;
  remoteStream: MediaStream | null;
  setRemoteStream: (stream: MediaStream | null) => void;
}

const CallContext = createContext<CallContextProps | undefined>(undefined);

export const WebRTCProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  return (
    <CallContext.Provider
      value={{
        peerConnection,
        localStream,
        setLocalStream,
        remoteStream,
        setRemoteStream,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};

export const useWebRTC = (): CallContextProps => {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error("useCall must be used within a CallProvider");
  }
  return context;
};
