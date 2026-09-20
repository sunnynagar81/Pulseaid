import { Server } from "socket.io";
import jwt from "jsonwebtoken";

let io = null;

export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  // Authenticate the socket handshake using the same access token used
  // for REST calls, so a donor/hospital only ever joins their own room.
  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        parseCookie(socket.handshake.headers.cookie || "", "accessToken");

      if (!token) return next(new Error("Authentication required"));

      const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      socket.user = payload; // { id, role }
      next();
    } catch (err) {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    const { id, role } = socket.user;
    const room = `${role}:${id}`;
    socket.join(room);

    console.log(`[socket] ${role} ${id} connected -> joined room ${room}`);

    socket.on("disconnect", () => {
      console.log(`[socket] ${role} ${id} disconnected`);
    });
  });

  return io;
}

export function getIO() {
  if (!io) throw new Error("Socket.io not initialized — call initSocket(httpServer) first");
  return io;
}

function parseCookie(cookieHeader, name) {
  const match = cookieHeader.match(new RegExp(`${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}