import React, { useEffect, useRef, useState } from 'react';
import api from '../api/client';

const SUGGESTIONS = [
  'How much did I spend this month?',
  'What is my biggest spending category?',
  'Give me 3 tips to save more this month',
  'Am I spending within a reasonable student budget?',
];

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    api
      .get('/chat')
      .then((res) => setMessages(res.data))
      .finally(() => setLoadingHistory(false));
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, sending]);

  async function sendMessage(text) {
    const content = text ?? input;
    if (!content.trim() || sending) return;
    setError('');
    setInput('');
    setMessages((m) => [...m, { id: 'temp-' + Date.now(), role: 'user', content }]);
    setSending(true);
    try {
      const { data } = await api.post('/chat', { message: content });
      setMessages((m) => [...m, { id: 'temp-r-' + Date.now(), role: 'assistant', content: data.reply }]);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div style={styles.wrap}>
      <header style={{ marginBottom: 20 }}>
        <div style={styles.eyebrow}>FinBot</div>
        <h1 style={styles.h1}>Ask anything about your money.</h1>
        <p style={styles.sub}>FinBot reads your live transaction data before answering — no guesswork.</p>
      </header>

      <div ref={scrollRef} style={styles.chatBox}>
        {loadingHistory ? (
          <div style={{ color: 'var(--text-600)' }}>Loading conversation…</div>
        ) : messages.length === 0 ? (
          <div style={styles.emptyState}>
            <span style={{ fontSize: 26 }}>✦</span>
            <p style={{ margin: '10px 0 18px' }}>Start by asking FinBot a question about your spending.</p>
            <div style={styles.suggestionGrid}>
              {SUGGESTIONS.map((s) => (
                <button key={s} style={styles.suggestionChip} onClick={() => sendMessage(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m) => (
            <div key={m.id} style={{ ...styles.bubbleRow, justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div
                style={{
                  ...styles.bubble,
                  ...(m.role === 'user' ? styles.bubbleUser : styles.bubbleAssistant),
                }}
              >
                {m.content}
              </div>
            </div>
          ))
        )}
        {sending && (
          <div style={{ ...styles.bubbleRow, justifyContent: 'flex-start' }}>
            <div style={{ ...styles.bubble, ...styles.bubbleAssistant }}>
              <TypingDots />
            </div>
          </div>
        )}
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
        style={styles.inputRow}
      >
        <input
          style={styles.textInput}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask FinBot about your spending, budget, or savings…"
        />
        <button type="submit" style={styles.sendBtn} disabled={sending || !input.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}

function TypingDots() {
  return (
    <span style={{ display: 'inline-flex', gap: 4 }}>
      <Dot delay="0s" />
      <Dot delay="0.15s" />
      <Dot delay="0.3s" />
    </span>
  );
}

function Dot({ delay }) {
  return (
    <span
      style={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: 'var(--text-400)',
        display: 'inline-block',
        animation: 'pulse 1s infinite',
        animationDelay: delay,
      }}
    />
  );
}

const styles = {
  wrap: {
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100vh - 72px)',
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
    margin: '0 0 6px',
  },
  sub: {
    color: 'var(--text-600)',
    fontSize: 14,
    margin: 0,
  },
  chatBox: {
    flex: 1,
    overflowY: 'auto',
    background: '#fff',
    border: '1px solid var(--line)',
    borderRadius: 'var(--radius-md)',
    padding: 22,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    marginTop: 18,
  },
  emptyState: {
    margin: 'auto',
    textAlign: 'center',
    color: 'var(--text-600)',
    maxWidth: 460,
  },
  suggestionGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 8,
  },
  suggestionChip: {
    padding: '10px 14px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--line)',
    background: 'var(--paper)',
    fontSize: 13,
    color: 'var(--text-900)',
    textAlign: 'left',
  },
  bubbleRow: {
    display: 'flex',
  },
  bubble: {
    maxWidth: '72%',
    padding: '11px 15px',
    borderRadius: 14,
    fontSize: 14.5,
    lineHeight: 1.55,
    whiteSpace: 'pre-wrap',
  },
  bubbleUser: {
    background: 'var(--ink-800)',
    color: '#fff',
    borderBottomRightRadius: 4,
  },
  bubbleAssistant: {
    background: 'var(--paper-dim)',
    color: 'var(--text-900)',
    borderBottomLeftRadius: 4,
  },
  inputRow: {
    display: 'flex',
    gap: 10,
    marginTop: 14,
  },
  textInput: {
    flex: 1,
    padding: '13px 16px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--line)',
    fontSize: 14.5,
  },
  sendBtn: {
    padding: '0 24px',
    background: 'var(--emerald)',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    fontWeight: 600,
    fontSize: 14,
  },
  error: {
    marginTop: 10,
    background: 'var(--rust-soft)',
    color: 'var(--rust)',
    padding: '10px 14px',
    borderRadius: 'var(--radius-sm)',
    fontSize: 13,
  },
};
