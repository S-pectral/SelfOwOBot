import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Activity, Zap, Shield, Skull } from 'lucide-react';
import { useLogs } from '../hooks/useLogs';

export const Dashboard = () => {
    const logs = useLogs();
    const lastLogs = logs.slice(-5).reverse();

    const stats = [
        { label: 'Status', value: 'Running', icon: Activity, color: 'text-green-500' },
        { label: 'Auto Hunt', value: 'Active', icon: Zap, color: 'text-yellow-500' },
        { label: 'Auto Battle', value: 'Active', icon: Shield, color: 'text-blue-500' },
        { label: 'HuntBot', value: 'Idle', icon: Skull, color: 'text-red-500' },
    ];

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight text-white/90">Dashboard</h2>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => (
                    <Card key={index} className="bg-surface/50 backdrop-blur-md border-white/5">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-400">
                                {stat.label}
                            </CardTitle>
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{stat.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 bg-black/40 border-white/5">
                    <CardHeader>
                        <CardTitle>Recent Logs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 font-mono text-xs text-gray-300">
                            {lastLogs.map((log, i) => (
                                <div key={i} className="border-b border-white/5 pb-1 last:border-0">
                                    <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span> {log}
                                </div>
                            ))}
                            {lastLogs.length === 0 && <span className="text-gray-600">No recent logs...</span>}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
