import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { client } from '../client';
import type { Schema } from '../../amplify/data/resource';
import { Loader2, FileText, Trash2, Pencil } from 'lucide-react';
import { motion } from 'framer-motion';
import { DEFAULT_SECTIONS, SECTION_TEMPLATES } from '../constants';

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
                // Auto-create default sections
                await Promise.all(DEFAULT_SECTIONS.map((title, index) =>
                    client.models.Section.create({
                        resumeId: newResume.id,
                        title,
                        type: 'standard',
                        order: index,
                        content: SECTION_TEMPLATES[title] || {}
                    })
                ));

                navigate(`/resume/${newResume.id}`);
            }
        } catch (e) {
            console.error('Creation failed', e);
            alert('Failed to create resume (Backend might be unreachable)');
        }
    };

    const deleteResume = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this resume?')) {
            try {
                await client.models.Resume.delete({ id });
                setResumes(resumes.filter((r: Resume) => r.id !== id));
            } catch (err) {
                console.error(err);
            }
        }
    };

    const renameResume = async (e: React.MouseEvent, resume: Resume) => {
        e.stopPropagation();
        const newTitle = prompt('New Title:', resume.title || '');
        if (!newTitle || newTitle === resume.title) return;

        try {
            const { data: updated } = await client.models.Resume.update({
                id: resume.id,
                title: newTitle
            });
            if (updated) {
                setResumes(resumes.map((r: Resume) => r.id === resume.id ? updated : r));
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div>
            <header className="mb-12">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Your Resumes</h1>
                    <p className="text-gray-500 mt-2">Manage and edit your professional profiles</p>
                </div>
            </header>
            {loading ? (
                <div className="flex justify-center h-64 items-center">
                    <Loader2 className="animate-spin text-indigo-600" size={48} />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {resumes.map((resume: Resume) => (
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
                                <div className="flex gap-2">
                                    <button
                                        onClick={(e) => renameResume(e, resume)}
                                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-gray-100 rounded-full transition-colors"
                                        title="Rename"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    <button
                                        onClick={(e) => deleteResume(e, resume.id)}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <h2 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors truncate">{resume.title}</h2>
                            <div className="flex justify-between items-end mt-4">
                                <p className="text-sm text-gray-500 line-clamp-2 flex-1">{resume.description || 'No description'}</p>
                                <span className="text-xs font-mono text-gray-300 ml-2 whitespace-nowrap">{resume.createdAt?.slice(0, 10)}</span>
                            </div>
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
