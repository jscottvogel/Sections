import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Section } from '../types';

import { TEMPLATES, type FieldDefinition } from '../features/section/templates';

/**
 * Utility to generate PDF exports for Sections.
 * Supports different layouts for Collection (Table) and Singleton (Key-Value) types.
 * Handles custom fields dynamically.
 */
export const SectionExporter = {
    export: (section: Section) => {
        const doc = new jsPDF();
        const template = TEMPLATES[section.type as keyof typeof TEMPLATES] || TEMPLATES.custom;
        const content = section.content as any || {};
        const customFields = (content._customFields as FieldDefinition[]) || [];
        const allFields = [...template.fields, ...customFields];

        // Title
        doc.setFontSize(18);
        doc.text(section.title, 14, 20);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(template.label, 14, 26);
        doc.setTextColor(0);

        if (template.isCollection) {
            const items = content.items || [];
            if (items.length === 0) {
                doc.setFontSize(12);
                doc.text("No items to display.", 14, 40);
            } else {
                // Prepare table data
                const headers = allFields.map(f => f.label);
                const data = items.map((item: any) => {
                    return allFields.map(f => item[f.name] || '');
                });

                autoTable(doc, {
                    startY: 35,
                    head: [headers],
                    body: data,
                    styles: { fontSize: 10 },
                    headStyles: { fillColor: [79, 70, 229] } // Indigo-600-ish
                });
            }
        } else {
            // Singleton: Key-Value list
            let y = 40;
            doc.setFontSize(12);

            allFields.forEach(field => {
                const value = content[field.name];
                if (value) {
                    doc.setFont('helvetica', 'bold');
                    doc.text(`${field.label}:`, 14, y);

                    doc.setFont('helvetica', 'normal');
                    // Handle long text (textarea)
                    const splitText = doc.splitTextToSize(String(value), 170); // 14 margin left, ~20 margin right
                    doc.text(splitText, 50, y);

                    y += (splitText.length * 5) + 5; // Adjust spacing based on lines
                }
            });

            if (y === 40) {
                doc.text("No content available.", 14, 40);
            }
        }

        doc.save(`${section.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);
    }
};
