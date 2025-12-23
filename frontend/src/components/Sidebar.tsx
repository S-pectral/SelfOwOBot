
import { NavLink } from 'react-router-dom';
import { Home, Settings, Terminal, Bot } from 'lucide-react'; // Import icons
import { cn } from '../lib/utils';

export const Sidebar = () => {
    const links = [
        { to: '/', icon: Home, label: 'Dashboard' },
        { to: '/settings', icon: Settings, label: 'Settings' },
        { to: '/logs', icon: Terminal, label: 'Logs' },
    ];

    return (
        <div className="flex h-screen w-64 flex-col border-r border-white/10 bg-surface">
            <div className="flex items-center justify-center p-6 border-b border-white/10">
                <Bot className="h-8 w-8 text-primary mr-2" />
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    SelfOwO
                </h1>
            </div>
            <nav className="flex-1 space-y-2 p-4">
                {links.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        className={({ isActive }) =>
                            cn(
                                "flex items-center space-x-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-primary text-white shadow-lg shadow-primary/25"
                                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                            )
                        }
                    >
                        <link.icon className="h-5 w-5" />
                        <span>{link.label}</span>
                    </NavLink>
                ))}
            </nav>
            <div className="p-4 border-t border-white/10">
                <div className="text-xs text-center text-gray-500">
                    SelfOwO Bot v1.0.0
                </div>
            </div>
        </div>
    );
};
