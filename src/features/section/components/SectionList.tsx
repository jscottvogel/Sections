import { useState } from 'react';
import type { Section } from '../../../types';
import { useSections } from '../hooks/useSections';
import { TEMPLATES, type SectionTemplateDef } from '../templates';
import { Button } from '../../components/ui/Button';
import { Loader2, Plus, X } from 'lucide-react';
import { SectionContainer } from './SectionContainer';

interface SectionListProps {
    knowledgeBaseId: string;
}

export function SectionList({ knowledgeBaseId }: SectionListProps) {
    const { sections, loading, createSection, updateSection, deleteSection } = useSections(knowledgeBaseId);
    const [isAdding, setIsAdding] = useState(false);

    const handleAddStart = () => setIsAdding(true);
    const handleAddCancel = () => setIsAdding(false);

    const handleAddType = async (template: SectionTemplateDef) => {
        setIsAdding(false);
        await createSection({
            title: template.label,
            type: template.type,
            content: template.isCollection ? { items: [] } : {}
        });
    };

    const availableTypes = Object.values(TEMPLATES);

    if (loading) return <div className="py-8 text-center text-slate-500"><Loader2 className="animate-spin h-6 w-6 mx-auto" /> Loading sections...</div>;

    return (
        <div className="space-y-6">
            {sections.map((section) => (
                <SectionContainer
                    key={section.id}
                    section={section}
                    onUpdate={updateSection}
                    onDelete={deleteSection}
                />
            ))}

            {isAdding ? (
                <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">Choose Section Type</h3>
                        <Button variant="ghost" size="sm" onClick={handleAddCancel}><X className="h-4 w-4" /></Button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {availableTypes.map(t => (
                            <Button
                                key={t.type}
                                variant="secondary"
                                className="justify-start h-auto py-3 px-4 flex-col items-start gap-1"
                                onClick={() => handleAddType(t)}
                            >
                                <span className="font-medium">{t.label}</span>
                                <span className="text-xs text-slate-500 font-normal text-left">{t.description}</span>
                            </Button>
                        ))}
                    </div>
                </div>
            ) : (
                <Button onClick={handleAddStart} variant="outline" className="w-full border-dashed h-12">
                    <Plus className="mr-2 h-4 w-4" /> Add Section
                </Button>
            )}
        </div>
    );
}
