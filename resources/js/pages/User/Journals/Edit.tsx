/**
 * JournalsEdit Component
 *
 * @description
 * The editing interface for existing journals. Pre-populates all form fields
 * with current journal data and allows users to update information such as
 * ISSN, titles, and classification details.
 *
 * @component
 *
 * @interface Journal
 * @property {number} id - Journal ID
 * @property {string} title - Journal Title
 * @property {string} issn - ISSN
 * @property {string} e_issn - E-ISSN
 * @property {string} url - URL
 * @property {number} scientific_field_id - Foreign key for scientific field
 * @property {number|null} sinta_rank - SINTA Rank
 * @property {string} frequency - Publication frequency
 * @property {string} publisher - Publisher name
 * @property {number|null} first_published_year - Year of first publication
 *
 * @interface Props
 * @property {Journal} journal - The existing journal data to edit
 * @property {Array} scientificFields - List of available scientific fields
 *
 * @param {Props} props - Component props
 * @param {Journal} props.journal - Current journal data
 * @param {Array} props.scientificFields - Reference data for dropdowns
 *
 * @returns {JSX.Element} The rendered Edit Journal page
 *
 * @example
 * ```tsx
 * <JournalsEdit journal={journalData} scientificFields={fieldsList} />
 * ```
 *
 * @features
 * - Data pre-filling
 * - PUT request handling for updates
 * - Validation error display
 * - Navigation back to index
 *
 * @route PUT /journals/{id}
 *
 * @requires @inertiajs/react
 * @requires @/layouts/app-layout
 * @requires @/components/ui/button
 * @requires @/components/ui/select
 * @requires lucide-react
 *
 * @author JurnalMU Team
 * @filepath /resources/js/pages/User/Journals/Edit.tsx
 */
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { FormEventHandler } from 'react';

interface Journal {
    id: number;
    title: string;
    issn: string;
    e_issn: string;
    url: string;
    scientific_field_id: number;
    sinta_rank: number | null;
    frequency: string;
    publisher: string;
    first_published_year: number | null;
}

interface Props {
    journal: Journal;
    scientificFields: Array<{
        id: number;
        name: string;
    }>;
}

