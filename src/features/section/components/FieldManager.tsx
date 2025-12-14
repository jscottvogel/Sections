import { useState } from 'react';
import type { FieldDefinition } from '../templates';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Plus, Trash2, Settings } from 'lucide-react';

interface FieldManagerProps {
    customFields: FieldDefinition[];
    onFieldsChange: (fields: FieldDefinition[]) => void;
}

export function FieldManager({ customFields, onFieldsChange }: FieldManagerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [newField, setNewField] = useState<Partial<FieldDefinition>>({
        type: 'text',
        required: false
    });

    const handleAdd = () => {
        if (!newField.name || !newField.label) return;

        // Ensure unique name (simple check)
        const name = newField.name.toLowerCase().replace(/\s+/g, '_');
        if (customFields.some(f => f.name === name)) {
            alert('Field name must be unique');
            return;
        }

        const field: FieldDefinition = {
            name,
            label: newField.label,
            type: newField.type as any || 'text',
            required: false, // Default to optional for custom fields
        };

        onFieldsChange([...customFields, field]);
        setNewField({ type: 'text', required: false }); // Reset but keep defaults
    };

    const handleRemove = (name: string) => {
        onFieldsChange(customFields.filter(f => f.name !== name));
    };

    if (!isOpen) {
        return (
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(true)} className="mt-2">
                <Settings className="w-3 h-3 mr-2" />
                Manage Custom Fields
            </Button>
        );
    }

    return (
        <div className="mt-4 p-4 border border-slate-200 rounded-lg bg-slate-50">
            <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium text-sm text-slate-700">Custom Fields</h4>
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>Close</Button>
            </div>

            <div className="space-y-3 mb-4">
                {customFields.map(field => (
                    <div key={field.name} className="flex items-center justify-between text-sm bg-white p-2 border rounded">
                        <span>{field.label} <span className="text-slate-400 text-xs">({field.type})</span></span>
                        <Button variant="ghost" size="sm" onClick={() => handleRemove(field.name)} className="text-red-500 h-6 w-6 p-0 hover:text-red-700">
                            <Trash2 className="w-3 h-3" />
                        </Button>
                    </div>
                ))}
                {customFields.length === 0 && <p className="text-xs text-slate-500 italic">No custom fields added.</p>}
            </div>

            <div className="flex gap-2 items-end border-t border-slate-200 pt-3">
                <div className="flex-1 space-y-1">
                    <label className="text-xs font-medium text-slate-600">Label</label>
                    <Input
                        placeholder="e.g. Team Size"
                        value={newField.label || ''}
                        onChange={e => {
                            const label = e.target.value;
                            // Auto-generate name from label if name is empty or matches previous auto-gen
                            const name = label.toLowerCase().replace(/[^a-z0-9]/g, '_');
                            setNewField(prev => ({ ...prev, label, name }));
                        }}
                    />
                </div>
                <div className="w-32 space-y-1">
                    <label className="text-xs font-medium text-slate-600">Type</label>
                    <select
                        className="w-full h-10 px-3 py-2 text-sm rounded-md border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={newField.type}
                        onChange={e => setNewField(prev => ({ ...prev, type: e.target.value as any }))}
                    >
                        <option value="text">Text</option>
                        <option value="textarea">Textarea</option>
                        <option value="date">Date</option>
                        <option value="url">URL</option>
                        <option value="checkbox">Checkbox</option>
                    </select>
                </div>
                <Button onClick={handleAdd} disabled={!newField.label}>
                    <Plus className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}
