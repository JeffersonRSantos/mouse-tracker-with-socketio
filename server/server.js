const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Track connected users by room (pathname)
const rooms = new Map();

function getRoomUsers(pathname) {
    return rooms.get(pathname) || new Map();
}

function broadcastUserCount(pathname) {
    const roomUsers = getRoomUsers(pathname);
    io.to(pathname).emit('user-count-update', {
        count: roomUsers.size,
        users: Array.from(roomUsers.values())
    });
}

io.on('connection', (socket) => {
    console.log('User connected');
    let userData = null;
    let userRoom = null;

    socket.on('user-init', (data) => {
        userRoom = data.pathname;          
        userData = {
            userId: data.userId,
            userName: data.userName,
            color: data.color,
            pathname: data.pathname
        };

        // Join the room for this pathname
        socket.join(userRoom);

        // Initialize room if it doesn't exist
        if (!rooms.has(userRoom)) {
            rooms.set(userRoom, new Map());
        }

        // Add user to the room if no exists
        const roomUsers = getRoomUsers(userRoom); 
         if(roomUsers.has(userData.userId)){
            userData = roomUsers.get(userData.userId);
            console.log(`User ${userData.userName} exists in room ${userRoom}`);
        }else{
            roomUsers.set(userData.userId, userData);
            console.log(`User ${userData.userName} joined room ${userRoom}`);
        }
        rooms.set(userRoom, roomUsers);

        // Broadcast to other users in the same room that a new user has joined
        socket.to(userRoom).emit('user-joined', userData);

        // Broadcast updated user count to all users in the room
        broadcastUserCount(userRoom);
    });

    socket.on('element-click', (data) => {
        if (userRoom) {
            //save data on object to user room
            const roomUsers = getRoomUsers(userRoom);
            roomUsers.set(data.userId, {...userData, ...data, pathname: data.pathname, test: 123});
            rooms.set(userRoom, roomUsers);

            socket.to(userRoom).emit('element-click', data);
        }
    });

    socket.on('disconnect', () => {
        if (userData && userRoom) {
            console.log(`User ${userData.userName} disconnected from room ${userRoom}`);
            
            // Remove user from the room
            const roomUsers = getRoomUsers(userRoom);
            roomUsers.delete(userData.userId);
            
            // If room is empty, remove it
            if (roomUsers.size === 0) {
                rooms.delete(userRoom);
            } else {
                rooms.set(userRoom, roomUsers);
            }

            // Notify other clients in the same room about the disconnection
            socket.to(userRoom).emit('user-disconnected', userData);
            
            // Broadcast updated user count to the room
            broadcastUserCount(userRoom);
        }
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
