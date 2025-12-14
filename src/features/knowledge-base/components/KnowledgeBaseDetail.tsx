import { useParams, useNavigate } from 'react-router-dom';
import { useKnowledgeBase } from '../hooks/useKnowledgeBase';
import { useSections } from '../../section/hooks/useSections';
import { Button } from '../../../components/ui/Button';
import { Loader2, ArrowLeft } from 'lucide-react';
import { SectionList } from '../../section/components/SectionList';

export function KnowledgeBaseDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { knowledgeBase, loading: kbLoading } = useKnowledgeBase(id);
    const { sections, createSection, updateSection, deleteSection } = useSections(id);

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
            <div className="flex items-center gap-4 border-b border-slate-200 pb-6">
                <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">{knowledgeBase.title}</h1>
                    <p className="text-slate-500">{knowledgeBase.description}</p>
                </div>
            </div>

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
                        knowledgeBaseId={id}
                        sections={sections}
                        loading={false} // useSections loading is already handled by parent check mostly, but being safe
                        onCreateSection={createSection}
                        onUpdateSection={updateSection}
                        onDeleteSection={deleteSection}
                    />
                </div>
            </div>
        </div>
    );
}
