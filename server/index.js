const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGODB_CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to local MongoDB'))
    .catch((err) => console.log('connection error', err.message));

const authRoutes = require('./routes/authRoutes');
app.use('/api', authRoutes);

const server = http.createServer(app);

const io = socketIo(server, {
    cors: {
        origin: '*',
    }
});

const nameToSocketIdMap = new Map();
const socketIdToNameMap = new Map();

io.on('connection', (socket) => {
    console.log('A user connected', socket.id);

    socket.on('room:join', data => {
        const { room, name } = data;
        nameToSocketIdMap.set(name, socket.id);
        socketIdToNameMap.set(socket.id, name);
        io.to(room).emit('user:joined', { name, id: socket.id });
        socket.join(room);
        io.to(socket.id).emit('room:join', data);
    });

    socket.on('user:call', ({ to, offer }) => {
        io.to(to).emit('incoming:call', { from: socket.id, offer });
    });

    socket.on('call:accepted', ({ to, ans }) => {
        io.to(to).emit('call:accepted', { from: socket.id, ans });
    });

    socket.on('peer:nego:needed', ({ to, offer }) => {
        io.to(to).emit('peer:nego:needed', { from: socket.id, offer });
    });

    socket.on('peer:nego:done', ({ to, ans }) => {
        console.log("peer:nego:done", ans);
        io.to(to).emit('peer:nego:final', { from: socket.id, ans });
    })

    socket.on('send:message', ({to, message}) => {
        io.to(to).emit('receive:message', {from: socket.id, message});
    })

    socket.on('user-disconnected', ({to}) => {
        io.to(to).emit('user-disconnected', {from: socket.id});
    })

});

server.listen(port, () => {
    console.log(`server running on ${port}`);
});