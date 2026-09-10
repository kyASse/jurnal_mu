import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useScrollReveal } from '../use-scroll-reveal';

describe('useScrollReveal', () => {
    let observeMock: ReturnType<typeof vi.fn>;
    let disconnectMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        observeMock = vi.fn();
        disconnectMock = vi.fn();

        (window as any).IntersectionObserver = vi.fn().mockImplementation(() => {
            return {
                observe: observeMock,
                disconnect: disconnectMock,
                unobserve: vi.fn(),
            };
        });
    });

    it('initializes with isVisible false and attaches observer', () => {
        const { result } = renderHook(() => useScrollReveal());
        expect(result.current.isVisible).toBe(false);
        expect(result.current.ref).toBeDefined();
    });
});
