import { useEffect, useRef, useState } from 'react';

interface Log {
    timestamp: string;
    level: string;
    prefix: string;
    message: string;
}

export const LogViewer = () => {
    const [logs, setLogs] = useState<Log[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        // If developing locally with Vite (port 5173), we need to point to port 1243
        const wsUrl = host.includes(':5173')
            ? 'ws://localhost:1243/ws'
            : `${protocol}//${host}/ws`;

        const ws = new WebSocket(wsUrl);

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'LOG') {
                    setLogs(prev => [...prev.slice(-99), data.data]); // Keep last 100 logs
                }
            } catch (e) {
                console.error("Log parse error", e);
            }
        };

        return () => {
            ws.close();
        };
    }, []);

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [logs]);

    const getColors = (level: string) => {
        switch (level) {
            case 'INFO': return 'text-cyan-400';
            case 'SUCCESS': return 'text-green-400';
            case 'WARN': return 'text-yellow-400';
            case 'ERROR': return 'text-red-400';
            case 'DEBUG': return 'text-purple-400';
            default: return 'text-gray-300';
        }
    };

    return (
        <div ref={containerRef} className="bg-black/90 font-mono text-xs md:text-sm p-4 rounded-lg border border-white/10 h-64 overflow-y-auto shadow-inner scroll-smooth">
            {logs.map((log, i) => (
                <div key={i} className="mb-1 break-words">
                    <span className="text-gray-500 mr-2">[{log.timestamp}]</span>
                    <span className={`font-bold mr-2 ${getColors(log.level)}`}>[{log.prefix}]</span>
                    <span className="text-gray-300">{log.message}</span>
                </div>
            ))}
            {logs.length === 0 && <div className="text-gray-600 italic">Waiting for logs...</div>}
        </div>
    );
};
