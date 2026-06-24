import React from 'react';

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div style={styles.wrap}>
      <div style={styles.left}>
        <div style={styles.markRow}>
          <div style={styles.mark}>F</div>
          <span style={styles.brand}>FinTrack AI</span>
        </div>
        <h1 style={styles.headline}>
          Know your money.
          <br />
          Before it knows you.
        </h1>
        <p style={styles.tagline}>
          A finance tracker built for student life — mess bills, subscriptions, weekend
          splurges — with an AI assistant that actually reads your ledger before it answers.
        </p>
        <div style={styles.ledgerLine}>
          <span>Mess fees</span>
          <span className="mono">− ₹3,200</span>
        </div>
        <div style={styles.ledgerLine}>
          <span>Part-time stipend</span>
          <span className="mono" style={{ color: 'var(--emerald)' }}>+ ₹6,000</span>
        </div>
        <div style={styles.ledgerLine}>
          <span>Books &amp; supplies</span>
          <span className="mono">− ₹850</span>
        </div>
      </div>

      <div style={styles.right}>
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>{title}</h2>
          <p style={styles.cardSubtitle}>{subtitle}</p>
          {children}
          {footer && <div style={styles.footer}>{footer}</div>}
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    display: 'flex',
    minHeight: '100vh',
  },
  left: {
    flex: 1,
    background: 'var(--ink-800)',
    color: 'var(--paper)',
    padding: '56px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    position: 'relative',
  },
  markRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 48,
  },
  mark: {
    width: 34,
    height: 34,
    borderRadius: 8,
    background: 'var(--emerald)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--font-display)',
    fontWeight: 600,
  },
  brand: {
    fontFamily: 'var(--font-display)',
    fontSize: 18,
    fontWeight: 600,
  },
  headline: {
    fontFamily: 'var(--font-display)',
    fontSize: 'clamp(32px, 4vw, 46px)',
    fontWeight: 600,
    lineHeight: 1.15,
    margin: '0 0 18px',
    maxWidth: 480,
  },
  tagline: {
    color: '#AEB7C8',
    fontSize: 15.5,
    lineHeight: 1.6,
    maxWidth: 420,
    marginBottom: 40,
  },
  ledgerLine: {
    display: 'flex',
    justifyContent: 'space-between',
    maxWidth: 360,
    padding: '10px 0',
    borderBottom: '1px dashed #34415A',
    fontSize: 14,
    color: '#D6DCE6',
  },
  right: {
    width: 460,
    flexShrink: 0,
    background: 'var(--paper)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  card: {
    width: '100%',
    maxWidth: 360,
  },
  cardTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: 26,
    fontWeight: 600,
    margin: '0 0 6px',
  },
  cardSubtitle: {
    color: 'var(--text-600)',
    fontSize: 14,
    margin: '0 0 28px',
  },
  footer: {
    marginTop: 22,
    fontSize: 13.5,
    color: 'var(--text-600)',
    textAlign: 'center',
  },
};
