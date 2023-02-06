// Carlos Arellano - 101339585
require('dotenv').config()
const Msg = require('./models/Messages');
const messageForm = require('./utils/messages');
const {userJoin, getCurrentUser, leaveRoom, getRoomUsers} = require('./utils/users');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const mongoose = require('mongoose');
const express = require('express');
const app = express();
app.use(express.json())
const server = http.createServer(app);
const io = socketio(server);

const PORT = 8083 || process.env.PORT

// Mongoose connection
mongoose.set("strictQuery", false);
mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(success => {
  console.log('Success Mongodb connection')
}).catch(err => {
  console.log('Error Mongodb connection')
});

// Static folder
app.use(express.static(path.join(__dirname, 'public')));

const admin = 'Admin';

// If client connected
io.on('connection', (socket) => {
    Msg.find().then((result) => {
        socket.emit('output-messages', result);
    })

    socket.on('joinRoom', ({ username, room }) => {
        
        const user = userJoin(socket.id, username, room);
        
        //join user
        socket.join(user.room);
        // Welcome message
        socket.emit('message', messageForm(admin, 'Welcome to lab test 1'));
        // Broadcast user connected
        socket.broadcast.to(user.room).emit('message', messageForm(admin, `${user.username} has joined the room`));
        // users and room info
        io.to(user.room).emit("roomUsers", {room: user.room, users: getRoomUsers(user.room),});
        
        
    });

    // User disconnected
    socket.on('disconnect', () => {
        
        const user = leaveRoom(socket.id);
        if (user) {
            io.to(user.room).emit("message", messageForm(admin, `${user.username} has left the chat`)
            );
      // Send users and room info
            io.to(user.room).emit("roomUsers", {
                room: user.room, users: getRoomUsers(user.room),
            });
        }
    });

    // roomMessage
    socket.on('roomMessage', (msg) => {
        const message = new Msg({ msg });
        message.save().then(() => {
            const user = getCurrentUser(socket.id);
            //send message to everybody
            io.to(user.room).emit('message', messageForm(user.username, msg));
            
        });
       
    })
});



server.listen(PORT, () => { console.log(`Server running on port ${PORT}`) });