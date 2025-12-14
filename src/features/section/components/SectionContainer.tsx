import { useState } from 'react';
import type { Section } from '../../../types';
import { TEMPLATES } from '../templates';
import { SingletonEditor } from './SingletonEditor';
import { CollectionEditor } from './CollectionEditor';
import { SectionExporter } from '../../../utils/SectionExporter';
import { Button } from '../../../components/ui/Button';
import { Trash2, ChevronDown, ChevronUp, Download } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';

interface SectionContainerProps {
    section: Section;
    onUpdate: (id: string, data: Partial<Section>) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
}

export function SectionContainer({ section, onUpdate, onDelete }: SectionContainerProps) {
    const [expanded, setExpanded] = useState(true);
    const template = TEMPLATES[section.type as keyof typeof TEMPLATES] || TEMPLATES.custom;

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this specific section?')) {
            await onDelete(section.id);
        }
    };

    const handleUpdateSection = async (updates: Partial<Section>) => {
        try {
            await onUpdate(section.id, updates);
        } catch (error) {
            console.error("Failed to update section:", error);
            alert("Failed to save. Please try again.");
        }
    };

    return (
        <Card id={section.id} className="overflow-hidden transition-all duration-200 border-slate-200">
            <CardHeader className="bg-slate-50 border-b border-slate-100 py-3 px-4 flex flex-row items-center justify-between cursor-pointer" onClick={() => setExpanded(!expanded)}>
                <div className="flex items-center gap-3">
                    {expanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                    <CardTitle className="text-base font-medium text-slate-800">{section.title}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-indigo-600 h-8 w-8 p-0" title="Export to PDF" onClick={(e) => { e.stopPropagation(); SectionExporter.export(section); }}>
                        <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-600 h-8 w-8 p-0" onClick={(e) => { e.stopPropagation(); handleDelete(); }}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            {expanded && (
                <CardContent className="p-4 bg-white">
                    {template.isCollection ? (
                        <CollectionEditor
                            section={section}
                            template={template}
                            onUpdate={(content) => handleUpdateSection({ content })}
                        />
                    ) : (
                        <SingletonEditor
                            section={section}
                            template={template}
                            onUpdate={handleUpdateSection}
                        />
                    )}
                </CardContent>
            )}
        </Card>
    );
}
