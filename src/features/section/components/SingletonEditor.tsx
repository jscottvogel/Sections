import type { Section } from '../../../types';
import type { SectionTemplateDef, FieldDefinition } from '../templates';
import { GenericForm } from './GenericForm';
import { FieldManager } from './FieldManager';

interface SingletonEditorProps {
    section: Section;
    template: SectionTemplateDef;
    onUpdate: (updates: Partial<Section>) => Promise<void>;
}

export function SingletonEditor({ section, template, onUpdate }: SingletonEditorProps) {
    // Custom fields are stored in the content object under _customFields
    const content = section.content as Record<string, any>;
    const customFields = (content._customFields as FieldDefinition[]) || [];

    // We inject the title into the form values so it can be edited
    const initialValues = {
        ...content,
        title: section.title
    };

    const handleSave = async (data: any) => {
        // Extract title if it's part of the template (like custom sections)
        const { title, ...rest } = data;

        // Preserve _customFields when saving content
        const newContent = {
            ...rest,
            _customFields: customFields
        };

        const updates: Partial<Section> = { content: newContent };

        if (typeof title === 'string') {
            updates.title = title;
        }

        await onUpdate(updates);
    };

    const handleFieldsChange = async (newFields: FieldDefinition[]) => {
        const newContent = {
            ...content,
            _customFields: newFields
        };
        await onUpdate({ content: newContent });
    };

    const allFields = [...template.fields, ...customFields];

    return (
        <div className="space-y-6">
            <GenericForm
                fields={allFields}
                initialValues={initialValues}
                onSubmit={handleSave}
                submitLabel="Save"
            />
            <div className="border-t pt-4">
                <FieldManager
                    customFields={customFields}
                    onFieldsChange={handleFieldsChange}
                />
            </div>
        </div>
    );
}
