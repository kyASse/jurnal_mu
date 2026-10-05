import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ChartConfig, ChartContainer } from '../chart';

describe('ChartContainer Component', () => {
    it('renders chart container with CSS color variables', () => {
        const config: ChartConfig = {
            metric: {
                label: 'Skor SINTA',
                color: 'var(--chart-1)',
            },
        };

        render(
            <ChartContainer config={config} data-testid="test-chart">
                <div>Chart Content</div>
            </ChartContainer>
        );

        const container = screen.getByTestId('test-chart');
        expect(container).toBeInTheDocument();
        expect(screen.getByText('Chart Content')).toBeInTheDocument();
    });
});
