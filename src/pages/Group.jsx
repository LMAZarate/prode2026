import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { Button, Card, Avatar, Badge, Spinner, PhaseLabel } from '../components/UI'
import styles from './Group.module.css'

const PHASE_ORDER = ['group', 'r32', 'r16', 'qf', 'sf', '3rd', 'final']

const COUNTRY_CODES = {
  'Argentina': 'ar', 'México': 'mx', 'Polonia': 'pl', 'Arabia Saudita': 'sa',
  'Estados Unidos': 'us', 'Gales': 'gb-wls', 'Inglaterra': 'gb-eng', 'Irán': 'ir',
  'Senegal': 'sn', 'Países Bajos': 'nl', 'Ecuador': 'ec', 'Qatar': 'qa',
  'Francia': 'fr', 'Australia': 'au', 'Dinamarca': 'dk', 'Túnez': 'tn',
  'Japón': 'jp', 'Costa Rica': 'cr', 'Alemania': 'de', 'España': 'es',
  'Marruecos': 'ma', 'Croacia': 'hr', 'Bélgica': 'be', 'Canadá': 'ca',
  'Brasil': 'br', 'Serbia': 'rs', 'Suiza': 'ch', 'Camerún': 'cm',
  'Portugal': 'pt', 'Ghana': 'gh', 'Uruguay': 'uy', 'Corea del Sur': 'kr',
  'Colombia': 'co', 'Perú': 'pe', 'Argelia': 'dz', 'Nigeria': 'ng',
  'Chile': 'cl', 'Irlanda': 'ie', 'Turquía': 'tr',
  'Egipto': 'eg', 'Nueva Zelanda': 'nz', 'Australia': 'au',
  'Honduras': 'hn', 'Costa de Marfil': 'ci',
}

function Flag({ name, size = 32 }) {
  const code = COUNTRY_CODES[name]
  if (!code) return <span style={{fontSize: size * 0.7, lineHeight:1}}>🏆</span>
  return (
    <img
      src={`https://flagcdn.com/w${size * 2}/${code}.png`}
      alt={name}
      style={{ width: size, height: size * 0.67, objectFit: 'cover', borderRadius: 3, display: 'block' }}
      onError={e => { e.target.style.display = 'none' }}
    />
  )
}

