import { useState, useRef, useEffect } from 'react';
import type { Section } from '../../../types';
import { TEMPLATES } from '../templates';
import { SingletonEditor } from './SingletonEditor';
import { CollectionEditor } from './CollectionEditor';
import { SectionExporter } from '../../../utils/SectionExporter';
import { Button } from '../../../components/ui/Button';
import { Trash2, ChevronDown, ChevronUp, Download, Pencil, Check } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';

interface SectionContainerProps {
    section: Section;
    onUpdate: (id: string, data: Partial<Section>) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
}

export function SectionContainer({ section, onUpdate, onDelete }: SectionContainerProps) {
    const [expanded, setExpanded] = useState(true);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [titleDraft, setTitleDraft] = useState(section.title);
    const titleInputRef = useRef<HTMLInputElement>(null);

    const template = TEMPLATES[section.type as keyof typeof TEMPLATES] || TEMPLATES.custom;

    useEffect(() => {
        if (isEditingTitle && titleInputRef.current) {
            titleInputRef.current.focus();
        }
    }, [isEditingTitle]);

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this specific section?')) {
            await onDelete(section.id);
        }
    };

    const handleUpdateSection = async (updates: Partial<Section>) => {
        try {
            await onUpdate(section.id, updates);
        } catch (error: any) {
            console.error("Failed to update section:", error);
            alert(error.message || "Failed to save. Please try again.");
        }
    };

    const handleTitleSave = async () => {
        if (titleDraft.trim() !== section.title) {
            await handleUpdateSection({ title: titleDraft });
        }
        setIsEditingTitle(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleTitleSave();
        if (e.key === 'Escape') {
            setTitleDraft(section.title);
            setIsEditingTitle(false);
        }
    };

    return (
        <Card id={section.id} className="overflow-hidden transition-all duration-200 border-slate-200">
            <CardHeader className="bg-slate-50 border-b border-slate-100 py-3 px-4 flex flex-row items-center justify-between cursor-pointer" onClick={() => !isEditingTitle && setExpanded(!expanded)}>
                <div className="flex items-center gap-3 flex-1">
                    {expanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}

                    {isEditingTitle ? (
                        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                            <Input
                                ref={titleInputRef}
                                value={titleDraft}
                                onChange={e => setTitleDraft(e.target.value)}
                                onBlur={handleTitleSave}
                                onKeyDown={handleKeyDown}
                                className="h-8 py-1 px-2 text-base font-medium"
                            />
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onMouseDown={e => e.preventDefault()} onClick={handleTitleSave}>
                                <Check className="h-4 w-4 text-green-600" />
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 group">
                            <CardTitle className="text-base font-medium text-slate-800">{section.title}</CardTitle>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-slate-600"
                                onClick={(e) => { e.stopPropagation(); setIsEditingTitle(true); setTitleDraft(section.title); }}
                                title="Rename Section"
                            >
                                <Pencil className="h-3 w-3" />
                            </Button>
                        </div>
                    )}
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
