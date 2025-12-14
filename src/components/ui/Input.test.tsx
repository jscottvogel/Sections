import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './Input';
import { describe, it, expect } from 'vitest';

describe('Input Component', () => {
    it('renders with label', () => {
        render(<Input label="Username" id="user-input" />);
        expect(screen.getByLabelText('Username')).toBeInTheDocument();
    });

    it('renders generic input without label', () => {
        render(<Input placeholder="Search" />);
        expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
    });

    it('displays error message', () => {
        render(<Input error="Invalid email" />);
        expect(screen.getByText('Invalid email')).toBeInTheDocument();
        expect(screen.getByRole('textbox')).toHaveClass('border-red-500');
    });

    it('accepts user input', async () => {
        render(<Input />);
        const input = screen.getByRole('textbox');
        await userEvent.type(input, 'Hello World');
        expect(input).toHaveValue('Hello World');
    });
});
