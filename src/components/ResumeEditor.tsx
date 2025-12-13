import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { client } from '../client';
import { useReactToPrint } from 'react-to-print';
import type { Schema } from '../../amplify/data/resource';
import { Save, FileText } from 'lucide-react';

type Resume = Schema['Resume']['type'];
type Section = Schema['Section']['type'];



export function ResumeEditor() {
    const { id } = useParams<{ id: string }>();
    const [resume, setResume] = useState<Resume | null>(null);
    const [sections, setSections] = useState<Section[]>([]);
    const [activeSectionId, _setActiveSectionId] = useState<string | null>(null);
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



    if (loading) return <div className="p-10">Loading editor...</div>;
    if (!resume) return <div className="p-10">Resume not found</div>;

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-gray-50">


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
