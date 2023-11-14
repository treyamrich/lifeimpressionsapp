import { render, screen } from '@testing-library/react';

describe('Sample Test', () => {
    it('should pass', () => {
        render(
            <div>
                Hello World
            </div>
        )

        const elm = screen.getByText('Hello World')

        expect(elm).toBeInTheDocument();
    });
});