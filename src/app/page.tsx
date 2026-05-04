'use client';

import { useEffect, useState } from 'react';
import {
  TrendingUp, TrendingDown, Plus, ArrowUpRight, ArrowDownRight,
  Heart, ChevronRight,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { formatCurrency, formatCurrencyWithSign, formatDate, calcPercentage, compactCurrency, getBudgetStatus, getCurrentMonth } from '@/lib/utils';
import Link from 'next/link';
import MonthSelector from '@/components/MonthSelector';
import TransactionModal from '@/components/TransactionModal';

interface DashboardData {
  totalBalance: number;
  monthIncome: number;
  monthExpense: number;
  cashflowHealth: number;
  lastMonthExpense: number;
  lastMonthIncome: number;
  hideAllBalances: boolean;
  cashFlow: Array<{ day: string; income: number; expense: number }>;
  spendingByCategory: Array<{ name: string; color: string; icon: string; total: number }>;
  budgets: Array<{ id: number; budget_amount: number; name: string; color: string; icon: string; spent: number }>;
  goals: Array<{ id: number; name: string; target_amount: number; funded_amount: number; deadline: string; icon: string; color: string; status: string }>;
  recentTransactions: Array<{
    id: number; type: string; name: string; date: string; amount: number;
    admin_fee: number; category_name: string; category_icon: string;
    category_color: string; from_account_name: string; to_account_name: string;
  }>;
}

const BLUE_SPECTRUM = ['#1A2F6E', '#2853FF', '#4A7BFF', '#66BFE8', '#8BD0F0', '#B8E2F8'];

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(getCurrentMonth());
  const [showTxModal, setShowTxModal] = useState(false);

  const fetchDashboard = (m: string) => {
    setLoading(true);
    fetch(`/api/dashboard?month=${m}`)
      .then((res) => res.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchDashboard(month); }, [month]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading dashboard...</p>
      </div>
    );
  }

  if (!data) return <p style={{ color: 'var(--text-muted)', padding: 32 }}>Failed to load dashboard.</p>;

  const maskCurrency = (value: number) => data.hideAllBalances ? '•••••' : formatCurrency(value);
  const maskCurrencyWithSign = (value: number) => data.hideAllBalances ? '•••••' : formatCurrencyWithSign(value);
  const totalSpending = data.spendingByCategory.reduce((s, c) => s + c.total, 0);
  const expenseTrend = data.lastMonthExpense > 0
    ? Math.round(((data.monthExpense - data.lastMonthExpense) / data.lastMonthExpense) * 100)
    : 0;

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="page-header-subtitle">Your financial overview at a glance</p>
        </div>
        <div className="page-header-actions">
          <MonthSelector value={month} onChange={setMonth} />
          <button className="btn btn-primary" onClick={() => setShowTxModal(true)}>
            <Plus size={18} />
            Add Transaction
          </button>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* ====== MAIN COLUMN ====== */}
        <div className="dashboard-main">
          {/* Hero Balance Card */}
          <div className="hero-card">
            <p className="hero-balance-label">Total Balance</p>
            <p className="hero-balance-amount">{maskCurrency(data.totalBalance)}</p>
            {expenseTrend !== 0 && (
              <span className="hero-trend">
                {expenseTrend > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {Math.abs(expenseTrend)}% vs last month spending
              </span>
            )}

            <div className="hero-metrics">
              <div className="hero-metric">
                <div className="hero-metric-icon income">
                  <ArrowUpRight size={16} />
                </div>
                <p className="hero-metric-label">Income this month</p>
                <p className="hero-metric-value" style={{ color: 'var(--income-color)' }}>
                  {maskCurrency(data.monthIncome)}
                </p>
              </div>
              <div className="hero-metric">
                <div className="hero-metric-icon expense">
                  <ArrowDownRight size={16} />
                </div>
                <p className="hero-metric-label">Expense this month</p>
                <p className="hero-metric-value" style={{ color: 'var(--expense-color)' }}>
                  {maskCurrency(data.monthExpense)}
                </p>
              </div>
            </div>

            <div className="hero-actions">
              <div className="hero-health">
                <Heart size={14} />
                Cashflow: {maskCurrencyWithSign(data.cashflowHealth)}
              </div>
            </div>
          </div>

          {/* Cash Flow Chart */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Cash Flow</h3>
              <span className="badge badge-neutral">Daily in selected month</span>
            </div>
            <div className="card-body" style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.cashFlow} barGap={2} barCategoryGap="10%" margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                    minTickGap={0}
                    tickMargin={8}
                    tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                  />
                  <YAxis axisLine={false} tickLine={false}
                    tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                    tickFormatter={(v) => compactCurrency(v)} width={50} />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      background: 'var(--bg-card)', border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)',
                      fontSize: 13,
                    }}
                  />
                  <Legend iconType="circle" iconSize={8}
                    wrapperStyle={{ fontSize: 13, paddingTop: 8 }} />
                  <Bar dataKey="income" name="Income" fill="#2853FF"
                    radius={[4, 4, 0, 0]} maxBarSize={18} />
                  <Bar dataKey="expense" name="Expense" fill="#66BFE8"
                    radius={[4, 4, 0, 0]} maxBarSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Recent Transactions</h3>
              <Link href="/transactions" className="view-all">
                View All <ChevronRight size={14} style={{ verticalAlign: 'middle' }} />
              </Link>
            </div>
            <div className="card-body-compact">
              {data.recentTransactions.length === 0 ? (
                <div className="empty-state">
                  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 3L4 7l4 4" /><path d="M4 7h16" />
                    <path d="M16 21l4-4-4-4" /><path d="M20 17H4" />
                  </svg>
                  <h3>No transactions this month</h3>
                  <p>Start by adding your first transaction</p>
                </div>
              ) : (
                <div className="table-wrapper">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Account</th>
                        <th>Date</th>
                        <th style={{ textAlign: 'right' }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentTransactions.map((t) => (
                        <tr key={t.id}>
                          <td style={{ fontWeight: 500 }}>{t.name}</td>
                          <td>
                            {t.category_name && (
                              <span className={`badge badge-${t.type}`}>
                                {t.category_name}
                              </span>
                            )}
                            {!t.category_name && t.type === 'transfer' && (
                              <span className="badge badge-transfer">Transfer</span>
                            )}
                          </td>
                          <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                            {t.type === 'transfer'
                              ? `${t.from_account_name} → ${t.to_account_name}`
                              : t.from_account_name || t.to_account_name}
                          </td>
                          <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                            {formatDate(t.date)}
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 600 }}
                            className={`tabular-nums ${t.type === 'income' ? 'amount-positive' : t.type === 'expense' ? 'amount-negative' : ''}`}>
                            {t.type === 'income' && '+'}
                            {t.type === 'expense' && '-'}
                            {maskCurrency(t.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ====== RIGHT INSIGHT COLUMN ====== */}
        <div className="dashboard-aside">
          {/* Spending by Category */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Spending by Category</h3>
            </div>
            <div className="card-body">
              {data.spendingByCategory.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
                  No spending data this month
                </p>
              ) : (
                <>
                  <p style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, letterSpacing: -0.5, fontVariantNumeric: 'tabular-nums' }}>
                    {maskCurrency(totalSpending)}
                  </p>
                  <div style={{ height: 180, marginBottom: 12 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.spendingByCategory}
                          dataKey="total"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={78}
                          paddingAngle={3}
                          strokeWidth={0}
                        >
                          {data.spendingByCategory.map((_, i) => (
                            <Cell key={i} fill={BLUE_SPECTRUM[i % BLUE_SPECTRUM.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => formatCurrency(value)}
                          contentStyle={{
                            background: 'var(--bg-card)', border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-md)', fontSize: 13,
                          }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {data.spendingByCategory.map((cat, i) => (
                      <div key={i} className="legend-item">
                        <div className="legend-left">
                          <div className="color-marker" style={{ background: BLUE_SPECTRUM[i % BLUE_SPECTRUM.length] }} />
                          <span>{cat.name}</span>
                        </div>
                        <span className="legend-pct">
                          {totalSpending > 0 ? Math.round((cat.total / totalSpending) * 100) : 0}%
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Budget Progress */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Budget Progress</h3>
              <Link href="/budget" className="view-all">View All</Link>
            </div>
            <div className="card-body">
              {data.budgets.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '12px 0' }}>
                  No budgets set
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {data.budgets.map((b) => {
                    const pct = calcPercentage(b.spent, b.budget_amount);
                    const status = getBudgetStatus(b.spent, b.budget_amount);
                    return (
                      <div key={b.id}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div className="color-marker" style={{ background: 'var(--primary)' }} />
                            <span style={{ fontWeight: 500 }}>{b.name}</span>
                          </div>
                          <span style={{ color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>{pct}%</span>
                        </div>
                        <div className="progress-bar">
                          <div className={`progress-fill ${status}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 12, color: 'var(--text-muted)' }}>
                          <span>{maskCurrency(b.spent)}</span>
                          <span>{maskCurrency(b.budget_amount)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Goals Progress */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Goals Progress</h3>
              <Link href="/goals" className="view-all">View All</Link>
            </div>
            <div className="card-body">
              {data.goals.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '12px 0' }}>
                  No active goals
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {data.goals.map((g) => {
                    const pct = calcPercentage(g.funded_amount, g.target_amount);
                    return (
                      <div key={g.id}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div className="color-marker" style={{ background: 'var(--secondary)' }} />
                            <span style={{ fontWeight: 500 }}>{g.name}</span>
                          </div>
                          <span style={{ color: 'var(--primary)', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{pct}%</span>
                        </div>
                        <div className="progress-bar">
                          <div className="progress-fill healthy" style={{ width: `${pct}%` }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 12, color: 'var(--text-muted)' }}>
                          <span>{maskCurrency(g.funded_amount)}</span>
                          <span>{maskCurrency(g.target_amount)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <TransactionModal
        open={showTxModal}
        onClose={() => setShowTxModal(false)}
        onSaved={() => fetchDashboard(month)}
      />
    </>
  );
}
