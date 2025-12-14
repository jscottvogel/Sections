import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';
import { describe, it, expect, vi } from 'vitest';

describe('Button Component', () => {
    it('renders with default props', () => {
        render(<Button>Click Me</Button>);
        const button = screen.getByRole('button', { name: /click me/i });
        expect(button).toBeInTheDocument();
        expect(button).toHaveClass('bg-indigo-600');
    });

    it('renders different variants', () => {
        const { rerender } = render(<Button variant="danger">Delete</Button>);
        expect(screen.getByRole('button')).toHaveClass('bg-red-600');

        rerender(<Button variant="outline">Back</Button>);
        expect(screen.getByRole('button')).toHaveClass('bg-transparent');
    });

    it('handles click events', async () => {
        const handleClick = vi.fn();
        render(<Button onClick={handleClick}>Action</Button>);

        await userEvent.click(screen.getByRole('button'));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('can be disabled', () => {
        render(<Button disabled>Disabled</Button>);
        expect(screen.getByRole('button')).toBeDisabled();
    });
});
