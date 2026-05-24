import { Server } from "socket.io";
import jwt from "jsonwebtoken";

let io = null;
const userSockets = new Map(); // userId string -> Set of socketIds

const parseCookies = (cookieHeader) => {
    if (!cookieHeader) return {};
    return cookieHeader.split(';').reduce((res, c) => {
        const [key, val] = c.trim().split('=');
        if (key && val) {
            res[key] = decodeURIComponent(val);
        }
        return res;
    }, {});
};

export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.CORS_ORIGIN
                ? process.env.CORS_ORIGIN.split(",").map(o => o.trim())
                : ["http://localhost:5173", "http://localhost:3000", "https://play-zen.vercel.app"],
            credentials: true,
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket) => {
        console.log("Socket connected:", socket.id);
        
        let authenticatedUserId = null;

        // Try extracting user ID from jwt handshake auth, queries or cookies
        try {
            let token = socket.handshake.auth?.token || socket.handshake.query?.token;
            if (!token && socket.request.headers.cookie) {
                const cookies = parseCookies(socket.request.headers.cookie);
                token = cookies.accessToken;
            }

            if (token) {
                const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
                if (decoded?._id) {
                    authenticatedUserId = String(decoded._id);
                    if (!userSockets.has(authenticatedUserId)) {
                        userSockets.set(authenticatedUserId, new Set());
                    }
                    userSockets.get(authenticatedUserId).add(socket.id);
                    console.log(`Socket ${socket.id} authenticated as User ${authenticatedUserId}`);
                }
            }
        } catch (err) {
            console.log("Socket auth handshake validation failed:", err.message);
        }

        // Fallback or explicit register event - SECURED
        socket.on("register-user", (userId) => {
            if (!userId) return;
            const uidStr = String(userId);
            
            // SECURITY: Block user spoofing. If authenticated, only allow matching ID.
            if (authenticatedUserId && authenticatedUserId !== uidStr) {
                console.warn(`Blocked spoofed register-user attempt by socket ${socket.id}. Authenticated as ${authenticatedUserId}, tried to register as ${uidStr}`);
                return;
            }

            // SECURITY: If not authenticated via token handshake/cookies, reject the registration.
            if (!authenticatedUserId) {
                console.warn(`Blocked unauthenticated register-user attempt for user ${uidStr} on socket ${socket.id}`);
                return;
            }
            
            // Clean up old association if any (shouldn't differ, but kept for fallback cleanup)
            if (authenticatedUserId && authenticatedUserId !== uidStr) {
                if (userSockets.has(authenticatedUserId)) {
                    userSockets.get(authenticatedUserId).delete(socket.id);
                }
            }
            
            authenticatedUserId = uidStr;
            if (!userSockets.has(authenticatedUserId)) {
                userSockets.set(authenticatedUserId, new Set());
            }
            userSockets.get(authenticatedUserId).add(socket.id);
            console.log(`Socket ${socket.id} explicitly verified register-user for ${authenticatedUserId}`);
        });

        socket.on("disconnect", () => {
            console.log("Socket disconnected:", socket.id);
            if (authenticatedUserId && userSockets.has(authenticatedUserId)) {
                userSockets.get(authenticatedUserId).delete(socket.id);
                if (userSockets.get(authenticatedUserId).size === 0) {
                    userSockets.delete(authenticatedUserId);
                }
            } else {
                // Scan just in case user registers without our local var reference updating
                for (const [uid, sockets] of userSockets.entries()) {
                    if (sockets.has(socket.id)) {
                        sockets.delete(socket.id);
                        if (sockets.size === 0) {
                            userSockets.delete(uid);
                        }
                        break;
                    }
                }
            }
        });
    });

    return io;
};

export const sendSocketNotification = (userId, notificationData) => {
    if (!io) {
        console.error("Socket.io has not been initialized yet!");
        return;
    }
    
    const uidStr = String(userId);
    const sockets = userSockets.get(uidStr);
    
    if (sockets && sockets.size > 0) {
        sockets.forEach((socketId) => {
            io.to(socketId).emit("new-notification", notificationData);
        });
        console.log(`Socket notification successfully pushed to user ${uidStr} (active sockets: ${sockets.size})`);
    } else {
        console.log(`User ${uidStr} has no active socket connections. Realtime notification deferred.`);
    }
};

export { io };
