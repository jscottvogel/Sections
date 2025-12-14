import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GenericForm } from './GenericForm';
import { describe, it, expect, vi } from 'vitest';

describe('GenericForm Component', () => {
    const fields = [
        { name: 'name', label: 'Name', type: 'text' as const, required: true },
        { name: 'bio', label: 'Bio', type: 'textarea' as const }
    ];

    it('renders defined fields', () => {
        render(<GenericForm fields={fields} onSubmit={vi.fn()} />);
        expect(screen.getByLabelText('Name *')).toBeInTheDocument();
        expect(screen.getByLabelText('Bio')).toBeInTheDocument();
    });

    it('submits valid data', async () => {
        const handleSubmit = vi.fn();
        render(<GenericForm fields={fields} onSubmit={handleSubmit} />);

        await userEvent.type(screen.getByLabelText('Name *'), 'John Doe');
        await userEvent.type(screen.getByLabelText('Bio'), 'Developer');
        await userEvent.click(screen.getByRole('button', { name: /save/i }));

        expect(handleSubmit).toHaveBeenCalledWith(expect.objectContaining({
            name: 'John Doe',
            bio: 'Developer'
        }));
    });
});
