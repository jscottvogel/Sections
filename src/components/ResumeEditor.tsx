import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { client } from '../client';
import { useReactToPrint } from 'react-to-print';
import type { Schema } from '../../amplify/data/resource';
import { GripVertical, Plus, ChevronLeft, Save, FileText } from 'lucide-react';

type Resume = Schema['Resume']['type'];
type Section = Schema['Section']['type'];

const DEFAULT_SECTIONS = [
    'Contact', 'Summary', 'Experience', 'Education',
    'Skills', 'Projects', 'Certifications', 'Awards'
];

export function ResumeEditor() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [resume, setResume] = useState<Resume | null>(null);
    const [sections, setSections] = useState<Section[]>([]);
    const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        const fetchResume = async () => {
            try {
                // Mock fetching for now if offline, or try real fetch
                const { data: r } = await client.models.Resume.get({ id });
                setResume(r);
                if (r) {
                    const { data: s } = await r.sections();
                    // Sort by order
                    setSections(s.sort((a: any, b: any) => (a.order || 0) - (b.order || 0)));
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchResume();
    }, [id]);

    const addSection = async (title: string, type: string = 'custom') => {
        if (!resume) return;
        const newOrder = sections.length;
        try {
            const { data: newSection } = await client.models.Section.create({
                resumeId: resume.id,
                title,
                type,
                order: newOrder,
                content: {}, // Empty JSON
            });
            if (newSection) {
                setSections([...sections, newSection]);
                setActiveSectionId(newSection.id);
            }
        } catch (e) {
            console.error('Failed to create section', e);
            // Optimistic update or alert
            alert('Failed to add section');
        }
    };

    if (loading) return <div className="p-10">Loading editor...</div>;
    if (!resume) return <div className="p-10">Resume not found</div>;

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-gray-50">
            {/* Sidebar - Sections List */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-100 flex items-center gap-2">
                    <button onClick={() => navigate('/')} className="p-1 hover:bg-gray-100 rounded">
                        <ChevronLeft size={20} />
                    </button>
                    <h2 className="font-semibold text-gray-800 truncate">{resume.title}</h2>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {sections.map(section => (
                        <div
                            key={section.id}
                            onClick={() => setActiveSectionId(section.id)}
                            className={`flex items-center gap-2 p-2 rounded cursor-pointer group ${activeSectionId === section.id ? 'bg-indigo-50 text-indigo-700 font-medium' : 'hover:bg-gray-50 text-gray-700'}`}
                        >
                            <GripVertical size={16} className="text-gray-300 group-hover:text-gray-400 cursor-move" />
                            <span className="truncate">{section.title}</span>
                        </div>
                    ))}

                    <div className="pt-4 px-2">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Add Section</p>
                        <div className="grid grid-cols-1 gap-1">
                            {DEFAULT_SECTIONS.filter(t => !sections.some(s => s.title === t)).map(title => (
                                <button
                                    key={title}
                                    onClick={() => addSection(title, 'standard')}
                                    className="text-left text-sm px-2 py-1 text-gray-600 hover:bg-gray-50 rounded flex items-center gap-2"
                                >
                                    <Plus size={14} /> {title}
                                </button>
                            ))}
                            <button
                                onClick={() => {
                                    const t = prompt('Section Name:');
                                    if (t) addSection(t, 'custom');
                                }}
                                className="text-left text-sm px-2 py-1 text-indigo-600 hover:bg-indigo-50 rounded flex items-center gap-2 font-medium"
                            >
                                <Plus size={14} /> Custom Section
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto p-8 relative">
                {activeSectionId ? (
                    <SectionEditor
                        section={sections.find(s => s.id === activeSectionId)!}
                        key={activeSectionId} // Re-mount on switch to reset state if needed
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-60">
                        <FileText size={64} strokeWidth={1} />
                        <p className="mt-4 text-lg">Select a section to edit</p>
                    </div>
                )}
            </main>
        </div>
    );
}

function SectionEditor({ section }: { section: Section }) {
    const [content, _setContent] = useState<any>(section.content || {}); // Use any for JSON
    const componentRef = useRef<HTMLDivElement>(null);
    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `${section.title}`,
    });

    return (
        <div className="max-w-3xl mx-auto bg-white min-h-[500px] shadow rounded-xl p-8" ref={componentRef}>
            <header className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 border-b-2 border-transparent focus:border-indigo-300 outline-none" contentEditable suppressContentEditableWarning>
                    {section.title}
                </h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => handlePrint && handlePrint()}
                        className="flex items-center gap-1 text-sm bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full hover:bg-gray-200 transition-colors"
                        data-html2canvas-ignore // If using other libs, but good practice
                    >
                        <FileText size={14} /> Export PDF
                    </button>
                    <button className="flex items-center gap-1 text-sm bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors">
                        <Save size={14} /> Save
                    </button>
                </div>
            </header>

            <div className="prose prose-indigo max-w-none">
                <textarea
                    className="w-full h-96 p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all resize-y print:border-none print:resize-none"
                    placeholder={`Enter content for ${section.title}...`}
                    defaultValue={typeof content === 'string' ? content : JSON.stringify(content, null, 2)}
                />
            </div>

            <div className="mt-8 p-4 bg-teal-50 rounded-lg border border-teal-100 print:hidden">
                <h4 className="flex items-center gap-2 text-teal-800 font-semibold mb-2">
                    ✨ AI Resume Coach
                </h4>
                <p className="text-sm text-teal-700 mb-3">
                    Your skills section looks brief. Consider adding specific technologies or certifications.
                </p>
                <button className="text-xs bg-white text-teal-700 border border-teal-200 px-3 py-1 rounded hover:bg-teal-50">
                    Fix Grammar
                </button>
            </div>
        </div>
    );
}
