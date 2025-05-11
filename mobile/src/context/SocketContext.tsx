import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { io, Socket } from "socket.io-client";

// Replace with your backend URL
const SOCKET_URL = "http://192.168.29.162:3003";

interface SocketContextType {
  socket: Socket | null;
  socketInitialized: boolean;
  callState: {
    incomingCall?: { from: string; roomId: string } | null;
  };
  sendOffer: (offer: any, roomId: string) => void;
  sendAnswer: (answer: any, roomId: string) => void;
  sendCandidate: (candidate: any, roomId: string) => void;
  callUser: (calleeId: string, roomId: string) => void;
  acceptCall: (callerId: string, roomId: string) => void;
  rejectCall: (callerId: string) => void;
  endCall: (calleeId: string) => void;
  endCallByRoomId: (roomId: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const socketRef = useRef<Socket | null>(null);
  const [socketInitialized, setSocketInitialized] = useState(false);
  const [callState, setCallState] = useState<SocketContextType["callState"]>(
    {}
  );

  useEffect(() => {
    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✅ Connected:", socket.id);
      setSocketInitialized(true); // Mark socket as initialized
    });

    socket.on("incoming-call", ({ from, roomId }) => {
      console.log("📲 Incoming call from", from);
      setCallState({ incomingCall: { from, roomId } });
    });
    socket.on("call-rejected", ({ from }) => {
      console.log("📲 Rejected call ");
      setCallState({ incomingCall: null });
    });
    socket.on("call-ended", ({ from }) => {
      console.log("📲 Call ended ");
      setCallState({ incomingCall: null });
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected from server");
      setSocketInitialized(false); // Reset socket state if disconnected
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const emit = useCallback(
    (event: string, payload: any) => {
      if (socketInitialized && socketRef.current) {
        socketRef.current.emit(event, payload);
      } else {
        console.log("Socket is not initialized yet.");
      }
    },
    [socketInitialized]
  );

  const value: SocketContextType = {
    socket: socketRef.current,
    socketInitialized,
    callState,
    sendOffer: (offer, roomId) => emit("offer", { offer, roomId }),
    sendAnswer: (answer, roomId) => emit("answer", { answer, roomId }),
    sendCandidate: (candidate, roomId) =>
      emit("ice-candidate", { candidate, roomId }),
    callUser: (calleeId, roomId) => emit("call-user", { calleeId, roomId }),
    acceptCall: (callerId, roomId) => emit("accept-call", { callerId, roomId }),
    rejectCall: (callerId) => {
      console.log("rejectCall", callerId);
      emit("reject-call", { callerId });
      setCallState({ incomingCall: null });
    },
    endCall: (calleeId) => {
      emit("end-call", { calleeId });
      console.log("endCall", calleeId);
      setCallState({ incomingCall: null });
    },
    endCallByRoomId: (roomId) => {
      emit("end-call-room", { roomId });
      setCallState({ incomingCall: null });
    },
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context)
    throw new Error("useSocket must be used within a SocketProvider");
  return context;
};
