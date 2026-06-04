import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../lib/firebase'
import { collection, getDocs, doc, updateDoc, writeBatch } from 'firebase/firestore'
import { useAuth } from '../lib/AuthContext'
import { Button, Card, Spinner } from '../components/UI'
import styles from './Admin.module.css'

const ADMIN_ID = 'reemplazar-con-tu-uid'

export default function AdminPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [matches, setMatches] = useState([])
  const [results, setResults] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [jornada, setJornada] = useState(1)

  useEffect(() => {
    if (user && user.uid !== ADMIN_ID) navigate('/dashboard')
    loadMatches()
  }, [user])

  async function loadMatches() {
    const snap = await getDocs(collection(db, 'matches'))
    const all = snap.docs.map(d => ({id:d.id,...d.data()})).sort((a,b)=>a.match_number-b.match_number)
    setMatches(all)
    setLoading(false)
  }

  function chg(matchId, side, val) {
    setResults(prev => ({...prev, [matchId]: {...prev[matchId]||{}, [side]: val}}))
  }

  async function saveResults() {
    setSaving(true); setMsg('')
    const batch = writeBatch(db)
    const jornadaMatches = matches.filter(m => m.jornada === jornada)
    
    for (const match of jornadaMatches) {
      const r = results[match.id]
      if (r?.home_score === undefined || r?.away_score === undefined) continue
      if (r.home_score === '' || r.away_score === '') continue
      
      const home = parseInt(r.home_score)
      const away = parseInt(r.away_score)
      batch.update(doc(db, 'matches', match.id), {
        home_score: home,
        away_score: away,
        status: 'finished'
      })
    }
    
    await batch.commit()
    await calcPoints(jornadaMatches)
    setMsg('Resultados guardados! Puntos calculados.')
    setSaving(false)
    setTimeout(() => setMsg(''), 4000)
    loadMatches()
  }

  async function calcPoints(jornadaMatches) {
    const predSnap = await getDocs(collection(db, 'predictions'))
    const batch = writeBatch(db)
    
    for (const match of jornadaMatches) {
      const r = results[match.id]
      if (!r || r.home_score === '' || r.away_score === '') continue
      const home = parseInt(r.home_score)
      const away = parseInt(r.away_score)
      const matchResult = home > away ? 'home' : home < away ? 'away' : 'draw'
      
      const matchPreds = predSnap.docs.filter(d => d.data().match_id === match.id)
      for (const pd of matchPreds) {
        const p = pd.data()
        const predResult = p.home_score > p.away_score ? 'home' : p.home_score < p.away_score ? 'away' : 'draw'
        let points = 0
        if (p.home_score === home && p.away_score === away) points = 3
        else if (predResult === matchResult) points = 1
        batch.update(doc(db, 'predictions', pd.id), { points })
      }
    }
    await batch.commit()
  }

  const jornadaMatches = matches.filter(m => m.jornada === jornada)
  const jornadas = [...new Set(matches.map(m => m.jornada))].sort((a,b)=>a-b)

  if (loading) return <div style={{display:'flex',justifyContent:'center',padding:'3rem'}}><Spinner size={32}/></div>

  return (
    <div style={{maxWidth:600,margin:'0 auto',padding:'1rem'}}>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:'1.5rem'}}>
        <button onClick={()=>navigate('/dashboard')} style={{background:'none',border:'none',cursor:'pointer',fontSize:18}}>Grupos</button>
        <h2 style={{fontSize:20,fontWeight:600}}>Panel Admin</h2>
      </div>

      <div style={{display:'flex',gap:8,marginBottom:'1.5rem',flexWrap:'wrap'}}>
        {jornadas.map(j => (
          <button key={j} onClick={()=>setJornada(j)} style={{padding:'6px 14px',borderRadius:20,border:'1px solid #ccc',background:jornada===j?'#00b843':'transparent',color:jornada===j?'white':'inherit',cursor:'pointer',fontWeight:500}}>
            Fecha {j}
          </button>
        ))}
      </div>

      {jornadaMatches.map(match => (
        <Card key={match.id} style={{marginBottom:10,padding:'1rem'}}>
          <div style={{fontSize:11,color:'#999',marginBottom:8}}>{match.city} - {match.match_date ? new Date(match.match_date).toLocaleDateString('es-AR') : ''}</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr auto 1fr',alignItems:'center',gap:8}}>
            <div style={{textAlign:'center',fontSize:13,fontWeight:500}}>{match.home_team}</div>
            <div style={{display:'flex',gap:6,alignItems:'center'}}>
              {match.status === 'finished' ? (
                <span style={{fontSize:20,fontWeight:700}}>{match.home_score} - {match.away_score}</span>
              ) : (
                <>
                  <input type="number" min="0" max="20" value={results[match.id]?.home_score ?? ''} onChange={e=>chg(match.id,'home_score',e.target.value)} style={{width:44,height:44,textAlign:'center',fontSize:20,fontWeight:600,border:'1px solid #ccc',borderRadius:8}} />
                  <span>-</span>
                  <input type="number" min="0" max="20" value={results[match.id]?.away_score ?? ''} onChange={e=>chg(match.id,'away_score',e.target.value)} style={{width:44,height:44,textAlign:'center',fontSize:20,fontWeight:600,border:'1px solid #ccc',borderRadius:8}} />
                </>
              )}
            </div>
            <div style={{textAlign:'center',fontSize:13,fontWeight:500}}>{match.away_team}</div>
          </div>
          {match.status === 'finished' && <div style={{textAlign:'center',marginTop:6,fontSize:11,color:'#00b843'}}>Finalizado</div>}
        </Card>
      ))}

      {msg && <div style={{background:'#d6f5e3',color:'#007a2c',padding:'10px 14px',borderRadius:8,marginBottom:12,textAlign:'center'}}>{msg}</div>}
      <Button variant="primary" size="lg" fullWidth loading={saving} onClick={saveResults}>
        Guardar resultados Fecha {jornada}
      </Button>
    </div>
  )
}
