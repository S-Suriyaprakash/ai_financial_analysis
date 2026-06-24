const Anthropic = require('@anthropic-ai/sdk');
const db = require('../db/database');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Builds a compact financial summary for a user to ground the AI's answers
 * in their real data (instead of generic advice).
 */
function buildUserFinancialContext(userId) {
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
      `SELECT category, SUM(amount) AS total, COUNT(*) AS count
       FROM transactions WHERE user_id = ? AND type = 'expense'
       GROUP BY category ORDER BY total DESC LIMIT 10`
    )
    .all(userId);

  const recent = db
    .prepare(
      `SELECT type, category, amount, note, txn_date
       FROM transactions WHERE user_id = ?
       ORDER BY txn_date DESC, id DESC LIMIT 15`
    )
    .all(userId);

  const user = db.prepare('SELECT name, monthly_budget FROM users WHERE id = ?').get(userId);

  const lines = [];
  lines.push(`User: ${user?.name || 'Unknown'}`);
  lines.push(`Monthly budget goal: ${user?.monthly_budget ? '₹' + user.monthly_budget : 'Not set'}`);
  lines.push(`Total income recorded: ₹${totals.totalIncome.toFixed(2)}`);
  lines.push(`Total expenses recorded: ₹${totals.totalExpense.toFixed(2)}`);
  lines.push(`Current balance: ₹${(totals.totalIncome - totals.totalExpense).toFixed(2)}`);

  if (byCategory.length) {
    lines.push('\nSpending by category:');
    byCategory.forEach((c) => {
      lines.push(`- ${c.category}: ₹${c.total.toFixed(2)} (${c.count} transactions)`);
    });
  } else {
    lines.push('\nNo expense data recorded yet.');
  }

  if (recent.length) {
    lines.push('\nRecent transactions:');
    recent.forEach((t) => {
      lines.push(
        `- [${t.txn_date}] ${t.type === 'income' ? '+' : '-'}₹${t.amount} | ${t.category}${
          t.note ? ' | ' + t.note : ''
        }`
      );
    });
  }

  return lines.join('\n');
}

const SYSTEM_PROMPT = `You are FinBot, a friendly and knowledgeable AI financial assistant inside a personal finance tracking app for college students.

Your job:
- Answer questions about the user's spending, income, and budget using the financial data context provided.
- Give practical, encouraging budgeting and saving advice suited to a student's life (limited income, hostel/mess expenses, subscriptions, etc).
- When numbers are asked for, compute them precisely from the provided data context. If the data needed isn't in the context, say so honestly rather than guessing.
- Keep responses concise and conversational — this is a chat interface, not a report. Use short paragraphs or brief bullet points.
- Do not give specific stock picks, investment guarantees, or tax/legal advice. For those, suggest consulting a qualified professional.
- Be encouraging and non-judgmental about spending habits, while still being honest about overspending patterns.`;

async function getChatResponse(userId, userMessage, conversationHistory) {
  const financialContext = buildUserFinancialContext(userId);

  const messages = [
    ...conversationHistory.map((m) => ({ role: m.role, content: m.content })),
    {
      role: 'user',
      content: `[Current financial data for context]\n${financialContext}\n\n[User question]\n${userMessage}`,
    },
  ];

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 600,
    system: SYSTEM_PROMPT,
    messages,
  });

  const textBlock = response.content.find((block) => block.type === 'text');
  return textBlock ? textBlock.text : "Sorry, I couldn't generate a response.";
}

module.exports = { getChatResponse, buildUserFinancialContext };
