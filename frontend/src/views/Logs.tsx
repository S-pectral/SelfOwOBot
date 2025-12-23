import { useLogs } from '../hooks/useLogs';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { useRef, useEffect } from 'react';

export const Logs = () => {
    const logs = useLogs();
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs]);

    return (
        <div className="h-full flex flex-col space-y-4">
            <h2 className="text-3xl font-bold tracking-tight text-white/90">Console Logs</h2>
            <Card className="flex-1 bg-black font-mono text-sm overflow-hidden flex flex-col border-white/10">
                <CardHeader className="py-3 px-4 border-b border-white/10 bg-white/5">
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-red-500" />
                        <div className="h-3 w-3 rounded-full bg-yellow-500" />
                        <div className="h-3 w-3 rounded-full bg-green-500" />
                    </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-auto p-4 space-y-1">
                    {logs.map((log, i) => (
                        <div key={i} className="text-gray-300 break-all hover:bg-white/5 p-0.5 rounded px-2">
                            <span className="text-blue-400 opacity-50 mr-2">$</span>
                            {log}
                        </div>
                    ))}
                    <div ref={bottomRef} />
                </CardContent>
            </Card>
        </div>
    );
};
