# SINTA PTMA Ranking Statistical Visualization Chart Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menambahkan visualisasi data chart statistik berbasis shadcn chart (`recharts`) tepat di bawah `VariableSegmentedNav` dengan tab toggle antara **Top 10 Benchmark Bar Chart** (reaktif variabel) dan **Top 3 Research Profile Radar Chart**, serta fitur collapsible.

**Architecture:** Menggunakan shadcn `chart.tsx` wrapper di atas `recharts` yang memanfaatkan CSS variable `--chart-1` s/d `--chart-5` dari `resources/css/app.css`. Komponen `PtmaStatisticsChart.tsx` menerima `metrics` dan `currentSort`, mengomposisikan data diskrit Top 10 ke Horizontal Bar Chart dan data multidimensi Top 3 ke Polar Radar Chart.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, Radix UI Tabs, Recharts 3.x, shadcn/ui.

**Spec:** [Opsi B: Kombinasi Horizontal Bar + Radar Chart dengan Tab Toggle]

## Global Constraints
- Memakai komponen `chart.tsx` shadcn/ui dan `recharts`.
- Konsisten dengan token warna `resources/css/app.css` (`var(--chart-1)` s/d `var(--chart-5)`, `bg-card`, `border-border`, `text-foreground`, `text-muted-foreground`).
- Menjaga performa render dan kompatibilitas SSR (zero window/document crash).
- Zero broken TypeScript types: `npm run types` harus lulus 0 error.
- Semua tes Vitest harus lulus 100%.

---

### Task 1: Install `recharts` & Implement shadcn `chart.tsx` Component

**Files:**
- Modify: `package.json`
- Create: `resources/js/components/ui/chart.tsx`
- Create: `resources/js/components/ui/__tests__/chart.test.tsx`

**Interfaces:**
- Produces: `ChartContainer`, `ChartTooltip`, `ChartTooltipContent`, `ChartLegend`, `ChartLegendContent`, `ChartConfig`

- [ ] **Step 1: Install `recharts` dependency**
```bash
npm install recharts
```

- [ ] **Step 2: Create failing test for `ChartContainer`**
File: `resources/js/components/ui/__tests__/chart.test.tsx`
```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ChartContainer, ChartConfig } from '../chart';

describe('ChartContainer Component', () => {
    it('renders chart container with CSS color variables', () => {
        const config: ChartConfig = {
            metric: {
                label: 'Skor SINTA',
                color: 'var(--chart-1)',
            },
        };

        render(
            <ChartContainer config={config} data-testid="test-chart">
                <div>Chart Content</div>
            </ChartContainer>
        );

        const container = screen.getByTestId('test-chart');
        expect(container).toBeInTheDocument();
        expect(screen.getByText('Chart Content')).toBeInTheDocument();
    });
});
```

- [ ] **Step 3: Run test to verify it fails**
```bash
npx vitest run resources/js/components/ui/__tests__/chart.test.tsx
```
Expected: FAIL (Cannot find module '../chart')

- [ ] **Step 4: Implement `resources/js/components/ui/chart.tsx`**
Create official shadcn `chart.tsx` component adapted for project setup with `cn` helper and Tailwind theme tokens.

- [ ] **Step 5: Run test to verify it passes**
```bash
npx vitest run resources/js/components/ui/__tests__/chart.test.tsx
```
Expected: PASS

- [ ] **Step 6: Commit Task 1**
```bash
git add package.json package-lock.json resources/js/components/ui/chart.tsx resources/js/components/ui/__tests__/chart.test.tsx
git commit -m "feat(ui): add recharts and shadcn chart component"
```

---

### Task 2: Implement `PtmaStatisticsChart.tsx` Component

**Files:**
- Create: `resources/js/pages/Public/PtmaRanking/components/PtmaStatisticsChart.tsx`
- Create: `resources/js/pages/Public/PtmaRanking/__tests__/PtmaStatisticsChart.test.tsx`

**Interfaces:**
- Consumes: `PtmaMetric` from `../types`, `ChartContainer`, `ChartTooltipContent` from `@/components/ui/chart`, `Tabs` from `@/components/ui/tabs`
- Produces: `PtmaStatisticsChart` component with props `{ metrics: PtmaMetric[]; currentSort: string; }`

