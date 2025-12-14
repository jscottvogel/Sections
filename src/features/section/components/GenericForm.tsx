import { useState, useEffect } from 'react';
import type { FieldDefinition } from '../templates';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

interface GenericFormProps {
    fields: FieldDefinition[];
    initialValues?: Record<string, any>;
    onSubmit: (data: Record<string, any>) => void;
    onCancel?: () => void;
    submitLabel?: string;
}

export function GenericForm({ fields, initialValues = {}, onSubmit, onCancel, submitLabel = 'Save' }: GenericFormProps) {
    const [values, setValues] = useState<Record<string, any>>(initialValues);

    useEffect(() => {
        setValues(initialValues);
    }, [initialValues]);

    const handleChange = (name: string, value: any) => {
        setValues(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(values);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {fields.map((field) => (
                    <div key={field.name} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                        {field.type === 'textarea' ? (
                            <>
                                <label htmlFor={field.name} className="block text-sm font-medium text-slate-700 mb-1">
                                    {field.label} {field.required && <span className="text-red-500">*</span>}
                                </label>
                                <textarea
                                    id={field.name}
                                    className="flex min-h-[80px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder={field.placeholder}
                                    value={values[field.name] || ''}
                                    onChange={(e) => handleChange(field.name, e.target.value)}
                                    required={field.required}
                                />
                            </>
                        ) : field.type === 'checkbox' ? (
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id={field.name}
                                    checked={values[field.name] || false}
                                    onChange={(e) => handleChange(field.name, e.target.checked)}
                                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                                />
                                <label htmlFor={field.name} className="text-sm text-slate-700">{field.label}</label>
                            </div>
                        ) : (
                            <Input
                                id={field.name}
                                type={field.type}
                                label={field.required ? `${field.label} *` : field.label}
                                placeholder={field.placeholder}
                                value={values[field.name] || ''}
                                onChange={(e) => handleChange(field.name, e.target.value)}
                                required={field.required}
                                className="w-full"
                            />
                        )}
                    </div>
                ))}
            </div>
            <div className="flex justify-end gap-2 pt-2">
                {onCancel && <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>}
                <Button type="submit">{submitLabel}</Button>
            </div>
        </form>
    );
}
