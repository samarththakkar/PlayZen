import { io } from "socket.io-client";

const getSocketUrl = () => {
    // If we're on localhost (Vite dev server), connect directly to backend on port 8000
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
        return "http://localhost:8000";
    }
    // In production, connect to same origin
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
