import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { client } from '../client';
import type { Schema } from '../../amplify/data/resource';
import { ChevronRight, ChevronDown, FileText, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DEFAULT_SECTIONS, SECTION_TEMPLATES } from '../constants';

type Resume = Schema['Resume']['type'];
type Section = Schema['Section']['type'];

export function Sidebar() {
    const navigate = useNavigate();
    const { id: activeResumeId } = useParams();
    const location = useLocation();


    const [resumes, setResumes] = useState<Resume[]>([]);
    const [expandedResumes, setExpandedResumes] = useState<Set<string>>(new Set());
    const [sectionsMap, setSectionsMap] = useState<Record<string, Section[]>>({});

    useEffect(() => {
        const sub = client.models.Resume.observeQuery().subscribe({
            next: ({ items }) => {
                setResumes(items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
            }
        });
        return () => sub.unsubscribe();
    }, []);

    // Auto-expand active resume
    useEffect(() => {
        if (activeResumeId) {
            setExpandedResumes(prev => {
                const newSet = new Set(prev);
                newSet.add(activeResumeId);
                return newSet;
            });
            fetchSections(activeResumeId);
        }
    }, [activeResumeId]);

    const fetchSections = async (resumeId: string) => {
        const { data: sections } = await client.models.Section.list({
            filter: { resumeId: { eq: resumeId } }
        });
        const sorted = sections.sort((a, b) => (a.order || 0) - (b.order || 0));
        setSectionsMap(prev => ({ ...prev, [resumeId]: sorted }));
    };

    const toggleExpand = (resumeId: string) => {
        setExpandedResumes(prev => {
            const newSet = new Set(prev);
            if (newSet.has(resumeId)) {
                newSet.delete(resumeId);
            } else {
                newSet.add(resumeId);
                fetchSections(resumeId);
            }
            return newSet;
        });
    };

    const addSection = async (resumeId: string) => {
        const title = prompt("Section Name (or type 'Standard' for defaults)");
        if (!title) return;

        // Check if it's one of the standard ones for auto-template
        const template = SECTION_TEMPLATES[title] || {};

        // Find current max order
        const currentSections = sectionsMap[resumeId] || [];
        const maxOrder = currentSections.reduce((max, s) => Math.max(max, s.order || 0), -1);

        try {
            const { data: newSection } = await client.models.Section.create({
                resumeId,
                title,
                type: template ? 'standard' : 'custom',
                order: maxOrder + 1,
                content: template
            });
            if (newSection) {
                // Refresh sections
                fetchSections(resumeId);
                navigate(`/resume/${resumeId}/section/${newSection.id}`);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const deleteSection = async (e: React.MouseEvent, sectionId: string, resumeId: string) => {
        e.stopPropagation();
        if (!confirm("Delete section?")) return;
        await client.models.Section.delete({ id: sectionId });
        fetchSections(resumeId);
    };

    const deleteResume = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (confirm("Delete this resume?")) {
            await client.models.Resume.delete({ id });
            if (activeResumeId === id) navigate('/');
        }
    };

    const createResume = async () => {
        const title = prompt("Resume Title");
        if (title) {
            const { data: newResume } = await client.models.Resume.create({ title, description: 'New Resume', isMain: false });
            if (newResume) {
                // Auto-create default sections
                await Promise.all(DEFAULT_SECTIONS.map((t, i) =>
                    client.models.Section.create({
                        resumeId: newResume.id,
                        title: t,
                        type: 'standard',
                        order: i,
                        content: SECTION_TEMPLATES[t] || {}
                    })
                ));
                navigate(`/resume/${newResume.id}`);
            }
        }
    }

    return (
        <aside className="w-64 bg-gray-900 text-gray-300 flex flex-col h-screen border-r border-gray-800">
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                <span className="font-semibold text-white tracking-wide">Resumes</span>
                <button onClick={createResume} className="p-1 hover:bg-gray-800 rounded text-white"><Plus size={16} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
                {resumes.map(resume => (
                    <div key={resume.id} className="mb-1">
                        <div
                            className={`flex items-center group px-2 py-1.5 rounded cursor-pointer transition-colors ${activeResumeId === resume.id ? 'bg-indigo-900 text-white' : 'hover:bg-gray-800'}`}
                            onClick={() => navigate(`/resume/${resume.id}`)}
                        >
                            <button
                                onClick={(e) => { e.stopPropagation(); toggleExpand(resume.id); }}
                                className="p-0.5 hover:bg-gray-700 rounded mr-1"
                            >
                                {expandedResumes.has(resume.id) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </button>
                            <FileText size={14} className="mr-2 text-indigo-400" />
                            <span className="truncate text-sm flex-1">{resume.title}</span>

                            <div className="opacity-0 group-hover:opacity-100 flex items-center">
                                <button onClick={(e) => { e.stopPropagation(); addSection(resume.id); }} className="p-1 hover:text-green-400" title="Add Section"><Plus size={12} /></button>
                                <button onClick={(e) => deleteResume(e, resume.id)} className="p-1 hover:text-red-400" title="Delete Resume"><Trash2 size={12} /></button>
                            </div>
                        </div>

                        <AnimatePresence>
                            {expandedResumes.has(resume.id) && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="ml-6 border-l border-gray-700 pl-2 mt-1 space-y-0.5"
                                >
                                    {sectionsMap[resume.id]?.map(section => (
                                        <div
                                            key={section.id}
                                            className={`text-xs py-1 px-2 rounded cursor-pointer truncate flex justify-between group/item ${location.pathname.includes(section.id) ? 'bg-indigo-900 text-indigo-200' : 'hover:bg-gray-800 text-gray-400'}`}
                                            onClick={() => navigate(`/resume/${resume.id}/section/${section.id}`)}
                                        >
                                            <span className="truncate">{section.title}</span>
                                            <button
                                                onClick={(e) => deleteSection(e, section.id, resume.id)}
                                                className="opacity-0 group-hover/item:opacity-100 p-0.5 hover:text-red-400"
                                            >
                                                <Trash2 size={10} />
                                            </button>
                                        </div>
                                    ))}
                                    {(!sectionsMap[resume.id] || sectionsMap[resume.id].length === 0) && (
                                        <div className="text-xs text-gray-600 italic px-2">No sections</div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>

            <div className="p-4 border-t border-gray-800 text-xs text-gray-500">
                User: Authenticated
            </div>
        </aside>
    );
}
