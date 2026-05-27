import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { Button, Input, Card } from '../components/UI'
import styles from './Auth.module.css'

export default function AuthPage() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [phone, setPhone] = useState('')

  const [loading, setLoading] = useState(false)
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()}
  const [error, setError] = useState('')
  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') {
        await signIn(email, password)
        navigate('/dashboard')
      } else {
        if (username.trim().length < 2) { setError('El nombre necesita al menos 2 caracteres.'); setLoading(false); return }
        await signUp(email, password, username.trim(), phone.trim())
        navigate('/dashboard')
      }
    } catch (err) {
      const msg = err.message || 'Algo salió mal'
      if (msg.includes('Invalid login')) setError('Email o contraseña incorrectos.')
      else if (msg.includes('already registered')) setError('Ese email ya está registrado.')
      else if (msg.includes('Password should')) setError('La contraseña debe tener al menos 6 caracteres.')
      else setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <img src="/logo_jieli.png" alt="Jieli" className={styles.logo} />
        <h1 className={styles.title}>PRODE 2026</h1>
        <p className={styles.sub}>Mundial USA · Canadá · México</p>
      </div>

      <Card className={styles.formCard}>
        <div className={styles.tabs}>
          <button className={[styles.tab, mode === 'login' ? styles.tabActive : ''].join(' ')} onClick={() => { setMode('login'); setError('') }}>Iniciar sesión</button>
          <button className={[styles.tab, mode === 'register' ? styles.tabActive : ''].join(' ')} onClick={() => { setMode('register'); setError('') }}>Crear cuenta</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {mode === 'register' && (
            <>
              <Input
                label="Tu nombre (como aparecerá en la tabla)"
                type="text"
                placeholder="Ej: Rodrigo M."
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
              />
              <Input
                label="Teléfono / WhatsApp"
                type="tel"
                placeholder="Ej: +54 9 351 000 0000"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
            </>
          )}
          <Input
            label="Email"
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <Input
            label="Contraseña"
            type="password"
            placeholder={mode === 'register' ? 'Mínimo 6 caracteres' : '••••••••'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {error && <p className={styles.errorMsg}>{error}</p>}
          <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
            {mode === 'login' ? 'Entrar' : 'Crear cuenta'}
          </Button>
        </form>
      </Card>

      <p className={styles.footer}>
        1 pto. por resultado · 3 ptos. por marcador exacto
      </p>
    </div>
  )
}
