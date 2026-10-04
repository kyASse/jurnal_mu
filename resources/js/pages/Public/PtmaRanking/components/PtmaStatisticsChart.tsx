import React, { useMemo, useState } from 'react';
import {
    Bar,
    BarChart,
    Cell,
    PolarAngleAxis,
    PolarGrid,
    Radar,
    RadarChart,
    XAxis,
    YAxis,
} from 'recharts';
import { BarChart3, ChevronDown, ChevronUp, Compass } from 'lucide-react';
import {
    ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PtmaMetric } from '../types';

export interface PtmaStatisticsChartProps {
    metrics: PtmaMetric[];
    currentSort?: string;
}

interface MetricConfig {
    label: string;
    field: (item: PtmaMetric) => number;
}

const METRIC_CONFIGS: Record<string, MetricConfig> = {
    sinta_overall: {
        label: 'Skor SINTA Overall',
        field: (m) => Number(m.sinta_score_overall) || 0,
    },
    sinta_3yr: {
        label: 'Skor SINTA 3 Tahun',
        field: (m) => Number(m.sinta_score_3yr) || 0,
    },
    scopus: {
        label: 'Dokumen Scopus',
        field: (m) => Number(m.scopus_docs) || 0,
    },
    garuda: {
        label: 'Dokumen Garuda',
        field: (m) => Number(m.garuda_docs) || 0,
    },
    wos: {
        label: 'Dokumen Web of Science',
        field: (m) => Number(m.wos_docs) || 0,
    },
    ipr: {
        label: 'Luaran HKI / Paten',
        field: (m) => Number(m.ipr_count) || 0,
    },
    research: {
        label: 'Proposal Penelitian',
        field: (m) => Number(m.research_count) || 0,
    },
    service: {
        label: 'Proposal Pengabdian',
        field: (m) => Number(m.service_count) || 0,
    },
};

const RADAR_AXES = [
    { key: 'scopus_docs', label: 'Scopus' },
    { key: 'garuda_docs', label: 'Garuda' },
    { key: 'wos_docs', label: 'WoS' },
    { key: 'ipr_count', label: 'HKI' },
    { key: 'research_count', label: 'Penelitian' },
    { key: 'service_count', label: 'Pengabdian' },
] as const;

