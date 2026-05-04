'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatMonth } from '@/lib/utils';

interface MonthSelectorProps {
  value: string; // 'YYYY-MM'
  onChange: (month: string) => void;
}

export default function MonthSelector({ value, onChange }: MonthSelectorProps) {
  const change = (dir: number) => {
    const [y, m] = value.split('-').map(Number);
    const d = new Date(y, m - 1 + dir, 1);
    onChange(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  return (
    <div className="month-selector">
      <button className="btn btn-ghost btn-sm" onClick={() => change(-1)} aria-label="Previous month">
        <ChevronLeft size={16} />
      </button>
      <span className="month-selector-label">{formatMonth(value)}</span>
      <button className="btn btn-ghost btn-sm" onClick={() => change(1)} aria-label="Next month">
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
