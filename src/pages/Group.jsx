import React from 'react'
import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { Button, Card, Avatar, Badge, Spinner, PhaseLabel } from '../components/UI'
import styles from './Group.module.css'

const PHASE_ORDER = ['group', 'r32', 'r16', 'qf', 'sf', '3rd', 'final']

const COUNTRY_CODES = {
  'Mexico': 'MX', 'Sudafrica': 'ZA', 'Republica de Corea': 'KR', 'Republica Checa': 'CZ',
  'Canada': 'CA', 'Bosnia y Herzegovina': 'BA', 'Catar': 'QA', 'Suiza': 'CH',
  'Brasil': 'BR', 'Marruecos': 'MA', 'Haiti': 'HT', 'Escocia': 'GB',
  'Estados Unidos': 'US', 'Paraguay': 'PY', 'Australia': 'AU', 'Turquia': 'TR',
  'Alemania': 'DE', 'Curazao': 'CW', 'Costa de Marfil': 'CI', 'Ecuador': 'EC',
  'Paises Bajos': 'NL', 'Japon': 'JP', 'Suecia': 'SE', 'Tunez': 'TN',
  'Belgica': 'BE', 'Egipto': 'EG', 'Iran': 'IR', 'Nueva Zelanda': 'NZ',
  'Espana': 'ES', 'Cabo Verde': 'CV', 'Arabia Saudi': 'SA', 'Uruguay': 'UY',
  'Francia': 'FR', 'Senegal': 'SN', 'Irak': 'IQ', 'Noruega': 'NO',
  'Argentina': 'AR', 'Argelia': 'DZ', 'Austria': 'AT', 'Jordania': 'JO',
  'Portugal': 'PT', 'RD de Congo': 'CD', 'Uzbekistan': 'UZ', 'Colombia': 'CO',
  'Inglaterra': 'GB', 'Croacia': 'HR', 'Ghana': 'GH', 'Panama': 'PA',
}

function Flag({ name, size = 40 }) {
  const code = COUNTRY_CODES[name]
  if (!code) return <span style={{fontSize: size * 0.7, lineHeight:1}}>🏆</span>
  return (
    <img
      src={`https://purecatamphetamine.github.io/country-flag-icons/3x2/${code}.svg`}
      alt={name}
      style={{ width: size, height: size * 0.67, objectFit: 'cover', borderRadius: 3, display: 'block' }}
      onError={e => { e.target.style.display = 'none' }}
    />
  )
}