export default function JournalsEdit({ journal, scientificFields }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        title: journal.title || '',
        issn: journal.issn || '',
        e_issn: journal.e_issn || '',
        url: journal.url || '',
        scientific_field_id: journal.scientific_field_id ? journal.scientific_field_id.toString() : '',
        sinta_rank: journal.sinta_rank ? journal.sinta_rank.toString() : '',
        frequency: journal.frequency || '',
        publisher: journal.publisher || '',
        first_published_year: journal.first_published_year || '',
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('journals.update', journal.id));
    };

    const currentYear = new Date().getFullYear();

    return (
        <AppLayout>
            <Head title="Edit Journal" />

            <div className="py-6">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6">
                        <Link href={route('journals.index')}>
                            <Button variant="ghost" className="mb-4 pl-0 hover:bg-transparent hover:text-blue-600">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to My Journals
                            </Button>
                        </Link>
                        <div className="flex items-center gap-2">
                            <BookOpen className="h-8 w-8 text-blue-600" />
                            <h1 className="text-3xl font-bold text-gray-900">Edit Journal</h1>
                        </div>
                        <p className="mt-1 ml-10 text-gray-600">Update journal details</p>
                    </div>

                    {/* Form */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Basic Info */}
                            <div className="space-y-4">
                                <h3 className="border-b pb-2 text-lg font-semibold text-gray-900">Journal Information</h3>

                                <div>
                                    <Label htmlFor="title">
                                        Journal Title <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="title"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        placeholder="e.g. Jurnal Ilmiah Teknik Elektro"
                                        className="mt-1"
                                        required
                                    />
                                    {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <Label htmlFor="issn">ISSN (Print)</Label>
                                        <Input
                                            id="issn"
                                            value={data.issn}
                                            onChange={(e) => setData('issn', e.target.value)}
                                            placeholder="xxxx-xxxx"
                                            className="mt-1"
                                        />
                                        {errors.issn && <p className="mt-1 text-sm text-red-600">{errors.issn}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="e_issn">E-ISSN (Online)</Label>
                                        <Input
                                            id="e_issn"
                                            value={data.e_issn}
                                            onChange={(e) => setData('e_issn', e.target.value)}
                                            placeholder="xxxx-xxxx"
                                            className="mt-1"
                                        />
                                        {errors.e_issn && <p className="mt-1 text-sm text-red-600">{errors.e_issn}</p>}
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="url">
                                        Journal URL <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="url"
                                        type="url"
                                        value={data.url}
                                        onChange={(e) => setData('url', e.target.value)}
                                        placeholder="https://journal.example.ac.id/index.php/jite"
                                        className="mt-1"
                                        required
                                    />
                                    {errors.url && <p className="mt-1 text-sm text-red-600">{errors.url}</p>}
                                </div>
                            </div>

                            {/* Classification */}
                            <div className="space-y-4">
                                <h3 className="border-b pb-2 text-lg font-semibold text-gray-900">Classification & Metadata</h3>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <Label>
                                            Scientific Field <span className="text-red-500">*</span>
                                        </Label>
                                        <Select value={data.scientific_field_id} onValueChange={(val) => setData('scientific_field_id', val)}>
                                            <SelectTrigger className="mt-1">
                                                <SelectValue placeholder="Select Field" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {scientificFields.map((field) => (
                                                    <SelectItem key={field.id} value={field.id.toString()}>
                                                        {field.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.scientific_field_id && <p className="mt-1 text-sm text-red-600">{errors.scientific_field_id}</p>}
                                    </div>

                                    <div>
                                        <Label>SINTA Rank</Label>
                                        <Select value={data.sinta_rank} onValueChange={(val) => setData('sinta_rank', val)}>
                                            <SelectTrigger className="mt-1">
                                                <SelectValue placeholder="Select Rank (Optional)" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1">SINTA 1</SelectItem>
                                                <SelectItem value="2">SINTA 2</SelectItem>
                                                <SelectItem value="3">SINTA 3</SelectItem>
                                                <SelectItem value="4">SINTA 4</SelectItem>
                                                <SelectItem value="5">SINTA 5</SelectItem>
                                                <SelectItem value="6">SINTA 6</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.sinta_rank && <p className="mt-1 text-sm text-red-600">{errors.sinta_rank}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <Label htmlFor="frequency">
                                            Publication Frequency <span className="text-red-500">*</span>
                                        </Label>
                                        <Select value={data.frequency} onValueChange={(val) => setData('frequency', val)}>
                                            <SelectTrigger className="mt-1">
                                                <SelectValue placeholder="Select Frequency" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Monthly">Monthly (Bulanan)</SelectItem>
                                                <SelectItem value="Bi-Monthly">Bi-Monthly (2 Bulanan)</SelectItem>
                                                <SelectItem value="Quarterly">Quarterly (Triwulan)</SelectItem>
                                                <SelectItem value="Semi-Annual">Semi-Annual (Semesteran)</SelectItem>
                                                <SelectItem value="Annual">Annual (Tahunan)</SelectItem>
                                                <SelectItem value="Other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.frequency && <p className="mt-1 text-sm text-red-600">{errors.frequency}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="first_published_year">First Published Year</Label>
                                        <Input
                                            id="first_published_year"
                                            type="number"
                                            min="1900"
                                            max={currentYear + 1}
                                            value={data.first_published_year}
                                            onChange={(e) => setData('first_published_year', e.target.value)}
                                            placeholder="e.g. 2010"
                                            className="mt-1"
                                        />
                                        {errors.first_published_year && <p className="mt-1 text-sm text-red-600">{errors.first_published_year}</p>}
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="publisher">Publisher</Label>
                                    <Input
                                        id="publisher"
                                        value={data.publisher}
                                        onChange={(e) => setData('publisher', e.target.value)}
                                        placeholder="e.g. Universitas Muhammadiyah Yogyakarta"
                                        className="mt-1"
                                    />
                                    {errors.publisher && <p className="mt-1 text-sm text-red-600">{errors.publisher}</p>}
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-4 border-t pt-4">
                                <Link href={route('journals.index')}>
                                    <Button type="button" variant="outline">
                                        Cancel
                                    </Button>
                                </Link>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Saving...' : 'Update Journal'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
