import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import api from '../api/client';
import { useAuth } from '../context/AuthContext.jsx';

const CATEGORY_COLORS = ['#1F7A5C', '#C75D3D', '#C9A24B', '#5C7AEA', '#8B5CF6', '#2B3A52', '#E29578'];

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/transactions/summary/overview')
      .then((res) => setSummary(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ color: 'var(--text-600)' }}>Loading your overview…</div>;

  const balance = summary?.balance ?? 0;
  const isPositive = balance >= 0;

  return (
    <div>
      <header style={{ marginBottom: 32 }}>
        <div style={styles.eyebrow}>Overview</div>
        <h1 style={styles.h1}>Hey {user?.name?.split(' ')[0]}, here's where you stand.</h1>
      </header>

      <div style={styles.cardRow}>
        <SummaryCard label="Total income" value={summary?.totalIncome} tone="emerald" />
        <SummaryCard label="Total expenses" value={summary?.totalExpense} tone="rust" />
        <SummaryCard label="Balance" value={balance} tone={isPositive ? 'emerald' : 'rust'} highlight />
      </div>

      <div style={styles.chartGrid}>
        <div style={styles.panel}>
          <h3 style={styles.panelTitle}>Income vs. expenses by month</h3>
          {summary?.byMonth?.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={summary.byMonth}>
                <CartesianGrid stroke="var(--line)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--text-600)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--text-600)' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: '1px solid var(--line)', fontSize: 13 }}
                  formatter={(v) => `₹${v}`}
                />
                <Bar dataKey="income" fill="#1F7A5C" radius={[4, 4, 0, 0]} name="Income" />
                <Bar dataKey="expense" fill="#C75D3D" radius={[4, 4, 0, 0]} name="Expense" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState text="Add a few transactions to see your monthly trend." />
          )}
        </div>

        <div style={styles.panel}>
          <h3 style={styles.panelTitle}>Spending by category</h3>
          {summary?.byCategory?.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={summary.byCategory}
                  dataKey="total"
                  nameKey="category"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {summary.byCategory.map((entry, i) => (
                    <Cell key={entry.category} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `₹${v}`} contentStyle={{ borderRadius: 8, fontSize: 13 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState text="No expenses logged yet." />
          )}
          <div style={styles.legend}>
            {summary?.byCategory?.slice(0, 6).map((c, i) => (
              <div key={c.category} style={styles.legendRow}>
                <span style={{ ...styles.dot, background: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
                <span style={{ flex: 1 }}>{c.category}</span>
                <span className="mono">₹{c.total.toFixed(0)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, tone, highlight }) {
  const color = tone === 'emerald' ? 'var(--emerald)' : 'var(--rust)';
  return (
    <div style={{ ...styles.card, ...(highlight ? { borderColor: color } : {}) }}>
      <div style={styles.cardLabel}>{label}</div>
      <div className="mono" style={{ ...styles.cardValue, color }}>
        ₹{(value ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
      </div>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div style={styles.empty}>
      <span style={{ fontSize: 22 }}>◈</span>
      <p>{text}</p>
    </div>
  );
}

const styles = {
  eyebrow: {
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: '1px',
    textTransform: 'uppercase',
    color: 'var(--text-400)',
    marginBottom: 6,
  },
  h1: {
    fontFamily: 'var(--font-display)',
    fontSize: 30,
    fontWeight: 600,
    margin: 0,
  },
  cardRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 16,
    marginBottom: 28,
  },
  card: {
    background: '#fff',
    border: '1px solid var(--line)',
    borderRadius: 'var(--radius-md)',
    padding: '20px 22px',
  },
  cardLabel: {
    fontSize: 12.5,
    color: 'var(--text-600)',
    fontWeight: 600,
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 26,
    fontWeight: 600,
  },
  chartGrid: {
    display: 'grid',
    gridTemplateColumns: '1.3fr 1fr',
    gap: 20,
  },
  panel: {
    background: '#fff',
    border: '1px solid var(--line)',
    borderRadius: 'var(--radius-md)',
    padding: '22px 22px 8px',
  },
  panelTitle: {
    fontSize: 14.5,
    fontWeight: 600,
    margin: '0 0 12px',
  },
  legend: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    padding: '4px 4px 16px',
  },
  legendRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 13,
    color: 'var(--text-600)',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    flexShrink: 0,
  },
  empty: {
    height: 260,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-400)',
    gap: 8,
    fontSize: 13.5,
  },
};
