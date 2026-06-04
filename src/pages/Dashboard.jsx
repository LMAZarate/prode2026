import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../lib/firebase'
import { collection, addDoc, getDocs, doc, setDoc, query, where, getDoc } from 'firebase/firestore'
import { useAuth } from '../lib/AuthContext'
import { Button, Card, Avatar, Spinner } from '../components/UI'
import styles from './Dashboard.module.css'

const ADMIN_ID = '7af28f93-2fde-4767-a74a-d06a44d26aed'

export default function Dashboard() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [myGroups, setMyGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [joinOpen, setJoinOpen] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState('')
  const isAdmin = user?.uid === ADMIN_ID

  useEffect(() => { if (user) fetchGroups() }, [user])

  async function fetchGroups() {
    const q = query(collection(db, 'group_members'), where('user_id', '==', user.uid))
    const snap = await getDocs(q)
    const groups = []
    for (const d of snap.docs) {
      const gSnap = await getDoc(doc(db, 'groups', d.data().group_id))
      if (gSnap.exists()) groups.push({ id: gSnap.id, ...gSnap.data() })
    }
    setMyGroups(groups)
    setLoading(false)
  }

  async function createGroup() {
    if (!groupName.trim()) return
    setActionLoading(true); setActionError('')
    try {
      const code = Math.random().toString(36).substring(2,8).toUpperCase()
      const ref = await addDoc(collection(db, 'groups'), { name: groupName.trim(), code, created_by: user.uid, created_at: new Date().toISOString() })
      await setDoc(doc(db, 'group_members', ref.id + '_' + user.uid), { group_id: ref.id, user_id: user.uid, joined_at: new Date().toISOString() })
      setCreateOpen(false); setGroupName('')
      navigate('/grupo/' + ref.id)
    } catch(e) { setActionError(e.message) }
    setActionLoading(false)
  }

  async function joinGroup() {
    const code = joinCode.trim().toUpperCase()
    if (!code) return
    setActionLoading(true); setActionError('')
    try {
      const q = query(collection(db, 'groups'), where('code', '==', code))
      const snap = await getDocs(q)
      if (snap.empty) throw new Error('Codigo invalido.')
      const group = snap.docs[0]
      await setDoc(doc(db, 'group_members', group.id + '_' + user.uid), { group_id: group.id, user_id: user.uid, joined_at: new Date().toISOString() })
      setJoinOpen(false); setJoinCode('')
      navigate('/grupo/' + group.id)
    } catch(e) { setActionError(e.message) }
    setActionLoading(false)
  }

  async function handleSignOut() {
    await signOut(); navigate('/')
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
          <h2 className={styles.h2}>Hola, {profile?.username?.split(' ')[0]}!</h2>
          <p className={styles.sub}>Tus grupos de PRODE</p>
        </div>
        <div className={styles.actions}>
          {isAdmin && <Button variant="primary" onClick={() => { setCreateOpen(true); setJoinOpen(false); setActionError('') }}>+ Crear grupo</Button>}
          <Button variant="secondary" onClick={() => { setJoinOpen(true); setCreateOpen(false); setActionError('') }}>Unirme a un grupo</Button>
          {isAdmin && <Button variant="secondary" onClick={() => navigate('/admin')}>Panel Admin</Button>}
        </div>
        {(createOpen || joinOpen) && (
          <Card className={styles.actionCard}>
            {createOpen && <>
              <p className={styles.actionTitle}>Nombre del grupo</p>
              <input className={styles.codeInput} placeholder="Ej: Los Campeones 2026" value={groupName} onChange={e => setGroupName(e.target.value)} onKeyDown={e => e.key === 'Enter' && createGroup()} autoFocus />
              {actionError && <p className={styles.err}>{actionError}</p>}
              <div className={styles.actionBtns}>
                <Button variant="primary" loading={actionLoading} onClick={createGroup}>Crear</Button>
                <Button variant="ghost" onClick={() => { setCreateOpen(false); setActionError('') }}>Cancelar</Button>
              </div>
            </>}
            {joinOpen && <>
              <p className={styles.actionTitle}>Codigo del grupo</p>
              <input className={styles.codeInput} placeholder="Ej: AB12CD" value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} onKeyDown={e => e.key === 'Enter' && joinGroup()} maxLength={6} autoFocus />
              {actionError && <p className={styles.err}>{actionError}</p>}
              <div className={styles.actionBtns}>
                <Button variant="primary" loading={actionLoading} onClick={joinGroup}>Unirme</Button>
                <Button variant="ghost" onClick={() => { setJoinOpen(false); setActionError('') }}>Cancelar</Button>
              </div>
            </>}
          </Card>
        )}
        {loading ? <div className={styles.center}><Spinner /></div> : myGroups.length === 0 ? (
          <div className={styles.empty}><p>Todavia no estas en ningun grupo.</p><p>Crea uno o pedile el codigo a un amigo.</p></div>
        ) : (
          <div className={styles.groupList}>
            {myGroups.map(g => (
              <Card key={g.id} className={styles.groupCard} onClick={() => navigate('/grupo/' + g.id)}>
                <div className={styles.groupIcon}>🏆</div>
                <div className={styles.groupInfo}><div className={styles.groupName}>{g.name}</div><div className={styles.groupCode}>Codigo: <strong>{g.code}</strong></div></div>
                <span className={styles.arrow}>›</span>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