export const PtmaStatisticsChart: React.FC<PtmaStatisticsChartProps> = ({
    metrics,
    currentSort = 'sinta_overall',
}) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [activeTab, setActiveTab] = useState<'bar' | 'radar'>('bar');

    const activeMetricConfig = useMemo(() => {
        return METRIC_CONFIGS[currentSort] ?? METRIC_CONFIGS.sinta_overall;
    }, [currentSort]);

    // Top 10 data for Horizontal Bar Chart
    const barData = useMemo(() => {
        if (!metrics || metrics.length === 0) return [];

        return metrics.slice(0, 10).map((item, index) => {
            const univ = item.university;
            const shortName =
                univ?.short_name ||
                univ?.code ||
                (univ?.name ? univ.name.substring(0, 6) : `PTMA #${index + 1}`);

            return {
                name: shortName,
                fullName: univ?.name || shortName,
                value: activeMetricConfig.field(item),
                rank: item.ranking_position || index + 1,
            };
        });
    }, [metrics, activeMetricConfig]);

    const barChartConfig: ChartConfig = useMemo(() => {
        return {
            value: {
                label: activeMetricConfig.label,
                color: 'var(--chart-1)',
            },
        };
    }, [activeMetricConfig]);

    // Top 3 data for Radar Chart
    const top3 = useMemo(() => {
        if (!metrics || metrics.length === 0) return [];
        return metrics.slice(0, 3);
    }, [metrics]);

    const radarChartConfig: ChartConfig = useMemo(() => {
        return {
            univ_0: {
                label:
                    top3[0]?.university?.short_name ||
                    top3[0]?.university?.code ||
                    top3[0]?.university?.name ||
                    'Peringkat 1',
                color: 'var(--chart-1)',
            },
            univ_1: {
                label:
                    top3[1]?.university?.short_name ||
                    top3[1]?.university?.code ||
                    top3[1]?.university?.name ||
                    'Peringkat 2',
                color: 'var(--chart-2)',
            },
            univ_2: {
                label:
                    top3[2]?.university?.short_name ||
                    top3[2]?.university?.code ||
                    top3[2]?.university?.name ||
                    'Peringkat 3',
                color: 'var(--chart-3)',
            },
        };
    }, [top3]);

    const radarData = useMemo(() => {
        if (top3.length === 0) return [];

        return RADAR_AXES.map((axis) => {
            const rawValues = top3.map(
                (m) => Number(m[axis.key as keyof PtmaMetric]) || 0
            );
            const maxVal = Math.max(...rawValues, 0);

            const row: Record<string, any> = {
                subject: axis.label,
                fullMark: 100,
            };

            top3.forEach((m, idx) => {
                const raw = Number(m[axis.key as keyof PtmaMetric]) || 0;
                const normalized = maxVal > 0 ? Math.round((raw / maxVal) * 100) : 0;
                row[`univ_${idx}`] = normalized;
                row[`raw_${idx}`] = raw;
            });

            return row;
        });
    }, [top3]);

    if (!metrics || metrics.length === 0) {
        return null;
    }

    return (
        <section
            aria-label="Statistik dan Komparasi PTMA"
            className="w-full mb-8 rounded-xl border border-border/80 bg-card p-4 sm:p-6 shadow-xs transition-all"
        >
            {/* Header with Title, Subtitle, and Collapsible Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/50">
                <div>
                    <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                        Statistik &amp; Komparasi PTMA
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Benchmark 10 besar berdasarkan metrik terpilih ({activeMetricConfig.label}) dan perbandingan profil riset top 3
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setIsCollapsed((prev) => !prev)}
                    className="inline-flex items-center gap-1.5 self-start sm:self-auto px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground rounded-lg border border-border hover:bg-muted/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-expanded={!isCollapsed}
                >
                    {isCollapsed ? (
                        <>
                            <span>Tampilkan Grafik</span>
                            <ChevronDown className="h-3.5 w-3.5" />
                        </>
                    ) : (
                        <>
                            <span>Sembunyikan Grafik</span>
                            <ChevronUp className="h-3.5 w-3.5" />
                        </>
                    )}
                </button>
            </div>

            {/* Collapsible Chart Content */}
            {!isCollapsed && (
                <div className="pt-4">
                    <Tabs
                        value={activeTab}
                        onValueChange={(val) => setActiveTab(val as 'bar' | 'radar')}
                        className="w-full"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                            <TabsList className="grid grid-cols-2 w-full sm:w-auto h-9">
                                <TabsTrigger
                                    value="bar"
                                    onClick={() => setActiveTab('bar')}
                                    className="gap-2 text-xs"
                                >
                                    <BarChart3 className="h-3.5 w-3.5" />
                                    <span>Top 10 Benchmark</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="radar"
                                    onClick={() => setActiveTab('radar')}
                                    className="gap-2 text-xs"
                                >
                                    <Compass className="h-3.5 w-3.5" />
                                    <span>Profil Riset Top 3</span>
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        {/* Tab 1: Dynamic Top 10 Horizontal Bar Chart */}
                        <TabsContent value="bar" className="mt-0 focus-visible:outline-none">
                            <div className="rounded-lg border border-border/40 bg-muted/20 p-3 sm:p-4">
                                <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                                    <span>
                                        10 Kampus Teratas &bull; {activeMetricConfig.label}
                                    </span>
                                    <span className="flex items-center gap-3">
                                        <span className="inline-flex items-center gap-1.5">
                                            <span
                                                className="h-2.5 w-2.5 rounded-[2px]"
                                                style={{ backgroundColor: 'var(--chart-3)' }}
                                            />
                                            <span>#1 Unggulan</span>
                                        </span>
                                        <span className="inline-flex items-center gap-1.5">
                                            <span
                                                className="h-2.5 w-2.5 rounded-[2px]"
                                                style={{ backgroundColor: 'var(--chart-1)' }}
                                            />
                                            <span>#2-#10</span>
                                        </span>
                                    </span>
                                </div>
                                <ChartContainer
                                    config={barChartConfig}
                                    className="h-[340px] w-full aspect-auto"
                                >
                                    <BarChart
                                        data={barData}
                                        layout="vertical"
                                        margin={{ top: 8, right: 24, left: 16, bottom: 8 }}
                                    >
                                        <XAxis
                                            type="number"
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(val) =>
                                                Number(val).toLocaleString('id-ID')
                                            }
                                        />
                                        <YAxis
                                            dataKey="name"
                                            type="category"
                                            tickLine={false}
                                            axisLine={false}
                                            width={72}
                                            tick={{ fontSize: 11 }}
                                        />
                                        <ChartTooltip
                                            cursor={{ fill: 'rgba(100, 116, 139, 0.08)' }}
                                            content={
                                                <ChartTooltipContent
                                                    labelFormatter={(_, payload) =>
                                                        payload?.[0]?.payload?.fullName
                                                    }
                                                    formatter={(value) => (
                                                        <div className="flex items-center justify-between gap-3 w-full">
                                                            <span className="text-muted-foreground">
                                                                {activeMetricConfig.label}:
                                                            </span>
                                                            <span className="font-mono font-semibold tabular-nums text-foreground">
                                                                {Number(value).toLocaleString('id-ID')}
                                                            </span>
                                                        </div>
                                                    )}
                                                />
                                            }
                                        />
                                        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                            {barData.map((_, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={
                                                        index === 0
                                                            ? 'var(--chart-3)'
                                                            : 'var(--chart-1)'
                                                    }
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ChartContainer>
                            </div>
                        </TabsContent>

                        {/* Tab 2: Top 3 Research Profile Radar Chart */}
                        <TabsContent value="radar" className="mt-0 focus-visible:outline-none">
                            <div className="rounded-lg border border-border/40 bg-muted/20 p-3 sm:p-4">
                                <div className="mb-2 text-xs text-muted-foreground">
                                    <span>
                                        Perbandingan proporsional 6 sumbu riset untuk 3 kampus teratas (dinormalisasi 0-100% terhadap nilai tertinggi)
                                    </span>
                                </div>
                                <ChartContainer
                                    config={radarChartConfig}
                                    className="mx-auto aspect-square max-h-[360px] w-full"
                                >
                                    <RadarChart data={radarData}>
                                        <ChartTooltip
                                            cursor={false}
                                            content={
                                                <ChartTooltipContent
                                                    indicator="line"
                                                    formatter={(value, name, item) => {
                                                        const dataKey = item?.dataKey || '';
                                                        const key = String(name || '');
                                                        const idx =
                                                            dataKey === 'univ_0' ||
                                                            key === radarChartConfig.univ_0?.label ||
                                                            key === 'univ_0'
                                                                ? 0
                                                                : dataKey === 'univ_1' ||
                                                                  key === radarChartConfig.univ_1?.label ||
                                                                  key === 'univ_1'
                                                                ? 1
                                                                : 2;
                                                        const raw =
                                                            item?.payload?.[`raw_${idx}`];
                                                        const label =
                                                            radarChartConfig[`univ_${idx}`]
                                                                ?.label || name;
                                                        return (
                                                            <div className="flex items-center justify-between gap-4 w-full">
                                                                <span className="text-muted-foreground">
                                                                    {label}:
                                                                </span>
                                                                <span className="font-mono font-medium text-foreground">
                                                                    {raw !== undefined
                                                                        ? Number(
                                                                              raw
                                                                          ).toLocaleString(
                                                                              'id-ID'
                                                                          )
                                                                        : value}{' '}
                                                                    ({value}%)
                                                                </span>
                                                            </div>
                                                        );
                                                    }}
                                                />
                                            }
                                        />
                                        <PolarAngleAxis dataKey="subject" />
                                        <PolarGrid />
                                        {top3[0] && (
                                            <Radar
                                                name={String(
                                                    radarChartConfig.univ_0?.label || 'Rank 1'
                                                )}
                                                dataKey="univ_0"
                                                stroke="var(--color-univ_0)"
                                                strokeWidth={2}
                                                fill="var(--color-univ_0)"
                                                fillOpacity={0.25}
                                            />
                                        )}
                                        {top3[1] && (
                                            <Radar
                                                name={String(
                                                    radarChartConfig.univ_1?.label || 'Rank 2'
                                                )}
                                                dataKey="univ_1"
                                                stroke="var(--color-univ_1)"
                                                strokeWidth={2}
                                                fill="var(--color-univ_1)"
                                                fillOpacity={0.2}
                                            />
                                        )}
                                        {top3[2] && (
                                            <Radar
                                                name={String(
                                                    radarChartConfig.univ_2?.label || 'Rank 3'
                                                )}
                                                dataKey="univ_2"
                                                stroke="var(--color-univ_2)"
                                                strokeWidth={2}
                                                fill="var(--color-univ_2)"
                                                fillOpacity={0.15}
                                            />
                                        )}
                                        <ChartLegend content={<ChartLegendContent />} />
                                    </RadarChart>
                                </ChartContainer>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            )}
        </section>
    );
};
