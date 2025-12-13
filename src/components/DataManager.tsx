import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { client } from '../client';
import type { Schema } from '../../amplify/data/resource';
import { FileText, Plus, Trash2, Save, X } from 'lucide-react';
import { SECTION_TEMPLATES } from '../constants';

type Section = Schema['Section']['type'];

export function DataManager() {
    const { category } = useParams<{ category: string }>();
    const [sections, setSections] = useState<Section[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<any>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!category) return;
        setEditingId(null);
        fetchSections();
    }, [category]);

    const fetchSections = async () => {
        if (!category) return;
        setLoading(true);
        const { data } = await client.models.Section.list({
            filter: { category: { eq: category } }
        });
        setSections(data);
        setLoading(false);
    };

    const handleCreate = async () => {
        if (!category) return;
        const title = prompt(`New ${category} Item Name:`);
        if (!title) return;

        // Use template if available, else empty object
        const template = SECTION_TEMPLATES[category] || {};

        const { data: newSection } = await client.models.Section.create({
            category,
            title,
            content: template
        });

        if (newSection) {
            setSections([...sections, newSection]);
            startEdit(newSection);
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (confirm("Delete this item permanently?")) {
            await client.models.Section.delete({ id });
            setSections(sections.filter(s => s.id !== id));
            if (editingId === id) setEditingId(null);
        }
    };

    const startEdit = (section: Section) => {
        setEditingId(section.id);
        setEditForm(section.content || {});
    };

    const handleSave = async () => {
        if (!editingId) return;
        const { data: updated } = await client.models.Section.update({
            id: editingId,
            content: editForm
        });
        if (updated) {
            setSections(sections.map(s => s.id === editingId ? updated : s));
            setEditingId(null);
        }
    };

    const renderFormFields = () => {
        // Simple Recursive Form or JSON text area for now
        // Enhancing this to be field-aware would be better, but generic text pointers for now
        return (
            <div className="space-y-4">
                {Object.keys(editForm).map(key => (
                    <div key={key} className="flex flex-col">
                        <label className="text-xs font-semibold uppercase text-gray-500 mb-1">{key}</label>
                        <input
                            className="p-2 border border-gray-300 rounded"
                            value={editForm[key]}
                            onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })}
                        />
                    </div>
                ))}
                {Object.keys(editForm).length === 0 && (
                    <div className="text-gray-400 italic">No fields in this template. Add fields via JSON or use a standard category.</div>
                )}
                {/* JSON Fallback/Edit */}
                <details className="mt-4">
                    <summary className="text-xs text-gray-400 cursor-pointer">Raw JSON</summary>
                    <textarea
                        className="w-full text-xs font-mono p-2 border border-gray-200 mt-2 h-32 rounded"
                        value={JSON.stringify(editForm, null, 2)}
                        onChange={(e) => {
                            try {
                                setEditForm(JSON.parse(e.target.value));
                            } catch (e) { }
                        }}
                    />
                </details>
            </div>
        );
    };

    return (
        <div className="p-8 max-w-5xl mx-auto h-full flex flex-col">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{category} Library</h1>
                    <p className="text-gray-500">Manage your data items for {category}</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                >
                    <Plus size={18} /> Add Item
                </button>
            </header>

            <div className="flex gap-8 flex-1 overflow-hidden">
                {/* List */}
                <div className="w-1/3 overflow-y-auto pr-2 space-y-2">
                    {loading && <div>Loading...</div>}
                    {sections.map(section => (
                        <div
                            key={section.id}
                            onClick={() => startEdit(section)}
                            className={`p-4 rounded-lg border cursor-pointer transition-all ${editingId === section.id ? 'border-indigo-500 bg-indigo-50 shadow-md' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
                        >
                            <div className="flex justify-between items-start">
                                <h3 className="font-semibold text-gray-800">{section.title}</h3>
                                <button onClick={(e) => handleDelete(e, section.id)} className="text-gray-400 hover:text-red-500 p-1"><Trash2 size={14} /></button>
                            </div>
                            <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                                {/* Preview some content */}
                                {Object.values(section.content || {}).join(', ')}
                            </div>
                        </div>
                    ))}
                    {sections.length === 0 && !loading && (
                        <div className="text-center p-8 border-2 border-dashed border-gray-200 rounded-lg text-gray-400">
                            No items yet.
                        </div>
                    )}
                </div>

                {/* Editor */}
                <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
                    {editingId ? (
                        <>
                            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <span className="font-semibold text-gray-700">Editing Item</span>
                                <div className="flex gap-2">
                                    <button onClick={() => setEditingId(null)} className="p-2 text-gray-500 hover:bg-gray-200 rounded"><X size={18} /></button>
                                    <button onClick={handleSave} className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700"><Save size={16} /> Save</button>
                                </div>
                            </div>
                            <div className="p-6 overflow-y-auto flex-1">
                                {renderFormFields()}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-300">
                            <FileText size={48} className="mb-4 opacity-20" />
                            <p>Select an item to edit details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
