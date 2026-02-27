import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';
import { usePollContext, type Poll, type Student } from '../context/PollContext';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5010';

export const useSocket = () => {
    const socketRef = useRef<Socket | null>(null);
    const { setPoll, setStudents, setError, role, studentName, sessionId, setKickedOut } = usePollContext();

    useEffect(() => {
        // Determine if we should connect
        if (!role) return;
        if (role === 'student' && (!studentName || !sessionId)) return;

        socketRef.current = io(SOCKET_URL);
        const socket = socketRef.current;

        socket.on('connect', () => {
            console.log('Connected to socket server');
            // Re-join with proper identity for state resilience
            socket.emit('join', { role, name: studentName, sessionId });
        });

        socket.on('poll_active', (activePoll: Poll) => {
            setPoll(activePoll);
        });

        socket.on('poll_updated', (updatedPoll: Poll) => {
            setPoll(updatedPoll);
        });

        socket.on('poll_closed', (closedPoll: Poll) => {
            setPoll(closedPoll);
        });

        socket.on('students_updated', (activeStudents: Student[]) => {
            setStudents(activeStudents);
        });

        socket.on('student_kicked', (data: { sessionId: string }) => {
            if (role === 'student' && sessionId === data.sessionId) {
                setKickedOut(true);
            }
        });

        socket.on('error', (err: { message: string }) => {
            setError(err.message);
            toast.error(err.message);
            // Auto clear error
            setTimeout(() => setError(null), 3000);
        });

        socket.on('connect_error', () => {
            toast.error('Connection failed! Trying to reconnect...', { id: 'conn_error' });
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from socket server');
            toast.error('Disconnected from real-time server', { id: 'disconnect' });
        });

        return () => {
            socket.disconnect();
        };
    }, [role, studentName, sessionId, setPoll, setStudents, setError, setKickedOut]);

    return socketRef.current;
};
