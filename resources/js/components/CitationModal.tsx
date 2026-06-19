import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Copy, Check } from 'lucide-react';
import { type Article } from '@/types';

interface CitationModalProps {
    isOpen: boolean;
    onClose: () => void;
    article: Article;
    journalTitle: string;
}

const parseAuthorName = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return { first: '', last: parts[0] };
    return {
        first: parts.slice(0, -1).join(' '),
        last: parts[parts.length - 1]
    };
};

const getYearStr = (dateStr?: string | null): string => {
    if (!dateStr) return 'n.d.';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'n.d.';
    return d.getFullYear().toString();
};

const getAPACitation = (article: Article, journalTitle: string) => {
    const year = getYearStr(article.publication_date);
    const authors = (article.authors || []).map(a => a.trim()).filter(a => a.length > 0);
    let authorStr = 'Unknown';
    if (authors.length > 0) {
        const formatted = authors.map(name => {
            const { first, last } = parseAuthorName(name);
            const initials = first ? first.split(/\s+/).map(p => p[0] + '.').join(' ') : '';
            return last + (initials ? `, ${initials}` : '');
        });
        if (formatted.length === 1) {
            authorStr = formatted[0];
        } else if (formatted.length === 2) {
            authorStr = `${formatted[0]} & ${formatted[1]}`;
        } else {
            authorStr = `${formatted.slice(0, -1).join(', ')}, & ${formatted[formatted.length - 1]}`;
        }
    }
    const volumeIssue = article.volume
        ? `${article.volume}${article.issue ? `(${article.issue})` : ''}`
        : '';
    const doi = article.doi ? `. https://doi.org/${article.doi}` : '';
    const journalPart = volumeIssue
        ? `${journalTitle}, ${volumeIssue}${article.pages ? `, ${article.pages}` : ''}`
        : article.pages
            ? `${journalTitle}, ${article.pages}`
            : journalTitle;
    return `${authorStr}. (${year}). ${article.title}. ${journalPart}${doi}`;
};

const getMLACitation = (article: Article, journalTitle: string) => {
    const year = getYearStr(article.publication_date);
    const authors = (article.authors || []).map(a => a.trim()).filter(a => a.length > 0);
    let authorStr = 'Unknown';
    if (authors.length > 0) {
        if (authors.length === 1) {
            const { first, last } = parseAuthorName(authors[0]);
            authorStr = first ? `${last}, ${first}` : last;
        } else if (authors.length === 2) {
            const a1 = parseAuthorName(authors[0]);
            const a2 = parseAuthorName(authors[1]);
            const a1Str = a1.first ? `${a1.last}, ${a1.first}` : a1.last;
            const a2Str = a2.first ? `${a2.first} ${a2.last}` : a2.last;
            authorStr = `${a1Str}, and ${a2Str}`;
        } else {
            const { first, last } = parseAuthorName(authors[0]);
            const a1Str = first ? `${last}, ${first}` : last;
            authorStr = `${a1Str}, et al`;
        }
    }
    const volInfo = article.volume ? `, vol. ${article.volume}` : '';
    const issueInfo = article.issue ? `, no. ${article.issue}` : '';
    const pagesInfo = article.pages ? `, pp. ${article.pages}` : '';
    const yearInfo = year ? `, ${year}` : '';
    return `${authorStr}. "${article.title}." ${journalTitle}${volInfo}${issueInfo}${yearInfo}${pagesInfo}.`;
};

const getChicagoCitation = (article: Article, journalTitle: string) => {
    const year = getYearStr(article.publication_date);
    const authors = (article.authors || []).map(a => a.trim()).filter(a => a.length > 0);
    let authorStr = 'Unknown';
    if (authors.length > 0) {
        if (authors.length === 1) {
            const { first, last } = parseAuthorName(authors[0]);
            authorStr = first ? `${last}, ${first}` : last;
        } else {
            const a1 = parseAuthorName(authors[0]);
            const a1Str = a1.first ? `${a1.last}, ${a1.first}` : a1.last;
            const others = authors.slice(1).map(name => {
                const { first, last } = parseAuthorName(name);
                return first ? `${first} ${last}` : last;
            });
            if (others.length === 1) {
                authorStr = `${a1Str}, and ${others[0]}`;
            } else {
                authorStr = `${a1Str}, ${others.slice(0, -1).join(', ')}, and ${others[others.length - 1]}`;
            }
        }
    }
    const volIssue = article.volume
        ? ` ${article.volume}${article.issue ? `, no. ${article.issue}` : ''}`
        : '';
    const yearInfo = year ? ` (${year})` : '';
    const pagesInfo = article.pages ? `: ${article.pages}` : '';
    const doi = article.doi ? `. https://doi.org/${article.doi}` : '';
    return `${authorStr}. "${article.title}." ${journalTitle}${volIssue}${yearInfo}${pagesInfo}${doi}.`;
};

const getHarvardCitation = (article: Article, journalTitle: string) => {
    const year = getYearStr(article.publication_date);
    const authors = (article.authors || []).map(a => a.trim()).filter(a => a.length > 0);
    let authorStr = 'Unknown';
    if (authors.length > 0) {
        const formatted = authors.map(name => {
            const { first, last } = parseAuthorName(name);
            const initials = first ? first.split(/\s+/).map(p => p[0]).join('') : '';
            return last + (initials ? `, ${initials}` : '');
        });
        if (formatted.length === 1) {
            authorStr = formatted[0];
        } else if (formatted.length === 2) {
            authorStr = `${formatted[0]} and ${formatted[1]}`;
        } else {
            authorStr = `${formatted.slice(0, -1).join(', ')} and ${formatted[formatted.length - 1]}`;
        }
    }
    const volIssue = article.volume
        ? `, ${article.volume}${article.issue ? `(${article.issue})` : ''}`
        : '';
    const pagesInfo = article.pages ? `, pp.${article.pages}` : '';
    return `${authorStr}, ${year}. ${article.title}. ${journalTitle}${volIssue}${pagesInfo}.`;
};

