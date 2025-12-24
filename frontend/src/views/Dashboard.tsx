import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { LogViewer } from '../components/LogViewer';
// Styles for Recharts need to be handled via dependency usually, but since we can't easily npm install locally in this environment without blocking,
// we will assume user runs npm install or we use simple stats cards if charts fail.
// EDIT: User asked for stats. We will display stats cards first.

export const Dashboard = () => {
    const [stats, setStats] = useState<any>(null);

    const fetchStats = async () => {
        try {
            const baseUrl = window.location.host.includes(":5173") ? "http://localhost:1243" : "";
            const res = await axios.get(`${baseUrl}/api/stats`);
            setStats(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 10000); // Refresh every 10s
        return () => clearInterval(interval);
    }, []);

    const StatCard = ({ title, value, color }: any) => (
        <Card className="bg-black/20 border-white/10">
            <CardContent className="p-6">
                <div className="text-sm font-medium text-gray-400">{title}</div>
                <div className={`text-2xl font-bold mt-2 ${color}`}>{value || 0}</div>
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-3xl font-bold tracking-tight text-white/90">Dashboard</h2>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard title="Total Hunts" value={stats?.totalHunt} color="text-green-400" />
                <StatCard title="Total Battles" value={stats?.totalBattle} color="text-red-400" />
                <StatCard title="Gems Used" value={stats?.totalGemsUsed} color="text-blue-400" />
                <StatCard title="Zoo Count" value={Object.values(stats?.zooCount || {}).reduce((a: any, b: any) => a + b, 0)} color="text-purple-400" />
            </div>

            {/* Logs */}
            <div className="space-y-2">
                <h3 className="text-lg font-medium text-white/80">Live Logs</h3>
                <LogViewer />
            </div>

            {/* Zoo Detail */}
            <Card className="bg-black/20 border-white/10">
                <CardHeader><CardTitle>Zoo Collection</CardTitle></CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                        {Object.entries(stats?.zooCount || {}).map(([rarity, count]: any) => (
                            <div key={rarity} className="bg-black/40 p-2 rounded text-center border border-white/5">
                                <div className="text-xs text-gray-400 capitalize">{rarity}</div>
                                <div className="font-bold text-white">{count}</div>
                            </div>
                        ))}
                        {(Object.keys(stats?.zooCount || {}).length === 0) && <div className="text-gray-500 text-sm p-2 col-span-3">No animals caught yet.</div>}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
