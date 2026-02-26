import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { PollController } from './controllers/PollController.js';
import { handleSockets } from './sockets/PollSocketHandler.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

app.use(cors());
app.use(express.json());

// Routes
app.get('/api/polls/history', PollController.getHistory);
app.get('/api/students/active', PollController.getActiveStudents);

// Handle Socket.io connections
handleSockets(io);

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/live-polling';

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5010;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
