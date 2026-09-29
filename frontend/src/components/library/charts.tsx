'use client';
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJs,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js';
import React from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJs.register(
  ArcElement,
  BarElement,
  CategoryScale,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
);

export const PALETTE = {
  navy: '#024F3A',
  teal: '#14B8A6',
  orange: '#FB923C',
  red: '#EF4444',
  blue: '#3B82F6',
  violet: '#8B5CF6',
  gray: '#9CA3AF',
  amber: '#F59E0B',
  pink: '#EC4899',
  lime: '#84CC16',
};
const SERIES = Object.values(PALETTE);

const baseScales = {
  x: { grid: { display: false }, ticks: { color: '#6B7280', font: { size: 11 } } },
  y: {
    beginAtZero: true,
    grid: { color: '#F1F2F6' },
    ticks: { color: '#6B7280', precision: 0, font: { size: 11 } },
  },
};

export function IssuedReturnedLine({
  labels,
  issued,
  returned,
  height = 260,
}: {
  labels: string[];
  issued: number[];
  returned: number[];
  height?: number;
}) {
  return (
    <div style={{ height }}>
      <Line
        data={{
          labels,
          datasets: [
            {
              label: 'Issued',
              data: issued,
              borderColor: PALETTE.navy,
              backgroundColor: 'rgba(2,79,58,0.08)',
              fill: true,
              tension: 0.35,
              pointRadius: 3,
            },
            {
              label: 'Returned',
              data: returned,
              borderColor: PALETTE.teal,
              backgroundColor: 'rgba(20,184,166,0.06)',
              fill: true,
              tension: 0.35,
              pointRadius: 3,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          plugins: { legend: { position: 'top', align: 'end', labels: { boxWidth: 12 } } },
          scales: baseScales,
        }}
      />
    </div>
  );
}

export function SimpleBar({
  labels,
  values,
  label,
  color = PALETTE.navy,
  horizontal = false,
  height = 260,
}: {
  labels: string[];
  values: number[];
  label: string;
  color?: string | string[];
  horizontal?: boolean;
  height?: number;
}) {
  return (
    <div style={{ height }}>
      <Bar
        data={{
          labels,
          datasets: [
            { label, data: values, backgroundColor: color, borderRadius: 6, maxBarThickness: 34 },
          ],
        }}
        options={{
          indexAxis: horizontal ? 'y' : 'x',
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: horizontal
            ? {
                x: baseScales.y,
                y: { grid: { display: false }, ticks: { color: '#374151', font: { size: 11 } } },
              }
            : baseScales,
        }}
      />
    </div>
  );
}

export function GroupedBar({
  labels,
  series,
  height = 260,
  stacked = false,
}: {
  labels: string[];
  series: { label: string; values: number[]; color: string }[];
  height?: number;
  stacked?: boolean;
}) {
  return (
    <div style={{ height }}>
      <Bar
        data={{
          labels,
          datasets: series.map((s) => ({
            label: s.label,
            data: s.values,
            backgroundColor: s.color,
            borderRadius: 4,
            maxBarThickness: 26,
          })),
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'top', align: 'end', labels: { boxWidth: 12 } } },
          scales: {
            x: { ...baseScales.x, stacked },
            y: { ...baseScales.y, stacked },
          },
        }}
      />
    </div>
  );
}

export function DonutChart({
  labels,
  values,
  colors = SERIES,
  height = 220,
  center,
}: {
  labels: string[];
  values: number[];
  colors?: string[];
  height?: number;
  center?: { value: React.ReactNode; label: string };
}) {
  const total = values.reduce((a, b) => a + b, 0);
  return (
    <div className="flex flex-row flex-wrap items-center justify-center gap-5">
      <div className="relative shrink-0" style={{ height, width: height }}>
        <Doughnut
          data={{
            labels,
            datasets: [
              { data: values, backgroundColor: colors, borderWidth: 2, borderColor: '#fff' },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: { legend: { display: false } },
          }}
        />
        {center && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-semibold text-primary">{center.value}</span>
            <span className="text-[11px] uppercase tracking-wide text-gray-500">
              {center.label}
            </span>
          </div>
        )}
      </div>
      <ul className="flex flex-col gap-1.5 text-sm min-w-[150px]">
        {labels.map((l, i) => (
          <li key={l} className="flex flex-row items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-sm shrink-0"
              style={{ background: colors[i % colors.length] }}
            />
            <span className="text-gray-600 flex-1">{l}</span>
            <span className="font-semibold text-primary">{values[i]}</span>
            <span className="text-xs text-gray-400 w-10 text-right">
              {total ? `${Math.round((values[i] / total) * 100)}%` : '0%'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export const seriesColors = SERIES;
