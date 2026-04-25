import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

let users = {};

io.on('connection', (socket) => {

    socket.on('join', (username) => {
        users[socket.id] = username;

        socket.broadcast.emit('user joined', username);
        io.emit('online users', users);
    });

    socket.on('chat message', (msg) => {
        io.emit('chat message', {
            user: users[socket.id],
            message: msg,
            id: socket.id,
            time: new Date().toLocaleTimeString()
        });
    });

    socket.on('typing', () => {
        socket.broadcast.emit('typing', users[socket.id]);
    });

    socket.on('stop typing', () => {
        socket.broadcast.emit('stop typing', users[socket.id]);
    });

    socket.on('disconnect', () => {
        const username = users[socket.id];
        delete users[socket.id];

        io.emit('online users', users);
        socket.broadcast.emit('user left', username);
    });
});

server.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});