import React, { useEffect, useRef, useState } from 'react';
import {
    Bold,
    Italic,
    Underline,
    Strikethrough,
    List,
    ListOrdered,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Link2,
    Eraser,
    Code,
    FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export default function RichTextEditor({
    value,
    onChange,
    placeholder = 'Start writing news body here...',
    className = ''
}: RichTextEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const [isMounted, setIsMounted] = useState(false);
    const [isRawMode, setIsRawMode] = useState(false);

    // Initial load
    useEffect(() => {
        if (editorRef.current && !isMounted) {
            editorRef.current.innerHTML = value || '';
            setIsMounted(true);
        }
    }, [value, isMounted]);

    // Handle updates from outside (only if different to prevent cursor jump)
    useEffect(() => {
        if (editorRef.current && isMounted && !isRawMode) {
            if (editorRef.current.innerHTML !== value) {
                editorRef.current.innerHTML = value || '';
            }
        }
    }, [value, isMounted, isRawMode]);

    const handleInput = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    const execCommand = (command: string, arg: string = '') => {
        document.execCommand(command, false, arg);
        handleInput();
        if (editorRef.current) {
            editorRef.current.focus();
        }
    };

    const handleLink = () => {
        const url = prompt('Enter link URL:');
        if (url !== null) {
            execCommand('createLink', url);
        }
    };

    return (
        <div className={`flex flex-col rounded-md border border-input bg-transparent shadow-sm focus-within:ring-1 focus-within:ring-emerald-500 ${className}`}>
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-1 border-b bg-muted/30 p-2 dark:bg-muted/10">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => execCommand('bold')}
                    title="Bold"
                >
                    <Bold className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => execCommand('italic')}
                    title="Italic"
                >
                    <Italic className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => execCommand('underline')}
                    title="Underline"
                >
                    <Underline className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => execCommand('strikeThrough')}
                    title="Strikethrough"
                >
                    <Strikethrough className="h-4 w-4" />
                </Button>

                <div className="h-6 w-[1px] bg-border mx-1" />

                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => execCommand('formatBlock', '<h2>')}
                    title="Heading 2"
                >
                    <span className="text-xs font-bold font-mono">H2</span>
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => execCommand('formatBlock', '<h3>')}
                    title="Heading 3"
                >
                    <span className="text-xs font-bold font-mono">H3</span>
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => execCommand('formatBlock', '<p>')}
                    title="Paragraph"
                >
                    <span className="text-xs font-mono">P</span>
                </Button>

                <div className="h-6 w-[1px] bg-border mx-1" />

                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => execCommand('insertUnorderedList')}
                    title="Bullet List"
                >
                    <List className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => execCommand('insertOrderedList')}
                    title="Numbered List"
                >
                    <ListOrdered className="h-4 w-4" />
                </Button>

                <div className="h-6 w-[1px] bg-border mx-1" />

                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => execCommand('justifyLeft')}
                    title="Align Left"
                >
                    <AlignLeft className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => execCommand('justifyCenter')}
                    title="Align Center"
                >
                    <AlignCenter className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => execCommand('justifyRight')}
                    title="Align Right"
                >
                    <AlignRight className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => execCommand('justifyFull')}
                    title="Justify"
                >
                    <AlignJustify className="h-4 w-4" />
                </Button>

                <div className="h-6 w-[1px] bg-border mx-1" />

                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={handleLink}
                    title="Link"
                >
                    <Link2 className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => execCommand('removeFormat')}
                    title="Clear Format"
                >
                    <Eraser className="h-4 w-4" />
                </Button>

                <div className="ml-auto flex items-center gap-1">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 ${isRawMode ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' : 'text-muted-foreground'}`}
                        onClick={() => setIsRawMode(!isRawMode)}
                        title={isRawMode ? 'Switch to Rich Text' : 'Switch to Raw HTML'}
                    >
                        {isRawMode ? <FileText className="h-4 w-4" /> : <Code className="h-4 w-4" />}
                    </Button>
                </div>
            </div>

            {/* Editable Area */}
            {isRawMode ? (
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="min-h-[250px] w-full resize-y bg-transparent p-4 font-mono text-sm focus:outline-none"
                    placeholder="Type raw HTML here..."
                />
            ) : (
                <div
                    ref={editorRef}
                    contentEditable
                    onInput={handleInput}
                    onBlur={handleInput}
                    className="min-h-[250px] w-full resize-y overflow-y-auto p-4 text-sm focus:outline-none dark:text-neutral-100 prose prose-sm dark:prose-invert max-w-none"
                    style={{ outline: 'none' }}
                />
            )}
        </div>
    );
}
