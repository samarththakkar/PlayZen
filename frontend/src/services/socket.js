import { io } from "socket.io-client";

// In dev: use localhost. In production: use the VITE_SOCKET_URL env var pointing at your Render backend.
// Set VITE_SOCKET_URL=https://your-render-app.onrender.com in Vercel's environment variables.
const getSocketUrl = () => {
    if (import.meta.env.VITE_SOCKET_URL) {
        return import.meta.env.VITE_SOCKET_URL;
    }
    // Fallback for local dev without the env var
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
        return "http://localhost:8000";
    }
    // Last resort: same origin (only works if frontend and backend are on the same domain)
    return window.location.origin;
};

let socket = null;

export const initSocket = (userId) => {
    if (!socket) {
        const socketUrl = getSocketUrl();
        console.log("Initializing socket connection to:", socketUrl);
        socket = io(socketUrl, {
            autoConnect: false,
            withCredentials: true,
            transports: ["websocket", "polling"], // prefer websocket, fall back to polling
        });
    }

    if (!socket.connected) {
        socket.connect();
        
        socket.on("connect", () => {
            console.log("Socket connected with id:", socket.id);
            if (userId) {
                socket.emit("register-user", userId);
            }
        });

        socket.on("connect_error", (err) => {
            // Log but never show a user-facing toast — sockets are optional/graceful degradation
            console.warn("Socket connection error (non-fatal):", err.message);
        });

        socket.on("disconnect", () => {
            console.log("Socket disconnected");
        });
    }

    if (userId && socket.connected) {
        socket.emit("register-user", userId);
    }

    return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
        console.log("Socket manually disconnected");
    }
};
