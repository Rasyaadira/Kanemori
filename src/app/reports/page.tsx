'use client';
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { formatCurrency, compactCurrency, getCurrentMonth } from '@/lib/utils';
import MonthSelector from '@/components/MonthSelector';

interface ReportData {
  monthlyTrend: Array<{ month: string; income: number; expense: number }>;
  expenseByCategory: Array<{ name: string; icon: string; color: string; total: number }>;
  incomeByCategory: Array<{ name: string; icon: string; color: string; total: number }>;
  totalIncome: number; totalExpense: number;
}

const BLUE_SPECTRUM = ['#1A2F6E', '#2853FF', '#4A7BFF', '#66BFE8', '#8BD0F0', '#B8E2F8', '#3D6AFF', '#5598E8'];

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [month, setMonth] = useState(getCurrentMonth());

  useEffect(() => {
    fetch(`/api/reports?month=${month}`).then(r => r.json()).then(setData);
  }, [month]);

  if (!data) return <p style={{ color: 'var(--text-muted)', padding: 32, fontSize: 14 }}>Loading reports...</p>;

  const renderLegend = (items: Array<{ name: string; total: number }>, totalAmount: number) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {items.map((c, i) => (
        <div key={i} className="legend-item">
          <div className="legend-left">
            <div className="color-marker" style={{ background: BLUE_SPECTRUM[i % BLUE_SPECTRUM.length] }} />
            <span>{c.name}</span>
          </div>
          <span className="legend-pct">{formatCurrency(c.total)}</span>
        </div>
      ))}
    </div>
  );

  return (
    <>
      <div className="page-header">
        <div><h1>Reports</h1><p className="page-header-subtitle">Financial analysis & insights</p></div>
        <MonthSelector value={month} onChange={setMonth} />
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        <div className="card" style={{ padding: 18 }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4, fontWeight: 500 }}>Total Income</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--income-color)', fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(data.totalIncome)}</div>
        </div>
        <div className="card" style={{ padding: 18 }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4, fontWeight: 500 }}>Total Expense</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--expense-color)', fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(data.totalExpense)}</div>
        </div>
        <div className="card" style={{ padding: 18 }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4, fontWeight: 500 }}>Net</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: data.totalIncome - data.totalExpense >= 0 ? 'var(--success)' : 'var(--danger)', fontVariantNumeric: 'tabular-nums' }}>
            {formatCurrency(data.totalIncome - data.totalExpense)}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Expense by Category */}
        <div className="card">
          <div className="card-header"><h3 className="card-title">Expense by Category</h3></div>
          <div className="card-body">
            {data.expenseByCategory.length === 0 ? <p style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: 13 }}>No data</p> : (
              <>
                <div style={{ height: 200 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={data.expenseByCategory} dataKey="total" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} strokeWidth={0}>
                        {data.expenseByCategory.map((_, i) => <Cell key={i} fill={BLUE_SPECTRUM[i % BLUE_SPECTRUM.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {renderLegend(data.expenseByCategory, data.totalExpense)}
              </>
            )}
          </div>
        </div>

        {/* Income by Category */}
        <div className="card">
          <div className="card-header"><h3 className="card-title">Income by Category</h3></div>
          <div className="card-body">
            {data.incomeByCategory.length === 0 ? <p style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: 13 }}>No data</p> : (
              <>
                <div style={{ height: 200 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={data.incomeByCategory} dataKey="total" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} strokeWidth={0}>
                        {data.incomeByCategory.map((_, i) => <Cell key={i} fill={BLUE_SPECTRUM[i % BLUE_SPECTRUM.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {renderLegend(data.incomeByCategory, data.totalIncome)}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header"><h3 className="card-title">6-Month Trend</h3></div>
        <div className="card-body" style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.monthlyTrend} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} tickFormatter={compactCurrency} width={50} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13 }} />
              <Legend iconType="circle" iconSize={8} />
              <Bar dataKey="income" name="Income" fill="#2853FF" radius={[4, 4, 0, 0]} maxBarSize={32} />
              <Bar dataKey="expense" name="Expense" fill="#66BFE8" radius={[4, 4, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}
