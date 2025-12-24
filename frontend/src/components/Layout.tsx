
import { Sidebar } from './Sidebar';
import { Outlet } from 'react-router-dom';

export const Layout = () => {
    return (
        <div className="flex h-screen w-full bg-background overflow-hidden relative">
            {/* Background blobs for aesthetics */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[120px] pointer-events-none" />

            <Sidebar />
            <main className="flex-1 overflow-auto p-4 relative z-10">
                <Outlet />
            </main>
        </div>
    );
};
