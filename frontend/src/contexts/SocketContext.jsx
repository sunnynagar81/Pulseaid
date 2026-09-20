import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { SOCKET_URL } from "../api/client";
import { useAuthStore } from "../store/authStore";

const SocketContext = createContext({ socket: null, connected: false });

/**
 * Exactly ONE Socket.io connection for the whole app, created once when
 * status becomes "authenticated" and torn down on logout. Previously,
 * DashboardLayout and each dashboard page called useSocket() separately,
 * each opening its own connection — two sockets per session, which is
 * wasteful and can produce visible connect/disconnect flicker in the
 * "Live" badge. Every component now shares this single instance via
 * context instead of creating its own.
 */
export function SocketProvider({ children }) {
  const status = useAuthStore((s) => s.status);
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [, forceRender] = useState(0);

  useEffect(() => {
    if (status !== "authenticated") {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setConnected(false);
      return;
    }

    if (socketRef.current) return;

    const socket = io(SOCKET_URL, { withCredentials: true });
    socketRef.current = socket;
    forceRender((n) => n + 1);

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [status]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}