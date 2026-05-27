import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { Button, Card, Avatar, Spinner } from '../components/UI'
import styles from './Dashboard.module.css'

export default function Dashboard() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const isAdmin = user?.id === '7af28f93-2fde-4767-a74a-d06a44d26aed'
  const [myGroups, setMyGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [joinOpen, setJoinOpen] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState('')

  useEffect(() => { fetchGroups() }, [user])

  async function fetchGroups() {
    if (!user) return
    const { data } = await supabase
      .from('group_members')
      .select('group_id, groups(id, name, code, created_by)')
      .eq('user_id', user.id)
    setMyGroups(data?.map(d => d.groups) || [])
    setLoading(false)
  }

  async function createGroup() {
    if (!groupName.trim()) return
    setActionLoading(true)
    setActionError('')
    try {
      const { data: group, error } = await supabase
        .from('groups')
        .insert({ name: groupName.trim(), created_by: user.id })
        .select()
        .single()
      if (error) throw error
      await supabase.from('group_members').insert({ group_id: group.id, user_id: user.id })
      setCreateOpen(false)
      setGroupName('')
      navigate(`/grupo/${group.id}`)
    } catch (err) {
      setActionError(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  async function joinGroup() {
    const code = joinCode.trim().toUpperCase()
    if (!code) return
    setActionLoading(true)
    setActionError('')
    try {
      const { data: group, error } = await supabase
        .from('groups')
        .select('id, name')
        .eq('code', code)
        .single()
      if (error || !group) throw new Error('Código inválido. Revisá el código e intentá de nuevo.')
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({ group_id: group.id, user_id: user.id })
      if (memberError && memberError.code !== '23505') throw memberError
      setJoinOpen(false)
      setJoinCode('')
      navigate(`/grupo/${group.id}`)
    } catch (err) {
      setActionError(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.logo}><img src="/logo_jieli.png" alt="Jieli" style={{height:28,width:'auto'}} /> <span>PRODE 2026</span></div>
        <div className={styles.userMenu}>
          <Avatar name={profile?.username || ''} color={profile?.avatar_color} size={32} />
          <span className={styles.userName}>{profile?.username}</span>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>Salir</Button>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.welcome}>
          <h2 className={styles.h2}>Hola, {profile?.username?.split(' ')[0]} 👋</h2>
          <p className={styles.sub}>Tus grupos de PRODE</p>
        </div>

        <div className={styles.actions}>
          {isAdmin && <Button variant="primary" onClick={() => { setCreateOpen(true); setJoinOpen(false); setActionError('') }}>+ Crear grupo</Button>}
          <Button variant="secondary" onClick={() => { setJoinOpen(true); setCreateOpen(false); setActionError('') }}>Unirme a un grupo</Button>
        </div>

        {(createOpen || joinOpen) && (
          <Card className={styles.actionCard}>
            {createOpen && (
              <>
                <p className={styles.actionTitle}>Nombre del grupo</p>
                <input
                  className={styles.codeInput}
                  placeholder="Ej: Los Campeones 2026"
                  value={groupName}
                  onChange={e => setGroupName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && createGroup()}
                  autoFocus
                />
                {actionError && <p className={styles.err}>{actionError}</p>}
                <div className={styles.actionBtns}>
                  <Button variant="primary" loading={actionLoading} onClick={createGroup}>Crear</Button>
                  <Button variant="ghost" onClick={() => { setCreateOpen(false); setActionError('') }}>Cancelar</Button>
                </div>
              </>
            )}
            {joinOpen && (
              <>
                <p className={styles.actionTitle}>Código del grupo</p>
                <input
                  className={styles.codeInput}
                  placeholder="Ej: AB12CD"
                  value={joinCode}
                  onChange={e => setJoinCode(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === 'Enter' && joinGroup()}
                  maxLength={6}
                  autoFocus
                />
                {actionError && <p className={styles.err}>{actionError}</p>}
                <div className={styles.actionBtns}>
                  <Button variant="primary" loading={actionLoading} onClick={joinGroup}>Unirme</Button>
                  <Button variant="ghost" onClick={() => { setJoinOpen(false); setActionError('') }}>Cancelar</Button>
                </div>
              </>
            )}
          </Card>
        )}

        {loading ? (
          <div className={styles.center}><Spinner /></div>
        ) : myGroups.length === 0 ? (
          <div className={styles.empty}>
            <p>Todavía no estás en ningún grupo.</p>
            <p>Creá uno o pedile el código a un amigo.</p>
          </div>
        ) : (
          <div className={styles.groupList}>
            {myGroups.map(g => (
              <Card key={g.id} className={styles.groupCard} onClick={() => navigate(`/grupo/${g.id}`)}>
                <div className={styles.groupIcon}>🏆</div>
                <div className={styles.groupInfo}>
                  <div className={styles.groupName}>{g.name}</div>
                  <div className={styles.groupCode}>Código: <strong>{g.code}</strong></div>
                </div>
                <span className={styles.arrow}>›</span>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
