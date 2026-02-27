import { useState, useEffect } from 'react';
import { usePollContext } from '../context/PollContext';

export const usePollTimer = () => {
    const { poll } = usePollContext();
    const [timeLeft, setTimeLeft] = useState<number>(0);

    useEffect(() => {
        if (!poll || poll.status !== 'active') {
            setTimeLeft(0);
            return;
        }

        const { startTime, duration } = poll;
        // Server time calculation for resilience 
        const startMs = new Date(startTime).getTime();
        const durationMs = duration * 1000;

        const calculateTimeLeft = () => {
            const now = Date.now();
            const endMs = startMs + durationMs;
            const remaining = Math.max(0, Math.floor((endMs - now) / 1000));
            return remaining;
        };

        // Initial calculation
        setTimeLeft(calculateTimeLeft());

        // Update every second
        const interval = setInterval(() => {
            const remaining = calculateTimeLeft();
            setTimeLeft(remaining);

            if (remaining <= 0) {
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [poll]);

    return timeLeft;
};
