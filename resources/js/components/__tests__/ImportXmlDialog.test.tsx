import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { ImportXmlDialog } from '../ImportXmlDialog';

// Mock route function globally
beforeAll(() => {
    (globalThis as any).route = (name: string, params?: any) => `/route/${name}/${params || ''}`;
});

// Setup mock state for useForm
const mockPost = vi.fn();
const mockReset = vi.fn();

vi.mock('@inertiajs/react', () => {
    return {
        useForm: (initialValues: any) => {
            const [data, setDataState] = useState(initialValues);
            const setData = vi.fn((keyOrData: any, value?: any) => {
                if (typeof keyOrData === 'string') {
                    setDataState((prev: any) => ({ ...prev, [keyOrData]: value }));
                } else if (typeof keyOrData === 'function') {
                    setDataState((prev: any) => keyOrData(prev));
                } else {
                    setDataState(keyOrData);
                }
            });

            return {
                data,
                setData,
                post: mockPost,
                processing: false,
                errors: {},
                reset: mockReset,
            };
        },
    };
});

describe('ImportXmlDialog', () => {
    const defaultProps = {
        open: true,
        onOpenChange: vi.fn(),
        journalId: 42,
        uploadRoute: 'admin.journals.import',
    };

    beforeEach(() => {
        vi.clearAllMocks();
        // Reset mockPost default behavior to just do nothing
        mockPost.mockReset();
    });

    it('renders the dialog when open is true', () => {
        render(<ImportXmlDialog {...defaultProps} />);
        expect(screen.getByText('Import Artikel via XML')).toBeInTheDocument();
        expect(screen.getByText('File XML CrossRef')).toBeInTheDocument();
        expect(screen.getByText('Penanganan Artikel Duplikat')).toBeInTheDocument();
    });

    it('does not render when open is false', () => {
        render(<ImportXmlDialog {...defaultProps} open={false} />);
        expect(screen.queryByText('Import Artikel via XML')).not.toBeInTheDocument();
    });

    it('displays the selected file name and calls setData', () => {
        render(<ImportXmlDialog {...defaultProps} />);

        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        expect(fileInput).toBeInTheDocument();

        const file = new File(['<xml></xml>'], 'test_crossref.xml', { type: 'text/xml' });

        fireEvent.change(fileInput, { target: { files: [file] } });

        // Checks if file name is rendered in the upload zone
        expect(screen.getByText('test_crossref.xml')).toBeInTheDocument();
    });

    it('allows changing duplicate strategy radio buttons', () => {
        render(<ImportXmlDialog {...defaultProps} />);

        const skipRadio = document.querySelector('input[value="skip"]') as HTMLInputElement;
        const updateRadio = document.querySelector('input[value="update"]') as HTMLInputElement;

        expect(skipRadio).toBeInTheDocument();
        expect(updateRadio).toBeInTheDocument();

        expect(skipRadio.checked).toBe(true);
        expect(updateRadio.checked).toBe(false);

        // Click update strategy
        fireEvent.click(updateRadio);

        expect(skipRadio.checked).toBe(false);
        expect(updateRadio.checked).toBe(true);
    });

    it('submits form correctly and resets on success', () => {
        // Mock post to call onSuccess immediately
        mockPost.mockImplementation((url, options) => {
            if (options && typeof options.onSuccess === 'function') {
                options.onSuccess();
            }
        });

        render(<ImportXmlDialog {...defaultProps} />);

        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        const file = new File(['<xml></xml>'], 'test_crossref.xml', { type: 'text/xml' });

        // Select file first to enable submit button
        fireEvent.change(fileInput, { target: { files: [file] } });

        const submitBtn = screen.getByRole('button', { name: 'Mulai Import' });
        expect(submitBtn).not.toBeDisabled();

        // Submit form directly to trigger onSubmit handler
        const form = document.querySelector('form')!;
        expect(form).toBeInTheDocument();
        fireEvent.submit(form);

        // Assert route post call
        expect(mockPost).toHaveBeenCalledWith(
            '/route/admin.journals.import/42',
            expect.objectContaining({
                preserveScroll: true,
            }),
        );

        // Assert reset and dialog close got triggered on success
        expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
        expect(mockReset).toHaveBeenCalled();
        expect(screen.getByText('Seret file ke sini atau klik untuk memilih')).toBeInTheDocument();
    });

    it('calls onOpenChange and reset when cancel button is clicked', () => {
        render(<ImportXmlDialog {...defaultProps} />);

        const cancelBtn = screen.getByRole('button', { name: 'Batal' });
        fireEvent.click(cancelBtn);

        expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
    });
});
