import { useNavigate, useLocation } from 'react-router-dom';
import { FileText, Briefcase, GraduationCap, Code, User, Award, Layers, Book, LayoutTemplate } from 'lucide-react';

const CATEGORIES = [
    { name: 'Summary', icon: User },
    { name: 'Experience', icon: Briefcase },
    { name: 'Education', icon: GraduationCap },
    { name: 'Skills', icon: Code },
    { name: 'Projects', icon: Layers },
    { name: 'Certifications', icon: Award },
    { name: 'Volunteering', icon: Book },
];

export function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <aside className="w-64 bg-gray-900 text-gray-300 flex flex-col h-screen border-r border-gray-800">
            <div className="p-4 border-b border-gray-800">
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Resume Builder</h2>
                <div
                    onClick={() => navigate('/')}
                    className={`flex items-center gap-3 px-3 py-2 rounded cursor-pointer transition-colors ${location.pathname === '/' ? 'bg-indigo-900 text-white' : 'hover:bg-gray-800'}`}
                >
                    <LayoutTemplate size={18} />
                    <span className="font-medium">All Resumes</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Data Library</h2>
                <div className="space-y-1">
                    {CATEGORIES.map(cat => (
                        <div
                            key={cat.name}
                            onClick={() => navigate(`/data/${cat.name}`)}
                            className={`flex items-center gap-3 px-3 py-2 rounded cursor-pointer transition-colors ${location.pathname.includes(`/data/${cat.name}`) ? 'bg-gray-800 text-white' : 'hover:bg-gray-800'}`}
                        >
                            <cat.icon size={18} className="text-gray-400" />
                            <span className="font-medium">{cat.name}</span>
                        </div>
                    ))}
                </div>

                <div className="mt-8">
                    <div
                        onClick={() => navigate(`/data/Custom`)}
                        className={`flex items-center gap-3 px-3 py-2 rounded cursor-pointer transition-colors ${location.pathname.includes('/data/Custom') ? 'bg-gray-800 text-white' : 'hover:bg-gray-800'}`}
                    >
                        <FileText size={18} className="text-gray-400" />
                        <span className="font-medium">Custom Sections</span>
                    </div>
                </div>
            </div>

            <div className="p-4 border-t border-gray-800 text-xs text-gray-500">
                Data First Mode
            </div>
        </aside>
    );
}
