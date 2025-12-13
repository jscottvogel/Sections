import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function Layout() {
    return (
        <div className="flex h-screen w-full overflow-hidden bg-gray-50">
            <Sidebar />
            <main className="flex-1 overflow-hidden flex flex-col">
                <Outlet />
            </main>
        </div>
    );
}