function resultSign(home, away) {
  if (home > away) return 'L'
  if (home < away) return 'V'
  return 'E'
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
    // Realtime: actualizar tabla y predicciones
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
      if (!match || match.status === 'finished') continue
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
      setSavedMsg('No hay pronósticos nuevos para guardar.')
      setSaving(false)
      return
    }

    const { error } = await supabase.from('predictions').upsert(upserts, {
      onConflict: 'user_id,group_id,match_id'
    })

    if (error) setSavedMsg('Error al guardar. Intentá de nuevo.')
    else { setSavedMsg(`✓ ${upserts.length} pronóstico${upserts.length > 1 ? 's' : ''} guardado${upserts.length > 1 ? 's' : ''}`) }
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

  const matchClosed = (m) => m.status === 'finished' || (m.match_date && new Date(m.match_date) < new Date())

  if (loading) return <div className={styles.center}><Spinner size={32} /></div>

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.back} onClick={() => navigate('/dashboard')}>‹ Grupos</button>
        <div className={styles.headerCenter}>
          <div className={styles.groupName}><img src="/logo_jieli.png" alt="Jieli" style={{height:20,width:'auto',verticalAlign:'middle',marginRight:6}} />{group?.name}</div>
          <div className={styles.groupCode} onClick={copyCode} title="Copiar código">
            {copied ? '¡Copiado!' : `Código: ${group?.code}`}
          </div>
        </div>
        <Avatar name={profile?.username || ''} color={profile?.avatar_color} size={32} />
      </header>

      <div className={styles.tabBar}>
        {['pronosticos', 'tabla', 'miembros'].map(t => (
          <button key={t} className={[styles.tab, tab === t ? styles.tabActive : ''].join(' ')} onClick={() => setTab(t)}>
            {t === 'pronosticos' ? '✏️ Pronósticos' : t === 'tabla' ? '🏆 Tabla' : '👥 Grupo'}
          </button>
        ))}
      </div>

      <main className={styles.main}>
        {tab === 'pronosticos' && (
          <>
            <div className={styles.phaseScroll}>
              {PHASE_ORDER.map(ph => (
                matches.some(m => m.phase === ph) && (
                  <button
                    key={ph}
                    className={[styles.phaseBtn, phaseFilter === ph ? styles.phaseBtnActive : ''].join(' ')}
                    onClick={() => setPhaseFilter(ph)}
                  >
                    <PhaseLabel phase={ph} />
                  </button>
                )
              ))}
            </div>

            {Object.entries(groupedByGroup).sort(([a], [b]) => a.localeCompare(b)).map(([groupKey, groupMatches]) => (
              <div key={groupKey}>
                {phaseFilter === 'group' && <div className={styles.groupHeader}>Grupo {groupKey}</div>}
                {groupMatches.map(match => {
                  const pred = predictions[match.id] || {}
                  const closed = matchClosed(match)
                  const finished = match.status === 'finished'

                  let ptsClass = ''
                  let ptsLabel = ''
                  if (finished && pred.points !== undefined) {
                    if (pred.points === 3) { ptsClass = styles.ptsExact; ptsLabel = '⚡ Exacto · 3 pts' }
                    else if (pred.points === 1) { ptsClass = styles.ptsResult; ptsLabel = '✓ Resultado · 1 pt' }
                    else { ptsClass = styles.ptsMiss; ptsLabel = '✗ Sin puntos' }
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
                          {finished ? (
                            <div className={styles.result}>
                              <span>{match.home_score}</span>
                              <span className={styles.dash}>–</span>
                              <span>{match.away_score}</span>
                            </div>
                          ) : (
                            <div className={styles.inputs}>
                              <input
                                className={[styles.scoreInput, closed ? styles.scoreInputClosed : ''].join(' ')}
                                type="number" min="0" max="20"
                                value={pred.home_score ?? ''}
                                onChange={e => !closed && handleScoreChange(match.id, 'home_score', e.target.value)}
                                readOnly={closed}
                                placeholder="–"
                              />
                              <span className={styles.dash}>–</span>
                              <input
                                className={[styles.scoreInput, closed ? styles.scoreInputClosed : ''].join(' ')}
                                type="number" min="0" max="20"
                                value={pred.away_score ?? ''}
                                onChange={e => !closed && handleScoreChange(match.id, 'away_score', e.target.value)}
                                readOnly={closed}
                                placeholder="–"
                              />
                            </div>
                          )}
                          {finished && pred.home_score !== undefined && (
                            <div className={styles.predSub}>Pronosticaste: {pred.home_score}–{pred.away_score}</div>
                          )}
                        </div>

                        <div className={[styles.team, styles.teamRight].join(' ')}>
                          <Flag name={match.away_team} size={40} />
                          <span className={styles.teamName}>{match.away_team}</span>
                        </div>
                      </div>
                      {ptsLabel && <div className={[styles.pts, ptsClass].join(' ')}>{ptsLabel}</div>}
                    </Card>
                  )
                })}
              </div>
            ))}

            <div className={styles.saveBar}>
              {savedMsg && <span className={styles.savedMsg}>{savedMsg}</span>}
              <Button variant="primary" size="lg" fullWidth loading={saving} onClick={savePredictions}>
                Guardar pronósticos
              </Button>
            </div>
          </>
        )}

        {tab === 'tabla' && (
          <>
            <div className={styles.lbCard}>
              <div className={styles.lbHeader}>
                <span>#</span><span>Jugador</span><span>⚡ Exactos</span><span>Pts</span>
              </div>
              {leaderboard.map((row, i) => (
                <div key={row.user_id} className={[styles.lbRow, row.user_id === user.id ? styles.lbRowMe : ''].join(' ')}>
                  <span className={styles.lbPos}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                  </span>
                  <div className={styles.lbUser}>
                    <Avatar name={row.username} color={row.avatar_color} size={30} />
                    <div>
                      <div className={styles.lbName}>{row.username} {row.user_id === user.id && <span className={styles.youChip}>Vos</span>}</div>
                      <div className={styles.lbSub}>{row.total_predictions} pronóstico{row.total_predictions !== 1 ? 's' : ''}</div>
                    </div>
                  </div>
                  <span className={styles.lbExact}>{row.exact_scores}</span>
                  <span className={styles.lbPts}>{row.total_points}</span>
                </div>
              ))}
            </div>
            <p className={styles.lbNote}>⚡ Exacto = marcador exacto (3 pts) · ✓ Resultado = ganador/empate (1 pt)</p>
          </>
        )}

        {tab === 'miembros' && (
          <>
            <Card className={styles.inviteCard}>
              <div className={styles.inviteTitle}>Invitá a tus amigos</div>
              <div className={styles.inviteDesc}>Compartí el código para que se unan al grupo.</div>
              <div className={styles.codeBox}>{group?.code}</div>
              <Button variant="secondary" fullWidth onClick={copyCode}>
                {copied ? '¡Copiado! 🎉' : 'Copiar código'}
              </Button>
            </Card>

            <div className={styles.memberList}>
              <div className={styles.memberListTitle}>{members.length} participante{members.length !== 1 ? 's' : ''}</div>
              {members.map(m => {
                const lb = leaderboard.find(l => l.username === m.username)
                return (
                  <div key={m.username} className={styles.memberRow}>
                    <Avatar name={m.username} color={m.avatar_color} size={36} />
                    <div className={styles.memberInfo}>
                      <div className={styles.memberName}>{m.username}</div>
                      <div className={styles.memberStat}>
                        {lb?.total_predictions || 0} pronósticos · {lb?.total_points || 0} pts
                      </div>
                    </div>
                    {lb?.exact_scores > 0 && <Badge color="success">⚡ {lb.exact_scores}</Badge>}
                  </div>
                )
              })}
            </div>
          </>
        )}
      </main>
    </div>
  )
}

function formatDate(dateStr) {
  if (!dateStr) return '–'
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}
