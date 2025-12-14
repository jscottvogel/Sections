import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useKnowledgeBase } from '../hooks/useKnowledgeBase';
import { useSections } from '../../section/hooks/useSections';
import { Button } from '../../../components/ui/Button';
import { Loader2, ArrowLeft, Save, Code, AlertTriangle } from 'lucide-react';
import { SectionList } from '../../section/components/SectionList';

export function KnowledgeBaseDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { knowledgeBase, loading: kbLoading } = useKnowledgeBase(id);
    const { sections, createSection, updateSection, deleteSection } = useSections(id);

    const [viewMode, setViewMode] = useState<'visual' | 'json'>('visual');
    const [jsonContent, setJsonContent] = useState('');
    const [isSyncing, setIsSyncing] = useState(false);

    // Update JSON content when switching to JSON mode or when sections change (if not currently editing)
    useEffect(() => {
        if (viewMode === 'visual') {
            setJsonContent(JSON.stringify(sections, null, 2));
        }
    }, [sections, viewMode]);

    const handleJsonSave = async () => {
        try {
            setIsSyncing(true);
            const newSections = JSON.parse(jsonContent);
            if (!Array.isArray(newSections)) throw new Error("JSON must be an array of section objects.");

            const currentIds = new Set(sections.map(s => s.id));
            const newIds = new Set(newSections.map((s: any) => s.id).filter(Boolean));

            // 1. Delete removed sections
            const toDelete = sections.filter(s => !newIds.has(s.id));
            await Promise.all(toDelete.map(s => deleteSection(s.id)));

            // 2. Update existing and Create new
            await Promise.all(newSections.map(async (s: any) => {
                if (s.id && currentIds.has(s.id)) {
                    // Update: Only if it exists in current. 
                    // Note: We need to separate content (JSON) from other fields if we want to be precise,
                    // but updateSection handles parsing.
                    // Ideally we should diff, but for now we push the update.
                    const { id, createdAt, updatedAt, ...updates } = s;
                    await updateSection(id, updates);
                } else {
                    // Create: No ID or ID not found (new Custom ID? No, Amplify assigns IDs usually, but let's see)
                    // If the user provides an ID that doesn't exist in DB, we treat it as a new section 
                    // and let Backend assign a real ID. We ignore the provided fake ID.
                    const { id, createdAt, updatedAt, ...creationData } = s;
                    await createSection(creationData);
                }
            }));

            // Switch back to visual to see results
            setViewMode('visual');
        } catch (e: any) {
            alert(`Failed to sync JSON: ${e.message}`);
        } finally {
            setIsSyncing(false);
        }
    };

    if (kbLoading) {
        return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-indigo-600" /></div>;
    }

    if (!knowledgeBase || !id) {
        return (
            <div className="text-center py-12">
                <h2 className="text-xl font-semibold text-slate-800">Knowledge Base Not Found</h2>
                <Button onClick={() => navigate('/')} variant="ghost" className="mt-4">Back to Dashboard</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">{knowledgeBase.title}</h1>
                        <p className="text-slate-500">{knowledgeBase.description}</p>
                    </div>
                </div>
                <div className="flex items-center bg-slate-100 p-1 rounded-lg">
                    <button
                        onClick={() => setViewMode('visual')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'visual' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Visual
                    </button>
                    <button
                        onClick={() => {
                            setJsonContent(JSON.stringify(sections, null, 2));
                            setViewMode('json');
                        }}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'json' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <Code className="w-4 h-4 inline mr-1.5" />
                        JSON
                    </button>
                </div>
            </div>

            {viewMode === 'json' ? (
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-200px)]">
                    <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                        <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-md text-sm border border-amber-200">
                            <AlertTriangle className="h-4 w-4" />
                            <span><strong>Warning:</strong> Modifying IDs or structure may cause data loss. Deleting an item here deletes it permanently.</span>
                        </div>
                        <Button onClick={handleJsonSave} disabled={isSyncing}>
                            {isSyncing ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                            Sync Changes
                        </Button>
                    </div>
                    <textarea
                        className="flex-1 w-full p-4 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                        value={jsonContent}
                        onChange={(e) => setJsonContent(e.target.value)}
                        spellCheck={false}
                    />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-1 space-y-4">
                        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm sticky top-24">
                            <h3 className="font-semibold text-slate-700 mb-4">Quick Nav</h3>
                            {sections.length === 0 ? (
                                <p className="text-sm text-slate-400">Add sections to see them here.</p>
                            ) : (
                                <ul className="space-y-2">
                                    {sections.map(section => (
                                        <li key={section.id}>
                                            <a
                                                href={`#${section.id}`}
                                                className="text-sm text-slate-600 hover:text-indigo-600 hover:underline block truncate"
                                                title={section.title}
                                            >
                                                {section.title}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-3 space-y-8">
                        <SectionList
                            sections={sections}
                            loading={false}
                            onCreateSection={createSection}
                            onUpdateSection={updateSection}
                            onDeleteSection={deleteSection}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
