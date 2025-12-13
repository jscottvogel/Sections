import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { client } from '../client';
import type { Schema } from '../../amplify/data/resource';
import { Plus, Loader2, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

type Resume = Schema['Resume']['type'];

export function ResumeDashboard() {
    const navigate = useNavigate();
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResumes = async () => {
            try {
                const { data } = await client.models.Resume.list({});
                setResumes(data);
                setLoading(false);
            } catch (e) {
                console.error(e);
                setLoading(false);
            }
        };
        fetchResumes();
    }, []);

    const createResume = async () => {
        const title = prompt('Resume Title:');
        if (!title) return;

        try {
            const { data: newResume } = await client.models.Resume.create({
                title,
                description: 'New Resume',
                isMain: false,
            });
            if (newResume) {
                navigate(`/resume/${newResume.id}`);
            }
        } catch (e) {
            console.error('Creation failed', e);
            alert('Failed to create resume (Backend might be unreachable)');
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <header className="flex justify-between items-center mb-12">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Your Resumes</h1>
                    <p className="text-gray-500 mt-2">Manage and edit your professional profiles</p>
                </div>
                <button
                    onClick={createResume}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 font-medium"
                >
                    <Plus size={20} /> New Resume
                </button>
            </header>

            {loading ? (
                <div className="flex justify-center h-64 items-center">
                    <Loader2 className="animate-spin text-indigo-600" size={48} />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {resumes.map((resume) => (
                        <motion.div
                            key={resume.id}
                            onClick={() => navigate(`/resume/${resume.id}`)}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ y: -5 }}
                            className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-xl transition-all cursor-pointer group"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                    <FileText size={24} />
                                </div>
                                <span className="text-xs font-mono text-gray-400">{resume.createdAt?.slice(0, 10)}</span>
                            </div>
                            <h2 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors">{resume.title}</h2>
                            <p className="text-sm text-gray-500 line-clamp-2">{resume.description || 'No description'}</p>
                        </motion.div>
                    ))}

                    {resumes.length === 0 && (
                        <div className="col-span-full text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                            <p className="text-gray-500 mb-4">No resumes found. Create your first one!</p>
                            <button onClick={createResume} className="text-indigo-600 font-medium hover:underline">Create Resume</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
