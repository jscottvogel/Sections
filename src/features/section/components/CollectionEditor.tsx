import { useState } from 'react';
import type { Section } from '../../../types';
import type { SectionTemplateDef, FieldDefinition } from '../templates';
import { GenericForm } from './GenericForm';
import { FieldManager } from './FieldManager';
import { Button } from '../../../components/ui/Button';
import { Plus, Pencil, Trash2 } from 'lucide-react';

interface CollectionEditorProps {
    section: Section;
    template: SectionTemplateDef;
    onUpdate: (content: any) => Promise<void>;
}

export function CollectionEditor({ section, template, onUpdate }: CollectionEditorProps) {
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [isAdding, setIsAdding] = useState(false);

    // Content is expected to be { items: [...], _customFields: [...] }
    const content = (section.content as any) || {};
    const items = content.items || [];
    const customFields = (content._customFields as FieldDefinition[]) || [];

    const handleSaveItem = async (data: any) => {
        const newItems = [...items];
        if (editingIndex !== null) {
            newItems[editingIndex] = data;
        } else {
            newItems.push(data);
        }
        await onUpdate({ ...content, items: newItems });
        setEditingIndex(null);
        setIsAdding(false);
    };

    const handleDeleteItem = async (index: number) => {
        const newItems = items.filter((_: any, i: number) => i !== index);
        await onUpdate({ ...content, items: newItems });
    };

    const handleFieldsChange = async (newFields: FieldDefinition[]) => {
        await onUpdate({ ...content, _customFields: newFields });
    };

    const allFields = [...template.fields, ...customFields];

    const getSummary = (item: any) => {
        // Try to find reasonable summary fields
        const title = item.role || item.institution || item.title || item.name || item.category || 'Item';
        const subtitle = item.company || item.degree || item.organization || item.issuer || '';
        const date = item.startDate ? `${item.startDate} - ${item.endDate || 'Present'}` : (item.date || '');
        return { title, subtitle, date };
    };

    if (isAdding || editingIndex !== null) {
        const initialValues = editingIndex !== null ? items[editingIndex] : {};
        return (
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h4 className="font-medium text-slate-800 mb-4">{editingIndex !== null ? 'Edit' : 'Add'} {template.itemLabel || 'Item'}</h4>
                <GenericForm
                    fields={allFields}
                    initialValues={initialValues}
                    onSubmit={handleSaveItem}
                    onCancel={() => { setIsAdding(false); setEditingIndex(null); }}
                />
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {items.length === 0 && (
                <p className="text-sm text-slate-500 italic">No {template.label.toLowerCase()} added yet.</p>
            )}

            {items.map((item: any, idx: number) => {
                const { title, subtitle, date } = getSummary(item);
                return (
                    <div key={idx} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-md shadow-sm hover:border-indigo-100 transition-colors group">
                        <div>
                            <div className="font-medium text-slate-800">{title}</div>
                            {(subtitle || date) && (
                                <div className="text-sm text-slate-500">
                                    {subtitle} {subtitle && date && '•'} {date}
                                </div>
                            )}
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="sm" onClick={() => setEditingIndex(idx)}>
                                <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-600" onClick={() => handleDeleteItem(idx)}>
                                <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>
                );
            })}

            <Button onClick={() => setIsAdding(true)} variant="secondary" size="sm" className="w-full mt-2">
                <Plus className="mr-2 h-3.5 w-3.5" /> Add {template.itemLabel || 'Item'}
            </Button>

            <div className="border-t pt-4 mt-4">
                <FieldManager
                    customFields={customFields}
                    onFieldsChange={handleFieldsChange}
                />
            </div>
        </div>
    );
}
