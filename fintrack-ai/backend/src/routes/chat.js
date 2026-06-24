const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../db/database');
const authMiddleware = require('../middleware/auth');
const { getChatResponse } = require('../services/aiService');

const router = express.Router();
router.use(authMiddleware);

// Get chat history
router.get('/', (req, res) => {
  const messages = db
    .prepare('SELECT * FROM chat_messages WHERE user_id = ? ORDER BY id ASC')
    .all(req.userId);
  res.json(messages);
});

// Send a message, get AI response
router.post('/', [body('message').trim().notEmpty().withMessage('Message cannot be empty')], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  const { message } = req.body;
  const userId = req.userId;

  try {
    // Save user message
    db.prepare('INSERT INTO chat_messages (user_id, role, content) VALUES (?, ?, ?)').run(
      userId,
      'user',
      message
    );

    // Get recent history for context (last 10 messages)
    const history = db
      .prepare('SELECT role, content FROM chat_messages WHERE user_id = ? ORDER BY id DESC LIMIT 10')
      .all(userId)
      .reverse()
      .slice(0, -1); // exclude the message we just inserted, it's added separately

    const aiReply = await getChatResponse(userId, message, history);

    db.prepare('INSERT INTO chat_messages (user_id, role, content) VALUES (?, ?, ?)').run(
      userId,
      'assistant',
      aiReply
    );

    res.json({ reply: aiReply });
  } catch (err) {
    console.error('AI chat error:', err.message);
    if (err.status === 401 || /api.key/i.test(err.message)) {
      return res
        .status(500)
        .json({ error: 'AI service is not configured. Please set ANTHROPIC_API_KEY in the backend .env file.' });
    }
    res.status(500).json({ error: 'Failed to get AI response. Please try again.' });
  }
});

// Clear chat history
router.delete('/', (req, res) => {
  db.prepare('DELETE FROM chat_messages WHERE user_id = ?').run(req.userId);
  res.json({ success: true });
});

module.exports = router;
