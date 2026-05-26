import styles from './UI.module.css'

export function Button({ children, variant = 'primary', size = 'md', loading, disabled, fullWidth, ...props }) {
  return (
    <button
      className={[
        styles.btn,
        styles[`btn-${variant}`],
        styles[`btn-${size}`],
        fullWidth ? styles.fullWidth : '',
        loading ? styles.loading : ''
      ].join(' ')}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <span className={styles.spinner} /> : children}
    </button>
  )
}

export function Input({ label, error, hint, ...props }) {
  return (
    <div className={styles.fieldWrap}>
      {label && <label className={styles.label}>{label}</label>}
      <input className={[styles.input, error ? styles.inputError : ''].join(' ')} {...props} />
      {error && <span className={styles.error}>{error}</span>}
      {hint && !error && <span className={styles.hint}>{hint}</span>}
    </div>
  )
}

export function Card({ children, className = '', ...props }) {
  return <div className={[styles.card, className].join(' ')} {...props}>{children}</div>
}

export function Badge({ children, color = 'default' }) {
  return <span className={[styles.badge, styles[`badge-${color}`]].join(' ')}>{children}</span>
}

export function Spinner({ size = 20 }) {
  return (
    <div className={styles.spinnerOnly} style={{ width: size, height: size, borderWidth: size / 8 }} />
  )
}

export function Avatar({ name = '', color = 'blue', size = 36 }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div
      className={[styles.avatar, styles[`avatar-${color}`]].join(' ')}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials || '?'}
    </div>
  )
}

export function PhaseLabel({ phase }) {
  const map = {
    group: 'Fase de Grupos',
    r32: 'Ronda de 32',
    r16: 'Octavos de Final',
    qf: 'Cuartos de Final',
    sf: 'Semifinales',
    '3rd': 'Tercer Puesto',
    final: '🏆 Gran Final'
  }
  return <span className={styles.phaseLabel}>{map[phase] || phase}</span>
}