export default function GroupPage() {
  const { id } = useParams()
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  const [group, setGroup] = useState(null)
  const [tab, setTab] = useState('pronosticos')
  const [matches, setMatches] = useState([])
  const [predictions, setPredictions] = useState({})
  const [leaderboard, setLeaderboard] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState('')
  const [phaseFilter, setPhaseFilter] = useState('group')
  const [copied, setCopied] = useState(false)

  const fetchAll = useCallback(async () => {
    const [groupRes, matchRes, predRes, lbRes, memberRes] = await Promise.all([
      supabase.from('groups').select('*').eq('id', id).single(),
      supabase.from('matches').select('*').order('match_number'),
      supabase.from('predictions').select('*').eq('group_id', id).eq('user_id', user.id),
      supabase.from('leaderboard').select('*').eq('group_id', id).order('total_points', { ascending: false }),
      supabase.from('group_members').select('user_id, profiles(username, avatar_color)').eq('group_id', id)
    ])

    if (groupRes.error) { navigate('/dashboard'); return }
    setGroup(groupRes.data)
    setMatches(matchRes.data || [])
    const predMap = {}
    predRes.data?.forEach(p => { predMap[p.match_id] = p })
    setPredictions(predMap)
    setLeaderboard(lbRes.data || [])
    setMembers(memberRes.data?.map(m => m.profiles) || [])
    setLoading(false)
  }, [id, user, navigate])

  useEffect(() => {
    fetchAll()
    const channel = supabase.channel(`group-${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'predictions', filter: `group_id=eq.${id}` }, fetchAll)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'matches' }, fetchAll)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [fetchAll, id])

  function handleScoreChange(matchId, side, val) {
    const num = val === '' ? '' : Math.max(0, Math.min(20, parseInt(val) || 0))
    setPredictions(prev => ({
      ...prev,
      [matchId]: { ...(prev[matchId] || {}), [side]: num }
    }))
  }

  async function savePredictions() {
    setSaving(true)
    setSavedMsg('')
    const upserts = []
    const now = new Date().toISOString()

    for (const [matchId, pred] of Object.entries(predictions)) {
      const match = matches.find(m => m.id === parseInt(matchId))
      if (!match || match.status === 'finished' || match.status === 'locked') continue
      if (match.match_date && new Date(match.match_date) < new Date()) continue
      if (pred.home_score === '' || pred.away_score === '' ||
          pred.home_score === undefined || pred.away_score === undefined) continue

      upserts.push({
        user_id: user.id,
        group_id: id,
        match_id: parseInt(matchId),
        home_score: parseInt(pred.home_score),
        away_score: parseInt(pred.away_score),
        updated_at: now
      })
    }

    if (upserts.length === 0) {
      setSavedMsg('No hay pronosticos nuevos para guardar.')
      setSaving(false)
      return
    }

    const { error } = await supabase.from('predictions').upsert(upserts, {
      onConflict: 'user_id,group_id,match_id'
    })

    if (error) setSavedMsg('Error al guardar. Intenta de nuevo.')
    else { setSavedMsg(`Guardado! ${upserts.length} pronostico${upserts.length > 1 ? 's' : ''}`) }
    setSaving(false)
    setTimeout(() => setSavedMsg(''), 3000)
  }

  function copyCode() {
    navigator.clipboard.writeText(group?.code || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const filteredMatches = matches.filter(m => m.phase === phaseFilter)
  const groupedByGroup = {}
  filteredMatches.forEach(m => {
    const key = m.group_name || 'Eliminatorias'
    if (!groupedByGroup[key]) groupedByGroup[key] = []
    groupedByGroup[key].push(m)
  })

  const matchClosed = (m) => m.status === 'finished' || m.status === 'locked' || (m.match_date && new Date(m.match_date) < new Date())

  if (loading) return <div className={styles.center}><Spinner size={32} /></div>

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.back} onClick={() => navigate('/dashboard')}>Grupos</button>
        <div className={styles.headerCenter}>
          <div className={styles.groupName}>{group?.name}</div>
          <div className={styles.groupCode} onClick={copyCode} title="Copiar codigo">
            {copied ? 'Copiado!' : `Codigo: ${group?.code}`}
          </div>
        </div>
        <Avatar name={profile?.username || ''} color={profile?.avatar_color} size={32} />
      </header>

      <div className={styles.tabBar}>
        {['pronosticos', 'tabla', 'miembros'].map(t => (
          <button key={t} className={[styles.tab, tab === t ? styles.tabActive : ''].join(' ')} onClick={() => setTab(t)}>
            {t === 'pronosticos' ? 'Pronosticos' : t === 'tabla' ? 'Tabla' : 'Grupo'}
          </button>
        ))}
      </div>

      <main className={styles.main}>
        {tab === 'pronosticos' && (
          <>
            <div className={styles.phaseScroll}>
              {PHASE_ORDER.map(ph => {
                const phaseMatches = matches.filter(m => m.phase === ph)
                if (phaseMatches.length === 0) return null
                const locked = phaseMatches.every(m => m.status === 'locked')
                return (
                  <button
                    key={ph}
                    className={[styles.phaseBtn, phaseFilter === ph ? styles.phaseBtnActive : '', locked ? styles.phaseBtnLocked : ''].join(' ')}
                    onClick={() => !locked && setPhaseFilter(ph)}
                    title={locked ? 'Se desbloquea cuando termine la fase anterior' : ''}
                  >
                    <PhaseLabel phase={ph} />
                    {locked && <span style={{marginLeft:4, fontSize:10}}>🔒</span>}
                  </button>
                )
              })}
            </div>

            {Object.entries(groupedByGroup).sort(([a], [b]) => a.localeCompare(b)).map(([groupKey, groupMatches]) => (
              <div key={groupKey}>
                {phaseFilter === 'group' && <div className={styles.groupHeader}>Grupo {groupKey}</div>}
                {groupMatches.map(match => {
                  const pred = predictions[match.id] || {}
                  const closed = matchClosed(match)
                  const finished = match.status === 'finished'
                  const locked = match.status === 'locked'

                  let ptsClass = ''
                  let ptsLabel = ''
                  if (finished && pred.points !== undefined) {
                    if (pred.points === 3) { ptsClass = styles.ptsExact; ptsLabel = 'Exacto 3 pts' }
                    else if (pred.points === 1) { ptsClass = styles.ptsResult; ptsLabel = 'Resultado 1 pt' }
                    else { ptsClass = styles.ptsMiss; ptsLabel = 'Sin puntos' }
                  }

                  return (
                    <Card key={match.id} className={[styles.matchCard, closed ? styles.matchClosed : ''].join(' ')}>
                      <div className={styles.matchMeta}>
                        <span>{formatDate(match.match_date)}</span>
                        <span>{match.city}</span>
                      </div>
                      <div className={styles.matchBody}>
                        <div className={styles.team}>
                          <Flag name={match.home_team} size={40} />
                          <span className={styles.teamName}>{match.home_team}</span>
                        </div>

                        <div className={styles.scores}>
                          {locked ? (
                            <div style={{fontSize:24}}>🔒</div>
                          ) : finished ? (
                            <div className={styles.result}>
                              <span>{match.home_score}</span>
                              <span className={styles.dash}>-</span>
                              <span>{match.away_score}</span>
                            </div>
                          ) : (
                           <div className={styles.inputs}>
  <input
    className={closed ? styles.scoreInput + " " + styles.scoreInputClosed : styles.scoreInput}
    type="number"
    min="0"
    max="20"
    value={pred.home_score ? pred.home_score : ""}
    onChange={e => { if (!closed) handleScoreChange(match.id, "home_score", e.target.value) }}
    readOnly={closed}
    placeholder="-"
  />
  <span className={styles.dash}>-</span>
  <input
    className={closed ? styles.scoreInput + " " + styles.scoreInputClosed : styles.scoreInput}
    type="number"
    min="0"
    max="20"
    value={pred.away_score ? pred.away_score : ""}
    onChange={e => { if (!closed) handleScoreChange(match.id, "away_score", e.target.value) }}
    readOnly={closed}
    placeholder="-"
  />
</div>
                          <div className={styles.team}>
                            <Flag name={match.away_team} size={40} />
                            <span className={styles.teamName}>{match.away_team}</span>
                          </div>
                        </div>
                        {ptsLabel && <div className={ptsClass}>{ptsLabel}</div>}
                      </Card>
                    )
                  })}
                </div>
              )
            })}

            <div className={styles.saveBar}>
              {savedMsg && <span className={styles.savedMsg}>{savedMsg}</span>}
              <Button variant="primary" size="lg" fullWidth loading={saving} onClick={savePredictions}>Guardar pronosticos</Button>
            </div>
          </div>
        )}

        {tab === 'tabla' && (
          <div>
            <div className={styles.lbCard}>
              <div className={styles.lbHeader}>
                <span>#</span><span>Jugador</span><span>Exactos</span><span>Pts</span>
              </div>
              {leaderboard.map(function(row, i) {
                return (
                  <div key={row.user_id} className={row.user_id === user.id ? styles.lbRow + ' ' + styles.lbRowMe : styles.lbRow}>
                    <span className={styles.lbPos}>{i === 0 ? '1' : i === 1 ? '2' : i === 2 ? '3' : i + 1}</span>
                    <div className={styles.lbUser}>
                      <Avatar name={row.username} color={row.avatar_color} size={30} />
                      <div>
                        <div className={styles.lbName}>{row.username} {row.user_id === user.id && <span className={styles.youChip}>Vos</span>}</div>
                        <div className={styles.lbSub}>{row.total_predictions} pronosticos</div>
                      </div>
                    </div>
                    <span className={styles.lbExact}>{row.exact_scores}</span>
                    <span className={styles.lbPts}>{row.total_points}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {tab === 'miembros' && (
          <div>
            <Card className={styles.inviteCard}>
              <div className={styles.inviteTitle}>Invita a tus amigos</div>
              <div className={styles.inviteDesc}>Compartí el codigo para que se unan al grupo.</div>
              <div className={styles.codeBox}>{group ? group.code : ''}</div>
              <Button variant="secondary" fullWidth onClick={copyCode}>{copied ? 'Copiado!' : 'Copiar codigo'}</Button>
            </Card>
            <div className={styles.memberList}>
              <div className={styles.memberListTitle}>{members.length} participantes</div>
              {members.map(function(m) {
                var lb = leaderboard.find(function(l) { return l.username === m.username })
                return (
                  <div key={m.username} className={styles.memberRow}>
                    <Avatar name={m.username} color={m.avatar_color} size={36} />
                    <div className={styles.memberInfo}>
                      <div className={styles.memberName}>{m.username}</div>
                      <div className={styles.memberStat}>{lb ? lb.total_predictions : 0} pronosticos - {lb ? lb.total_points : 0} pts</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  var d = new Date(dateStr)
  return d.toLocaleDateString('es-AR', {day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'})
}
