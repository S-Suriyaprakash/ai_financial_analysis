const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../db/database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// Create a transaction
router.post(
  '/',
  [
    body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than 0'),
    body('txn_date').notEmpty().withMessage('Date is required'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { type, category, amount, note, txn_date } = req.body;
    const result = db
      .prepare(
        `INSERT INTO transactions (user_id, type, category, amount, note, txn_date)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .run(req.userId, type, category, amount, note || '', txn_date);

    const txn = db.prepare('SELECT * FROM transactions WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(txn);
  }
);

// List transactions (optional filters: type, category, from, to)
router.get('/', (req, res) => {
  const { type, category, from, to } = req.query;
  let query = 'SELECT * FROM transactions WHERE user_id = ?';
  const params = [req.userId];

  if (type) {
    query += ' AND type = ?';
    params.push(type);
  }
  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }
  if (from) {
    query += ' AND txn_date >= ?';
    params.push(from);
  }
  if (to) {
    query += ' AND txn_date <= ?';
    params.push(to);
  }

  query += ' ORDER BY txn_date DESC, id DESC';
  const txns = db.prepare(query).all(...params);
  res.json(txns);
});

// Update a transaction
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const existing = db
    .prepare('SELECT * FROM transactions WHERE id = ? AND user_id = ?')
    .get(id, req.userId);
  if (!existing) return res.status(404).json({ error: 'Transaction not found' });

  const { type, category, amount, note, txn_date } = req.body;
  db.prepare(
    `UPDATE transactions SET type = ?, category = ?, amount = ?, note = ?, txn_date = ?
     WHERE id = ? AND user_id = ?`
  ).run(
    type ?? existing.type,
    category ?? existing.category,
    amount ?? existing.amount,
    note ?? existing.note,
    txn_date ?? existing.txn_date,
    id,
    req.userId
  );

  const updated = db.prepare('SELECT * FROM transactions WHERE id = ?').get(id);
  res.json(updated);
});

// Delete a transaction
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const result = db
    .prepare('DELETE FROM transactions WHERE id = ? AND user_id = ?')
    .run(id, req.userId);
  if (result.changes === 0) return res.status(404).json({ error: 'Transaction not found' });
  res.json({ success: true });
});

// Summary: totals + category breakdown + monthly trend
router.get('/summary/overview', (req, res) => {
  const userId = req.userId;

  const totals = db
    .prepare(
      `SELECT
         COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS totalIncome,
         COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS totalExpense
       FROM transactions WHERE user_id = ?`
    )
    .get(userId);

  const byCategory = db
    .prepare(
      `SELECT category, SUM(amount) AS total
       FROM transactions
       WHERE user_id = ? AND type = 'expense'
       GROUP BY category
       ORDER BY total DESC`
    )
    .all(userId);

  const byMonth = db
    .prepare(
      `SELECT strftime('%Y-%m', txn_date) AS month,
              SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS income,
              SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS expense
       FROM transactions
       WHERE user_id = ?
       GROUP BY month
       ORDER BY month ASC`
    )
    .all(userId);

  res.json({
    totalIncome: totals.totalIncome,
    totalExpense: totals.totalExpense,
    balance: totals.totalIncome - totals.totalExpense,
    byCategory,
    byMonth,
  });
});

module.exports = router;
