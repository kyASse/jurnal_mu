import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { JournalStatistics } from '@/types';
import { ApexOptions } from 'apexcharts';
import { BarChart3, PieChart, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import Chart from 'react-apexcharts';

interface StatisticsDashboardProps {
    statistics: JournalStatistics;
}

/**
 * Statistics Dashboard Component
 *
 * Displays journal statistics with interactive charts:
 * - Indexation distribution (Horizontal Bar Chart)
 * - Accreditation/SINTA distribution (Donut Chart)
 * - Scientific Field distribution (Bar Chart)
 */
export default function StatisticsDashboard({ statistics }: StatisticsDashboardProps) {
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        // Check if dark mode is enabled
        const checkDarkMode = () => {
            setIsDarkMode(document.documentElement.classList.contains('dark'));
        };

        // Initial check
        checkDarkMode();

        // Watch for changes
        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

        return () => observer.disconnect();
    }, []);

    // Theme-aware text color
    const textColor = isDarkMode ? '#e5e7eb' : '#1f2937';
    const subtleTextColor = isDarkMode ? '#9ca3af' : '#6b7280';

    // Indexation Chart Configuration
    const indexationChartOptions: ApexOptions = {
        chart: {
            type: 'bar',
            toolbar: { show: false },
            fontFamily: 'Inter, sans-serif',
            foreColor: textColor,
        },
        plotOptions: {
            bar: {
                horizontal: true,
                borderRadius: 4,
                dataLabels: {
                    position: 'top',
                },
            },
        },
        dataLabels: {
            enabled: true,
            formatter: (val: number) => val.toString(),
            offsetX: 0,
            style: {
                fontSize: '12px',
                colors: [isDarkMode ? '#1f2937' : '#fff'],
            },
        },
        colors: ['#008FFB'],
        xaxis: {
            categories: statistics.by_indexation.map((item) => item.name),
            title: { text: 'Jumlah Jurnal', style: { color: textColor } },
            labels: { style: { colors: textColor } },
        },
        yaxis: {
            title: { text: '', style: { color: textColor } },
            labels: { style: { colors: textColor } },
        },
        tooltip: {
            theme: isDarkMode ? 'dark' : 'light',
            y: {
                formatter: (val: number, opts) => {
                    const percentage = statistics.by_indexation[opts.dataPointIndex]?.percentage || 0;
                    return `${val} jurnal (${percentage}%)`;
                },
            },
            style: {
                fontSize: '12px',
            },
        },
    };

    const indexationChartSeries = [
        {
            name: 'Jurnal Terindeks',
            data: statistics.by_indexation.map((item) => item.count),
        },
    ];

    // Accreditation/SINTA Chart Configuration
    const accreditationChartOptions: ApexOptions = {
        chart: {
            type: 'donut',
            fontFamily: 'Inter, sans-serif',
            foreColor: textColor,
        },
        labels: statistics.by_accreditation.map((item) => item.label),
        colors: [
            '#94a3b8', // Non-Sinta (gray)
            '#0077B5', // SINTA 1 (navy blue)
            '#008FFB', // SINTA 2 (ocean blue)
            '#00E396', // SINTA 3 (mint green)
            '#feb019', // SINTA 4 (amber orange)
            '#ff455f', // SINTA 5 (coral red)
            '#775dd0', // SINTA 6 (amethyst purple)
        ],
        dataLabels: {
            enabled: true,
            formatter: (val: number) => `${val.toFixed(1)}%`,
            style: {
                colors: [textColor],
            },
        },
        legend: {
            position: 'bottom',
            horizontalAlign: 'center',
            labels: {
                colors: textColor,
            },
        },
        tooltip: {
            theme: isDarkMode ? 'dark' : 'light',
            y: {
                formatter: (val: number) => `${val} jurnal`,
            },
            style: {
                fontSize: '12px',
            },
        },
        plotOptions: {
            pie: {
                donut: {
                    size: '65%',
                    labels: {
                        show: true,
                        name: { show: true, color: textColor },
                        value: {
                            show: true,
                            fontSize: '24px',
                            fontWeight: 'bold',
                            color: textColor,
                        },
                        total: {
                            show: true,
                            label: 'Total Jurnal',
                            color: subtleTextColor,
                            formatter: () => statistics.totals.total_journals.toString(),
                        },
                    },
                },
            },
        },
    };

    const accreditationChartSeries = statistics.by_accreditation.map((item) => item.count);

    // Scientific Field Chart Configuration
    const scientificFieldChartOptions: ApexOptions = {
        chart: {
            type: 'bar',
            toolbar: { show: false },
            fontFamily: 'Inter, sans-serif',
            foreColor: textColor,
        },
        plotOptions: {
            bar: {
                borderRadius: 4,
                dataLabels: {
                    position: 'top',
                },
            },
        },
        dataLabels: {
            enabled: true,
            formatter: (val: number) => val.toString(),
            offsetY: -20,
            style: {
                fontSize: '12px',
                colors: [isDarkMode ? '#f3f4f6' : '#304758'],
            },
        },
        colors: ['#00E396'],
        xaxis: {
            categories: statistics.by_scientific_field.map((item) => item.name),
            title: { text: '', style: { color: textColor } },
            labels: {
                rotate: -45,
                rotateAlways: true,
                style: {
                    fontSize: '11px',
                    colors: textColor,
                },
            },
        },
        yaxis: {
            title: { text: 'Jumlah Jurnal', style: { color: textColor } },
            labels: { style: { colors: textColor } },
        },
        tooltip: {
            theme: isDarkMode ? 'dark' : 'light',
            y: {
                formatter: (val: number, opts) => {
                    const percentage = statistics.by_scientific_field[opts.dataPointIndex]?.percentage || 0;
                    return `${val} jurnal (${percentage}%)`;
                },
            },
            style: {
                fontSize: '12px',
            },
        },
    };

    const scientificFieldChartSeries = [
        {
            name: 'Jurnal',
            data: statistics.by_scientific_field.map((item) => item.count),
        },
    ];

    // Check if there's no data
    const hasIndexationData = statistics.by_indexation.length > 0;
    const hasScientificFieldData = statistics.by_scientific_field.length > 0;

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Jurnal</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{statistics.totals.total_journals}</div>
                        <p className="text-xs text-muted-foreground">Jurnal di universitas Anda</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Jurnal Terindeks</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{statistics.totals.indexed_journals}</div>
                        <p className="text-xs text-muted-foreground">
                            {statistics.totals.total_journals > 0
                                ? `${Math.round((statistics.totals.indexed_journals / statistics.totals.total_journals) * 100)}% dari total`
                                : 'Tidak ada data'}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Jurnal SINTA</CardTitle>
                        <PieChart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{statistics.totals.sinta_journals}</div>
                        <p className="text-xs text-muted-foreground">
                            {statistics.totals.total_journals > 0
                                ? `${Math.round((statistics.totals.sinta_journals / statistics.totals.total_journals) * 100)}% terakreditasi SINTA`
                                : 'Tidak ada data'}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Non-SINTA</CardTitle>
                        <PieChart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{statistics.totals.non_sinta_journals}</div>
                        <p className="text-xs text-muted-foreground">
                            {statistics.totals.total_journals > 0
                                ? `${Math.round((statistics.totals.non_sinta_journals / statistics.totals.total_journals) * 100)}% belum terakreditasi`
                                : 'Tidak ada data'}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Grid */}
            <div className="grid gap-6 md:grid-cols-3">
                {/* Indexation Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Distribusi Indeksasi</CardTitle>
                        <CardDescription>Jumlah jurnal berdasarkan platform indeksasi</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {hasIndexationData ? (
                            <Chart options={indexationChartOptions} series={indexationChartSeries} type="bar" height={300} />
                        ) : (
                            <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">Tidak ada data indeksasi</div>
                        )}
                    </CardContent>
                </Card>

                {/* Accreditation Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Distribusi Akreditasi SINTA</CardTitle>
                        <CardDescription>Persentase jurnal berdasarkan ranking SINTA</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Chart options={accreditationChartOptions} series={accreditationChartSeries} type="donut" height={300} />
                    </CardContent>
                </Card>

                {/* Scientific Field Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Distribusi Bidang Ilmu</CardTitle>
                        <CardDescription>Jumlah jurnal per bidang ilmu</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {hasScientificFieldData ? (
                            <Chart options={scientificFieldChartOptions} series={scientificFieldChartSeries} type="bar" height={300} />
                        ) : (
                            <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">Tidak ada data bidang ilmu</div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
