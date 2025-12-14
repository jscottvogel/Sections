import type { Section } from '../../../types';
import type { SectionTemplateDef } from '../templates';
import { GenericForm } from './GenericForm';

interface SingletonEditorProps {
    section: Section;
    template: SectionTemplateDef;
    onUpdate: (updates: Partial<Section>) => Promise<void>;
}

export function SingletonEditor({ section, template, onUpdate }: SingletonEditorProps) {
    // section.content is the direct object
    // We inject the title into the form values so it can be edited
    const initialValues = {
        ...(section.content as Record<string, any>),
        title: section.title
    };

    const handleSave = async (data: any) => {
        // Extract title if it's part of the template (like custom sections)
        const { title, ...content } = data;

        // If the template has a title field, we update the section title
        // Otherwise we just update content
        const updates: Partial<Section> = { content };

        // Only update title if it was actually in the form data (i.e., defined in template)
        // and distinct from previous. use 'title' in data check or template field check.
        // For now, if 'title' is in data, we assume it maps to section title.
        if (typeof title === 'string') {
            updates.title = title;
        }

        await onUpdate(updates);
    };

    return (
        <GenericForm
            fields={template.fields}
            initialValues={initialValues}
            onSubmit={handleSave}
            submitLabel="Save"
        />
    );
}
