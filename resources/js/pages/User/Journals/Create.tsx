/**
 * JournalsCreate Component
 *
 * @description
 * A form page allowing users to register a new journal into the system.
 * It strictly validates input data including ISSN, classification, and
 * publisher details to ensure data integrity.
 *
 * @component
 *
 * @interface Props
 * @property {Array} scientificFields - List of available scientific fields for classification
 * @property {number} scientificFields[].id - ID of the field
 * @property {string} scientificFields[].name - Name of the field
 *
 * @param {Props} props - Component props
 * @param {Array} props.scientificFields - Data for populating the scientific field dropdown
 *
 * @returns {JSX.Element} The rendered Create Journal page
 *
 * @example
 * ```tsx
 * <JournalsCreate scientificFields={fieldsList} />
 * ```
 *
 * @features
 * - Comprehensive journal registration form
 * - Input validation with error messaging
 * - Selection for Scientific Field and SINTA Rank
 * - Publication Frequency selection
 * - Automatic year validation
 * - Cancel and Return navigation
 *
 * @route POST /journals
 *
 * @requires @inertiajs/react
 * @requires @/layouts/app-layout
 * @requires @/components/ui/button
 * @requires @/components/ui/input
 * @requires @/components/ui/label
 * @requires @/components/ui/select
 * @requires lucide-react
 *
 * @author JurnalMU Team
 * @filepath /resources/js/pages/User/Journals/Create.tsx
 */
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { FormEventHandler } from 'react';

interface Props {
    scientificFields: Array<{
        id: number;
        name: string;
    }>;
}

export default function JournalsCreate({ scientificFields }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        issn: '',
        e_issn: '',
        url: '',
        scientific_field_id: '',
        sinta_rank: '',
        frequency: '',
        publisher: '',
        first_published_year: '',
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('journals.store'));
    };

    const currentYear = new Date().getFullYear();

    return (
        <AppLayout>
            <Head title="Create Journal" />

            <div className="py-6">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6">
                        <Link href={route('journals.index')}>
                            <Button variant="ghost" className="mb-4 pl-0 hover:bg-transparent hover:text-blue-600">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to My Journals
                            </Button>
                        </Link>
                        <div className="flex items-center gap-2">
                            <BookOpen className="w-8 h-8 text-blue-600" />
                            <h1 className="text-3xl font-bold text-gray-900">
                                Register New Journal
                            </h1>
                        </div>
                        <p className="text-gray-600 mt-1 ml-10">
                            Enter the details of the journal you manage
                        </p>
                    </div>

                    {/* Form */}
                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Basic Info */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                                    Journal Information
                                </h3>

                                <div>
                                    <Label htmlFor="title">Journal Title <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="title"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        placeholder="e.g. Jurnal Ilmiah Teknik Elektro"
                                        className="mt-1"
                                        required
                                    />
                                    {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title}</p>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="issn">ISSN (Print)</Label>
                                        <Input
                                            id="issn"
                                            value={data.issn}
                                            onChange={(e) => setData('issn', e.target.value)}
                                            placeholder="xxxx-xxxx"
                                            className="mt-1"
                                        />
                                        {errors.issn && <p className="text-sm text-red-600 mt-1">{errors.issn}</p>}
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
                                        {errors.e_issn && <p className="text-sm text-red-600 mt-1">{errors.e_issn}</p>}
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="url">Journal URL <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="url"
                                        type="url"
                                        value={data.url}
                                        onChange={(e) => setData('url', e.target.value)}
                                        placeholder="https://journal.example.ac.id/index.php/jite"
                                        className="mt-1"
                                        required
                                    />
                                    {errors.url && <p className="text-sm text-red-600 mt-1">{errors.url}</p>}
                                </div>
                            </div>

                            {/* Classification */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                                    Classification & Metadata
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label>Scientific Field <span className="text-red-500">*</span></Label>
                                        <Select
                                            value={data.scientific_field_id}
                                            onValueChange={(val) => setData('scientific_field_id', val)}
                                        >
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
                                        {errors.scientific_field_id && <p className="text-sm text-red-600 mt-1">{errors.scientific_field_id}</p>}
                                    </div>

                                    <div>
                                        <Label>SINTA Rank</Label>
                                        <Select
                                            value={data.sinta_rank}
                                            onValueChange={(val) => setData('sinta_rank', val)}
                                        >
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
                                        {errors.sinta_rank && <p className="text-sm text-red-600 mt-1">{errors.sinta_rank}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="frequency">Publication Frequency <span className="text-red-500">*</span></Label>
                                        <Select
                                            value={data.frequency}
                                            onValueChange={(val) => setData('frequency', val)}
                                        >
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
                                        {errors.frequency && <p className="text-sm text-red-600 mt-1">{errors.frequency}</p>}
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
                                        {errors.first_published_year && <p className="text-sm text-red-600 mt-1">{errors.first_published_year}</p>}
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
                                    {errors.publisher && <p className="text-sm text-red-600 mt-1">{errors.publisher}</p>}
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-4 pt-4 border-t">
                                <Link href={route('journals.index')}>
                                    <Button type="button" variant="outline">
                                        Cancel
                                    </Button>
                                </Link>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Saving...' : 'Save Journal'}
                                </Button>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
