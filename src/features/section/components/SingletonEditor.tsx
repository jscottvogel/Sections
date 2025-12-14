import type { Section } from '../../../types';
import type { SectionTemplateDef } from '../templates';
import { GenericForm } from './GenericForm';

interface SingletonEditorProps {
    section: Section;
    template: SectionTemplateDef;
    onUpdate: (content: any) => Promise<void>;
}

export function SingletonEditor({ section, template, onUpdate }: SingletonEditorProps) {
    // section.content is the direct object
    const handleSave = async (data: any) => {
        await onUpdate(data);
    };

    return (
        <GenericForm
            fields={template.fields}
            initialValues={section.content || {}}
            onSubmit={handleSave}
            submitLabel="Save Changes"
        />
    );
}