const getIEEECitation = (article: Article, journalTitle: string) => {
    let dateStr = 'n.d.';
    if (article.publication_date) {
        const date = new Date(article.publication_date);
        if (!isNaN(date.getTime())) {
            const year = date.getFullYear().toString();
            const monthNames = ["Jan.", "Feb.", "Mar.", "Apr.", "May", "June", "July", "Aug.", "Sept.", "Oct.", "Nov.", "Dec."];
            const month = monthNames[date.getMonth()];
            dateStr = [month, year].filter(Boolean).join(' ');
        }
    }

    const authors = (article.authors || []).map(a => a.trim()).filter(a => a.length > 0);
    let authorStr = 'Unknown';
    if (authors.length > 0) {
        const formatted = authors.map(name => {
            const { first, last } = parseAuthorName(name);
            const initials = first ? first.split(/\s+/).map(p => p[0] + '.').join(' ') : '';
            return (initials ? `${initials} ` : '') + last;
        });
        if (formatted.length === 1) {
            authorStr = formatted[0];
        } else if (formatted.length === 2) {
            authorStr = `${formatted[0]} and ${formatted[1]}`;
        } else {
            authorStr = `${formatted.slice(0, -1).join(', ')}, and ${formatted[formatted.length - 1]}`;
        }
    }
    const volStr = article.volume ? `, vol. ${article.volume}` : '';
    const issueStr = article.issue ? `, no. ${article.issue}` : '';
    const pagesStr = article.pages ? `, pp. ${article.pages}` : '';
    const datePart = dateStr ? `, ${dateStr}` : '';
    const doiStr = article.doi ? `, doi: ${article.doi}` : '';
    return `${authorStr}, "${article.title}," ${journalTitle}${volStr}${issueStr}${pagesStr}${datePart}${doiStr}.`;
};

const getBibTexCitation = (article: Article, journalTitle: string) => {
    const year = getYearStr(article.publication_date);
    const authors = (article.authors || []).map(a => a.trim()).filter(a => a.length > 0);
    const authorStr = authors.length > 0 ? authors.join(' and ') : 'Unknown';
    const firstAuthor = authors.length > 0 ? parseAuthorName(authors[0]).last.toLowerCase().replace(/[^a-z0-9]/g, '') : 'author';
    const titleFirstWord = article.title.trim().split(/\s+/)[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    const citationKey = `${firstAuthor}${year}${titleFirstWord}`;
    
    return `@article{${citationKey},\n` +
           `  author = {${authorStr}},\n` +
           `  title = {${article.title}},\n` +
           `  journal = {${journalTitle}},\n` +
           (year ? `  year = {${year}},\n` : '') +
           (article.volume ? `  volume = {${article.volume}},\n` : '') +
           (article.issue ? `  number = {${article.issue}},\n` : '') +
           (article.pages ? `  pages = {${article.pages}},\n` : '') +
           (article.doi ? `  doi = {${article.doi}},\n` : '') +
           (article.article_url ? `  url = {${article.article_url}}\n` : '') +
           `}`;
};

export function CitationModal({ isOpen, onClose, article, journalTitle }: CitationModalProps) {
    const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

    const formats = [
        { name: 'APA', text: getAPACitation(article, journalTitle) },
        { name: 'MLA', text: getMLACitation(article, journalTitle) },
        { name: 'Chicago', text: getChicagoCitation(article, journalTitle) },
        { name: 'Harvard', text: getHarvardCitation(article, journalTitle) },
        { name: 'IEEE', text: getIEEECitation(article, journalTitle) },
        { name: 'BibTeX', text: getBibTexCitation(article, journalTitle), pre: true },
    ];

    const copyToClipboard = (text: string, formatName: string) => {
        navigator.clipboard.writeText(text)
            .then(() => {
                setCopiedFormat(formatName);
                toast.success(`${formatName} citation copied!`);
                setTimeout(() => setCopiedFormat(null), 2000);
            })
            .catch((err) => {
                toast.error(`Failed to copy ${formatName} citation`);
                console.error(err);
            });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-6">
                <DialogHeader className="pb-2 border-b">
                    <DialogTitle className="text-xl">Cite Article</DialogTitle>
                    <DialogDescription className="text-xs">
                        Copy citation format for: <span className="font-semibold text-foreground">{article.title}</span>
                    </DialogDescription>
                </DialogHeader>
                
                <div className="flex-1 overflow-y-auto pr-1 py-4 space-y-4">
                    {formats.map((f) => (
                        <div key={f.name} className="space-y-1">
                            <span className="text-xs font-semibold text-muted-foreground">{f.name}</span>
                            <div className="flex gap-2 items-start bg-slate-50 dark:bg-slate-900 border rounded-lg p-3">
                                {f.pre ? (
                                    <pre className="text-xs flex-1 break-all overflow-x-auto whitespace-pre-wrap font-mono select-all">
                                        {f.text}
                                    </pre>
                                ) : (
                                    <p className="text-xs flex-1 select-all leading-relaxed text-foreground">
                                        {f.text}
                                    </p>
                                )}
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 w-7 p-0 shrink-0 hover:bg-slate-200 dark:hover:bg-slate-800"
                                    onClick={() => copyToClipboard(f.text, f.name)}
                                >
                                    {copiedFormat === f.name ? (
                                        <Check className="h-3.5 w-3.5 text-green-600" />
                                    ) : (
                                        <Copy className="h-3.5 w-3.5" />
                                    )}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
