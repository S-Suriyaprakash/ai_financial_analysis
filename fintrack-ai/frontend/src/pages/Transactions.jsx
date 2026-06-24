import React, { useEffect, useState } from 'react';
import api from '../api/client';

const EXPENSE_CATEGORIES = ['Food & Mess', 'Rent/Hostel', 'Transport', 'Books & Supplies', 'Subscriptions', 'Entertainment', 'Health', 'Other'];
const INCOME_CATEGORIES = ['Allowance', 'Stipend/Part-time', 'Scholarship', 'Gift', 'Other'];

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterType, setFilterType] = useState('all');

  const [form, setForm] = useState({
    type: 'expense',
    category: EXPENSE_CATEGORIES[0],
    amount: '',
    note: '',
    txn_date: new Date().toISOString().slice(0, 10),
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  function load() {
    setLoading(true);
    api
      .get('/transactions', filterType !== 'all' ? { params: { type: filterType } } : {})
      .then((res) => setTransactions(res.data))
      .finally(() => setLoading(false));
  }

  useEffect(load, [filterType]);

  function updateForm(key, value) {
    setForm((f) => {
      const next = { ...f, [key]: value };
      if (key === 'type') {
        next.category = value === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0];
      }
      return next;
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    if (!form.amount || Number(form.amount) <= 0) {
      setFormError('Enter an amount greater than 0.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/transactions', { ...form, amount: Number(form.amount) });
      setForm((f) => ({ ...f, amount: '', note: '' }));
      setShowForm(false);
      load();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Could not add transaction.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    await api.delete(`/transactions/${id}`);
    setTransactions((t) => t.filter((x) => x.id !== id));
  }

  const categories = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div>
      <header style={styles.header}>
        <div>
          <div style={styles.eyebrow}>Ledger</div>
          <h1 style={styles.h1}>Every rupee, accounted for.</h1>
        </div>
        <button style={styles.addBtn} onClick={() => setShowForm((s) => !s)}>
          {showForm ? 'Cancel' : '+ Add transaction'}
        </button>
      </header>

      {showForm && (
        <form onSubmit={handleSubmit} style={styles.formCard}>
          <div style={styles.formRow}>
            <ToggleGroup
              value={form.type}
              onChange={(v) => updateForm('type', v)}
              options={[
                { value: 'expense', label: 'Expense' },
                { value: 'income', label: 'Income' },
              ]}
            />
            <select style={styles.input} value={form.category} onChange={(e) => updateForm('category', e.target.value)}>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <input
              style={{ ...styles.input, width: 130 }}
              type="number"
              min="0.01"
              step="0.01"
              placeholder="Amount (₹)"
              value={form.amount}
              onChange={(e) => updateForm('amount', e.target.value)}
            />
            <input
              style={{ ...styles.input, width: 150 }}
              type="date"
              value={form.txn_date}
              onChange={(e) => updateForm('txn_date', e.target.value)}
            />
          </div>
          <div style={styles.formRow}>
            <input
              style={{ ...styles.input, flex: 1 }}
              type="text"
              placeholder="Note (optional)"
              value={form.note}
              onChange={(e) => updateForm('note', e.target.value)}
            />
            <button type="submit" disabled={submitting} style={styles.submitBtn}>
              {submitting ? 'Saving…' : 'Save'}
            </button>
          </div>
          {formError && <div style={styles.formError}>{formError}</div>}
        </form>
      )}

      <div style={styles.filterRow}>
        {['all', 'income', 'expense'].map((f) => (
          <button
            key={f}
            onClick={() => setFilterType(f)}
            style={{ ...styles.filterChip, ...(filterType === f ? styles.filterChipActive : {}) }}
          >
            {f === 'all' ? 'All' : f === 'income' ? 'Income' : 'Expenses'}
          </button>
        ))}
      </div>

      <div style={styles.list}>
        {loading ? (
          <div style={{ color: 'var(--text-600)', padding: 20 }}>Loading…</div>
        ) : transactions.length === 0 ? (
          <div style={styles.emptyState}>
            <span style={{ fontSize: 22 }}>☰</span>
            <p>No transactions yet. Add your first one above.</p>
          </div>
        ) : (
          transactions.map((t) => (
            <div key={t.id} style={styles.row}>
              <div style={{ ...styles.typeBar, background: t.type === 'income' ? 'var(--emerald)' : 'var(--rust)' }} />
              <div style={{ flex: 1 }}>
                <div style={styles.rowCategory}>{t.category}</div>
                {t.note && <div style={styles.rowNote}>{t.note}</div>}
              </div>
              <div className="mono" style={styles.rowDate}>
                {t.txn_date}
              </div>
              <div
                className="mono"
                style={{ ...styles.rowAmount, color: t.type === 'income' ? 'var(--emerald)' : 'var(--rust)' }}
              >
                {t.type === 'income' ? '+' : '−'}₹{t.amount.toLocaleString('en-IN')}
              </div>
              <button style={styles.deleteBtn} onClick={() => handleDelete(t.id)} aria-label="Delete transaction">
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function ToggleGroup({ value, onChange, options }) {
  return (
    <div style={styles.toggleGroup}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          style={{
            ...styles.toggleBtn,
            ...(value === opt.value ? styles.toggleBtnActive : {}),
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 24,
  },
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
    fontSize: 28,
    fontWeight: 600,
    margin: 0,
  },
  addBtn: {
    padding: '11px 18px',
    background: 'var(--ink-800)',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    fontWeight: 600,
    fontSize: 14,
  },
  formCard: {
    background: '#fff',
    border: '1px solid var(--line)',
    borderRadius: 'var(--radius-md)',
    padding: 18,
    marginBottom: 22,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  formRow: {
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap',
  },
  input: {
    padding: '10px 12px',
    border: '1px solid var(--line)',
    borderRadius: 'var(--radius-sm)',
    fontSize: 14,
  },
  submitBtn: {
    padding: '10px 20px',
    background: 'var(--emerald)',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    fontWeight: 600,
    fontSize: 14,
  },
  formError: {
    color: 'var(--rust)',
    fontSize: 13,
  },
  toggleGroup: {
    display: 'flex',
    border: '1px solid var(--line)',
    borderRadius: 'var(--radius-sm)',
    overflow: 'hidden',
  },
  toggleBtn: {
    padding: '10px 16px',
    border: 'none',
    background: '#fff',
    fontSize: 13.5,
    fontWeight: 600,
    color: 'var(--text-600)',
  },
  toggleBtnActive: {
    background: 'var(--ink-800)',
    color: '#fff',
  },
  filterRow: {
    display: 'flex',
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    padding: '7px 14px',
    borderRadius: 20,
    border: '1px solid var(--line)',
    background: '#fff',
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--text-600)',
  },
  filterChipActive: {
    background: 'var(--ink-800)',
    color: '#fff',
    borderColor: 'var(--ink-800)',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    background: '#fff',
    border: '1px solid var(--line)',
    borderRadius: 'var(--radius-sm)',
    padding: '13px 16px',
    marginBottom: 8,
  },
  typeBar: {
    width: 4,
    height: 32,
    borderRadius: 2,
    flexShrink: 0,
  },
  rowCategory: {
    fontWeight: 600,
    fontSize: 14.5,
  },
  rowNote: {
    fontSize: 12.5,
    color: 'var(--text-400)',
    marginTop: 2,
  },
  rowDate: {
    fontSize: 12.5,
    color: 'var(--text-400)',
    width: 90,
  },
  rowAmount: {
    fontWeight: 600,
    fontSize: 15,
    width: 110,
    textAlign: 'right',
  },
  deleteBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-400)',
    fontSize: 14,
    padding: 4,
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '60px 0',
    color: 'var(--text-400)',
    fontSize: 13.5,
  },
};
