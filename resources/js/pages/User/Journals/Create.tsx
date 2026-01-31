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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { FormEventHandler } from 'react';

interface Props {
    scientificFields: Array<{
        id: number;
        name: string;
    }>;
    indexationOptions: Array<{
        value: string;
        label: string;
    }>;
}

export default function JournalsCreate({ scientificFields, indexationOptions }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        issn: '',
        e_issn: '',
        url: '',
        scientific_field_id: '',
        sinta_rank: '',
        sinta_indexed_date: '',
        frequency: '',
        publisher: '',
        first_published_year: '',
        // Dikti Accreditation
        dikti_accreditation_number: '',
        accreditation_issued_date: '',
        accreditation_expiry_date: '',
        accreditation_status: '',
        accreditation_grade: '',
        // Indexations
        indexations: [] as Array<{ platform: string; indexed_at: string }>,
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
                            <h1 className="text-3xl font-bold text-gray-900">Register New Journal</h1>
                        </div>
                        <p className="mt-1 ml-10 text-gray-600">Enter the details of the journal you manage</p>
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

                                {data.sinta_rank && (
                                    <div>
                                        <Label htmlFor="sinta_indexed_date">SINTA Indexed Date</Label>
                                        <Input
                                            id="sinta_indexed_date"
                                            type="date"
                                            value={data.sinta_indexed_date}
                                            onChange={(e) => setData('sinta_indexed_date', e.target.value)}
                                            max={new Date().toISOString().split('T')[0]}
                                            className="mt-1"
                                        />
                                        {errors.sinta_indexed_date && <p className="mt-1 text-sm text-red-600">{errors.sinta_indexed_date}</p>}
                                        <p className="mt-1 text-xs text-gray-500">Tanggal jurnal terindeks di SINTA</p>
                                    </div>
                                )}

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
                                            max={currentYear}
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

                            {/* Dikti Accreditation */}
                            <div className="space-y-4">
                                <h3 className="border-b pb-2 text-lg font-semibold text-gray-900">Dikti Accreditation (Optional)</h3>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <Label htmlFor="accreditation_status">Accreditation Status</Label>
                                        <Select value={data.accreditation_status} onValueChange={(val) => setData('accreditation_status', val)}>
                                            <SelectTrigger className="mt-1">
                                                <SelectValue placeholder="Select Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Terakreditasi">Terakreditasi</SelectItem>
                                                <SelectItem value="Dalam Proses">Dalam Proses</SelectItem>
                                                <SelectItem value="Belum Terakreditasi">Belum Terakreditasi</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.accreditation_status && <p className="mt-1 text-sm text-red-600">{errors.accreditation_status}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="accreditation_grade">Accreditation Grade</Label>
                                        <Select value={data.accreditation_grade} onValueChange={(val) => setData('accreditation_grade', val)}>
                                            <SelectTrigger className="mt-1">
                                                <SelectValue placeholder="Select Grade" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="S1">S1 (Sangat Baik)</SelectItem>
                                                <SelectItem value="S2">S2 (Baik Sekali)</SelectItem>
                                                <SelectItem value="S3">S3 (Baik)</SelectItem>
                                                <SelectItem value="S4">S4 (Cukup)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.accreditation_grade && <p className="mt-1 text-sm text-red-600">{errors.accreditation_grade}</p>}
                                    </div>
                                </div>

                                {data.accreditation_status === 'Terakreditasi' && (
                                    <>
                                        <div>
                                            <Label htmlFor="dikti_accreditation_number">Accreditation Number</Label>
                                            <Input
                                                id="dikti_accreditation_number"
                                                value={data.dikti_accreditation_number}
                                                onChange={(e) => setData('dikti_accreditation_number', e.target.value)}
                                                placeholder="e.g. 105/E/KPT/2023"
                                                className="mt-1"
                                            />
                                            {errors.dikti_accreditation_number && (
                                                <p className="mt-1 text-sm text-red-600">{errors.dikti_accreditation_number}</p>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div>
                                                <Label htmlFor="accreditation_issued_date">Issued Date</Label>
                                                <Input
                                                    id="accreditation_issued_date"
                                                    type="date"
                                                    value={data.accreditation_issued_date}
                                                    onChange={(e) => setData('accreditation_issued_date', e.target.value)}
                                                    max={new Date().toISOString().split('T')[0]}
                                                    className="mt-1"
                                                />
                                                {errors.accreditation_issued_date && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.accreditation_issued_date}</p>
                                                )}
                                            </div>

                                            <div>
                                                <Label htmlFor="accreditation_expiry_date">Expiry Date</Label>
                                                <Input
                                                    id="accreditation_expiry_date"
                                                    type="date"
                                                    value={data.accreditation_expiry_date}
                                                    onChange={(e) => setData('accreditation_expiry_date', e.target.value)}
                                                    min={data.accreditation_issued_date || undefined}
                                                    className="mt-1"
                                                />
                                                {errors.accreditation_expiry_date && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.accreditation_expiry_date}</p>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Indexations */}
                            <div className="space-y-4">
                                <h3 className="border-b pb-2 text-lg font-semibold text-gray-900">Indexations (Optional)</h3>
                                <p className="text-sm text-gray-600">Select databases where this journal is indexed</p>

                                <div className="space-y-3">
                                    {indexationOptions.map((option) => {
                                        const isSelected = data.indexations.some((i) => i.platform === option.value);
                                        const selectedItem = data.indexations.find((i) => i.platform === option.value);

                                        return (
                                            <div key={option.value} className="rounded-md border p-4">
                                                <div className="flex items-start gap-3">
                                                    <input
                                                        type="checkbox"
                                                        id={`indexation-${option.value}`}
                                                        checked={isSelected}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setData('indexations', [
                                                                    ...data.indexations,
                                                                    { platform: option.value, indexed_at: '' },
                                                                ]);
                                                            } else {
                                                                setData(
                                                                    'indexations',
                                                                    data.indexations.filter((i) => i.platform !== option.value),
                                                                );
                                                            }
                                                        }}
                                                        className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    />
                                                    <div className="flex-1">
                                                        <Label htmlFor={`indexation-${option.value}`} className="cursor-pointer font-medium">
                                                            {option.label}
                                                        </Label>
                                                        {isSelected && (
                                                            <div className="mt-2">
                                                                <Label className="text-xs text-gray-600">Indexed Date</Label>
                                                                <Input
                                                                    type="date"
                                                                    value={selectedItem?.indexed_at || ''}
                                                                    onChange={(e) => {
                                                                        setData(
                                                                            'indexations',
                                                                            data.indexations.map((i) =>
                                                                                i.platform === option.value
                                                                                    ? { ...i, indexed_at: e.target.value }
                                                                                    : i,
                                                                            ),
                                                                        );
                                                                    }}
                                                                    max={new Date().toISOString().split('T')[0]}
                                                                    className="mt-1"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                {errors.indexations && <p className="mt-1 text-sm text-red-600">{errors.indexations}</p>}
                            </div>

                            <div className="flex items-center justify-end gap-4 border-t pt-4">
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
