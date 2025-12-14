import { useState } from 'react';
import { TEMPLATES, type SectionTemplateDef } from '../templates';
import { Button } from '../../../components/ui/Button';
import { Loader2, Plus, X } from 'lucide-react';
import { SectionContainer } from './SectionContainer';
import type { Section } from '../../../types';

interface SectionListProps {
    sections: Section[];
    loading: boolean;
    onCreateSection: (data: { title: string; type: string; content?: any }) => Promise<Section | undefined>;
    onUpdateSection: (id: string, updates: Partial<Section>) => Promise<void>;
    onDeleteSection: (id: string) => Promise<void>;
}

/**
 * Component to list all sections for a Knowledge Base.
 * Allows creating new sections from templates.
 * State is managed by the parent to ensure Quick Nav synchronization.
 */
export function SectionList({
    sections,
    loading,
    onCreateSection,
    onUpdateSection,
    onDeleteSection
}: SectionListProps) {
    const [isAdding, setIsAdding] = useState(false);

    const handleAddStart = () => setIsAdding(true);
    const handleAddCancel = () => setIsAdding(false);

    const getUniqueTitle = (baseTitle: string) => {
        let title = baseTitle;
        let counter = 1;

        const isTitleTaken = (t: string) => sections.some(s => s.title.toLowerCase() === t.toLowerCase());

        // If the base title is taken, try adding numbers until we find a unique one
        // Check "Custom Section", then "Custom Section 1", "Custom Section 2", etc.
        if (isTitleTaken(title)) {
            while (isTitleTaken(`${baseTitle} ${counter}`)) {
                counter++;
            }
            title = `${baseTitle} ${counter}`;
        }

        return title;
    };

    const handleAddType = async (template: SectionTemplateDef) => {
        try {
            setIsAdding(false);

            // Determine effective title
            // For 'custom', we enforce uniqueness logic specifically requested by user ("Custom Section 1", etc.)
            // For other types, we generally stick to the template label, but let's apply the uniqueness check to all to be safe.
            const title = getUniqueTitle(template.label);

            await onCreateSection({
                title: title,
                type: template.type,
                content: template.isCollection ? { items: [] } : {}
            });
        } catch (error: any) {
            console.error("Failed to create section:", error);
            // Re-open the add menu so user can try again
            setIsAdding(true);
            alert(error.message || "Failed to create section. Check console for details.");
        }
    };

    const availableTypes = Object.values(TEMPLATES);

    if (loading) return <div className="py-8 text-center text-slate-500"><Loader2 className="animate-spin h-6 w-6 mx-auto" /> Loading sections...</div>;

    return (
        <div className="space-y-6">
            {sections.map((section) => (
                <SectionContainer
                    key={section.id}
                    section={section}
                    onUpdate={onUpdateSection}
                    onDelete={onDeleteSection}
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
