import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';

// Cleanup after each test
afterEach(() => {
    cleanup();
});

// Mock window.matchMedia for theme detection
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

// Mock IntersectionObserver for chart components
global.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    takeRecords() {
        return [];
    }
    unobserve() {}
} as any;

// Mock ResizeObserver for responsive charts
global.ResizeObserver = class ResizeObserver {
    callback?: (entries: any[]) => void;
    constructor(callback?: (entries: any[]) => void) {
        this.callback = callback;
    }
    disconnect() {}
    observe(target: any) {
        if (typeof this.callback === 'function') {
            this.callback([
                {
                    target,
                    contentRect: {
                        width: 800,
                        height: 400,
                        top: 0,
                        left: 0,
                        bottom: 400,
                        right: 800,
                    },
                },
            ]);
        }
    }
    unobserve() {}
} as any;

// Mock getBoundingClientRect for responsive charts in happy-dom
const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;
Element.prototype.getBoundingClientRect = function () {
    const rect = originalGetBoundingClientRect ? originalGetBoundingClientRect.call(this) : null;
    if (!rect || (rect.width === 0 && rect.height === 0)) {
        return {
            width: 800,
            height: 400,
            top: 0,
            left: 0,
            bottom: 400,
            right: 800,
            x: 0,
            y: 0,
            toJSON: () => {},
        };
    }
    return rect;
};

// Suppress console errors in tests (optional - remove if you want to see them)
const originalError = console.error;
beforeAll(() => {
    console.error = (...args: any[]) => {
        if (
            typeof args[0] === 'string' &&
            (args[0].includes('Warning: ReactDOM.render') || args[0].includes('Not implemented: HTMLFormElement.prototype.submit'))
        ) {
            return;
        }
        originalError.call(console, ...args);
    };
});

afterAll(() => {
    console.error = originalError;
});