- [ ] **Step 1: Write failing test for `PtmaStatisticsChart`**
File: `resources/js/pages/Public/PtmaRanking/__tests__/PtmaStatisticsChart.test.tsx`
```tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PtmaStatisticsChart } from '../components/PtmaStatisticsChart';
import { PtmaMetric } from '../types';

describe('PtmaStatisticsChart Component', () => {
    const mockMetrics: PtmaMetric[] = [
        {
            id: 1,
            ranking_position: 1,
            sinta_score_overall: 350000,
            sinta_score_3yr: 120000,
            scopus_docs: 1500,
            garuda_docs: 3000,
            wos_docs: 400,
            ipr_count: 300,
            research_count: 500,
            service_count: 250,
            university: { id: 1, name: 'Universitas Muhammadiyah Surakarta', short_name: 'UMS', code: 'UMS' },
        },
        {
            id: 2,
            ranking_position: 2,
            sinta_score_overall: 300000,
            sinta_score_3yr: 100000,
            scopus_docs: 1200,
            garuda_docs: 2800,
            wos_docs: 350,
            ipr_count: 250,
            research_count: 450,
            service_count: 220,
            university: { id: 2, name: 'Universitas Muhammadiyah Yogyakarta', short_name: 'UMY', code: 'UMY' },
        },
    ];

    it('renders chart container with tabs and collapses when toggle clicked', () => {
        render(<PtmaStatisticsChart metrics={mockMetrics} currentSort="sinta_overall" />);

        expect(screen.getByText('Visualisasi Statistik & Benchmark')).toBeInTheDocument();
        expect(screen.getByText('Top 10 Benchmark')).toBeInTheDocument();
        expect(screen.getByText('Profil Riset Top 3')).toBeInTheDocument();

        const toggleBtn = screen.getByRole('button', { name: /sembunyikan grafik/i });
        fireEvent.click(toggleBtn);

        expect(screen.getByRole('button', { name: /tampilkan grafik/i })).toBeInTheDocument();
    });

    it('switches to radar tab on click', () => {
        render(<PtmaStatisticsChart metrics={mockMetrics} currentSort="sinta_overall" />);

        const radarTab = screen.getByText('Profil Riset Top 3');
        fireEvent.click(radarTab);

        expect(radarTab).toHaveAttribute('data-state', 'active');
    });
});
```

- [ ] **Step 2: Run test to verify it fails**
```bash
npx vitest run resources/js/pages/Public/PtmaRanking/__tests__/PtmaStatisticsChart.test.tsx
```
Expected: FAIL (Cannot find module '../components/PtmaStatisticsChart')

- [ ] **Step 3: Implement `PtmaStatisticsChart.tsx`**
File: `resources/js/pages/Public/PtmaRanking/components/PtmaStatisticsChart.tsx`
- Header: Title, subtitle, variable badge, collapsible toggle.
- Tab 1: Horizontal Bar Chart (Top 10 PTMA according to `currentSort`, using `ResponsiveContainer`, `BarChart layout="vertical"`, custom color highlight for #1).
- Tab 2: Radar Chart (Top 3 PTMA with 6 research axes: Scopus, Garuda, WoS, HKI, Riset, Pengabdian).
- Empty state guard: returns null if `metrics` is empty.

- [ ] **Step 4: Run test to verify it passes**
```bash
npx vitest run resources/js/pages/Public/PtmaRanking/__tests__/PtmaStatisticsChart.test.tsx
```
Expected: PASS

- [ ] **Step 5: Commit Task 2**
```bash
git add resources/js/pages/Public/PtmaRanking/components/PtmaStatisticsChart.tsx resources/js/pages/Public/PtmaRanking/__tests__/PtmaStatisticsChart.test.tsx
git commit -m "feat(sinta): implement PtmaStatisticsChart with Top 10 Bar and Top 3 Radar tabs"
```

---

### Task 3: Integrate into `Index.tsx` & End-to-End Verification

**Files:**
- Modify: `resources/js/pages/Public/PtmaRanking/Index.tsx:90-100`
- Modify: `resources/js/pages/Public/PtmaRanking/__tests__/PtmaRankingLeaderboard.test.tsx`

**Interfaces:**
- Consumes: `<PtmaStatisticsChart metrics={rankings?.data ?? []} currentSort={activeSort} />`

- [ ] **Step 1: Integrate component into `Index.tsx`**
Insert `<PtmaStatisticsChart metrics={rankings?.data ?? []} currentSort={activeSort} />` directly below `<VariableSegmentedNav currentSort={activeSort} filters={safeFilters} />` and above `<FilterControlBar filters={safeFilters} />`.

- [ ] **Step 2: Update existing page test in `PtmaRankingLeaderboard.test.tsx`**
Verify the page renders the chart container alongside the rest of the layout.

- [ ] **Step 3: Run all test suites**
```bash
npm run types
npx vitest run resources/js/pages/Public/PtmaRanking/
npm run build
```
Expected: All tests pass, 0 type errors, Vite build successful.

- [ ] **Step 4: Commit Task 3**
```bash
git add resources/js/pages/Public/PtmaRanking/Index.tsx resources/js/pages/Public/PtmaRanking/__tests__/PtmaRankingLeaderboard.test.tsx
git commit -m "feat(sinta): integrate PtmaStatisticsChart below VariableSegmentedNav"
```

---
