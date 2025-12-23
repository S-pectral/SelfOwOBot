import { useEffect, useState } from 'react';

export const useLogs = () => {
    const [logs, setLogs] = useState<string[]>([]);

    useEffect(() => {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        // In dev, vite runs on 5173 but backend on 1243. We need to connect to backend.
        // If in production (served by express), window.location.host is correct.
        // For logic, let's assume if localhost:5173, connect to localhost:1243.

        let host = window.location.host;
        if (host.includes(":5173")) {
            host = host.replace("5173", "1243");
        }

        const ws = new WebSocket(`${protocol}//${host}/ws`);

        ws.onopen = () => {
            console.log('Connected to WebSocket');
            // Request initial logs if needed? standard WS in this bot just streams.
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'log') {
                    setLogs(prev => [...prev, data.message].slice(-100)); // Keep last 100
                }
            } catch (e) {
                // If text message
                setLogs(prev => [...prev, event.data].slice(-100));
            }
        };

        return () => ws.close();
    }, []);

    return logs;
};
