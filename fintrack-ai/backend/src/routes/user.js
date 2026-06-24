const express = require('express');
const db = require('../db/database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

router.get('/me', (req, res) => {
  const user = db
    .prepare('SELECT id, name, email, monthly_budget FROM users WHERE id = ?')
    .get(req.userId);
  res.json(user);
});

router.put('/me', (req, res) => {
  const { monthlyBudget, name } = req.body;
  const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId);

  db.prepare('UPDATE users SET monthly_budget = ?, name = ? WHERE id = ?').run(
    monthlyBudget ?? existing.monthly_budget,
    name ?? existing.name,
    req.userId
  );

  const updated = db
    .prepare('SELECT id, name, email, monthly_budget FROM users WHERE id = ?')
    .get(req.userId);
  res.json(updated);
});

module.exports = router;
