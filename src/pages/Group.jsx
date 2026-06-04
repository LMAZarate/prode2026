import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { db } from '../lib/firebase'
import { collection, doc, getDoc, getDocs, query, where, setDoc, onSnapshot } from 'firebase/firestore'
import { useAuth } from '../lib/AuthContext'
import { Button, Card, Avatar, Spinner, PhaseLabel } from '../components/UI'
import styles from './Group.module.css'

const PHASES = ['group','r32','r16','qf','sf','3rd','final']
const CC = {'Mexico':'MX','Sudafrica':'ZA','Republica de Corea':'KR','Republica Checa':'CZ','Canada':'CA','Bosnia y Herzegovina':'BA','Catar':'QA','Suiza':'CH','Brasil':'BR','Marruecos':'MA','Haiti':'HT','Escocia':'GB','Estados Unidos':'US','Paraguay':'PY','Australia':'AU','Turquia':'TR','Alemania':'DE','Curazao':'CW','Costa de Marfil':'CI','Ecuador':'EC','Paises Bajos':'NL','Japon':'JP','Suecia':'SE','Tunez':'TN','Belgica':'BE','Egipto':'EG','Iran':'IR','Nueva Zelanda':'NZ','Espana':'ES','Cabo Verde':'CV','Arabia Saudi':'SA','Uruguay':'UY','Francia':'FR','Senegal':'SN','Irak':'IQ','Noruega':'NO','Argentina':'AR','Argelia':'DZ','Austria':'AT','Jordania':'JO','Portugal':'PT','RD de Congo':'CD','Uzbekistan':'UZ','Colombia':'CO','Inglaterra':'GB','Croacia':'HR','Ghana':'GH','Panama':'PA'}

function Flag({name,size=40}) {
  const code = CC[name]
  if (!code) return React.createElement('span',null,'?')
  return React.createElement('img',{src:'https://purecatamphetamine.github.io/country-flag-icons/3x2/'+code+'.svg',alt:name,style:{width:size,height:size*0.67,objectFit:'cover',borderRadius:3,display:'block'},onError:e=>{e.target.style.display='none'}})
}

function fmt(d) {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('es-AR',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})
}

function isClosed(m) {
  return m.status==='finished'||m.status==='locked'||(m.match_date&&new Date(m.match_date)<new Date())
}

export default function GroupPage() {
  const {id} = useParams()
  const {user,profile} = useAuth()
  const navigate = useNavigate()
  const [group,setGroup] = useState(null)
  const [tab,setTab] = useState('pronosticos')
  const [matches,setMatches] = useState([])
  const [preds,setPreds] = useState({})
  const [lb,setLb] = useState([])
  const [members,setMembers] = useState([])
  const [loading,setLoading] = useState(true)
  const [saving,setSaving] = useState(false)
  const [msg,setMsg] = useState('')
  const [phase,setPhase] = useState('group')
  const [copied,setCopied] = useState(false)

  const load = useCallback(async () => {
    const gSnap = await getDoc(doc(db,'groups',id))
    if (!gSnap.exists()) { navigate('/dashboard'); return }
    setGroup({id:gSnap.id,...gSnap.data()})

    const mSnap = await getDocs(collection(db,'matches'))
    const allMatches = mSnap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>a.match_number-b.match_number)
    setMatches(allMatches)

    const pSnap = await getDocs(query(collection(db,'predictions'),where('group_id','==',id),where('user_id','==',user.uid)))
    const pm={}; pSnap.docs.forEach(d=>{const x=d.data();pm[x.match_id]=x})
    setPreds(pm)

    const mbSnap = await getDocs(query(collection(db,'group_members'),where('group_id','==',id)))
    const mbs=[]
    for (const d of mbSnap.docs) {
      const pSnap2 = await getDoc(doc(db,'profiles',d.data().user_id))
      if (pSnap2.exists()) mbs.push(pSnap2.data())
    }
    setMembers(mbs)

    const lbData=[]
    for (const mb of mbs) {
      const pSnap3 = await getDocs(query(collection(db,'predictions'),where('group_id','==',id),where('user_id','==',mb.id)))
      let total=0,exact=0,correct=0,total_preds=0
      pSnap3.docs.forEach(d=>{const x=d.data();total+=(x.points||0);if(x.points===3)exact++;if(x.points===1)correct++;total_preds++})
      lbData.push({...mb,total_points:total,exact_scores:exact,correct_results:correct,total_predictions:total_preds})
    }
    lbData.sort((a,b)=>b.total_points-a.total_points||b.exact_scores-a.exact_scores)
    setLb(lbData)
    setLoading(false)
  },[id,user,navigate])

  useEffect(()=>{ load() },[load])

  function chg(mid,side,val) {
    const n = val===''?'':Math.max(0,Math.min(20,parseInt(val)||0))
    setPreds(prev=>{const nx={...prev};nx[mid]={...prev[mid]||{}};nx[mid][side]=n;return nx})
  }

  async function save() {
    setSaving(true);setMsg('')
    const now=new Date().toISOString()
    let count=0
    for (const mid of Object.keys(preds)) {
      const pred=preds[mid]
      const match=matches.find(x=>x.id===mid||x.match_number===parseInt(mid))
      if (!match||match.status==='finished'||match.status==='locked') continue
      if (match.match_date&&new Date(match.match_date)<new Date()) continue
      if (pred.home_score===''||pred.away_score===''||pred.home_score===undefined||pred.away_score===undefined) continue
      const docId = id+'_'+user.uid+'_'+mid
      await setDoc(doc(db,'predictions',docId),{user_id:user.uid,group_id:id,match_id:mid,home_score:parseInt(pred.home_score),away_score:parseInt(pred.away_score),points:0,updated_at:now})
      count++
    }
    setMsg(count?'Guardado! '+count+' pronostico'+(count>1?'s':''):'Sin cambios.')
    setSaving(false);setTimeout(()=>setMsg(''),3000)
  }

  function copyCode() {
    navigator.clipboard.writeText(group?group.code:'')
    setCopied(true);setTimeout(()=>setCopied(false),2000)
  }

  const fm = matches.filter(m=>m.phase===phase)
  const grp={}
  fm.forEach(m=>{const k=m.group_name||'Elim';if(!grp[k])grp[k]=[];grp[k].push(m)})

  if (loading) return React.createElement('div',{className:styles.center},React.createElement(Spinner,{size:32}))

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.back} onClick={()=>navigate('/dashboard')}>Grupos</button>
        <div className={styles.headerCenter}>
          <div className={styles.groupName}>{group?group.name:''}</div>
          <div className={styles.groupCode} onClick={copyCode}>{copied?'Copiado!':'Codigo: '+(group?group.code:'')}</div>
        </div>
        <Avatar name={profile?profile.username:''} color={profile?profile.avatar_color:'blue'} size={32} />
      </header>
      <div className={styles.tabBar}>
        <button className={tab==='pronosticos'?styles.tab+' '+styles.tabActive:styles.tab} onClick={()=>setTab('pronosticos')}>Pronosticos</button>
        <button className={tab==='tabla'?styles.tab+' '+styles.tabActive:styles.tab} onClick={()=>setTab('tabla')}>Tabla</button>
        <button className={tab==='miembros'?styles.tab+' '+styles.tabActive:styles.tab} onClick={()=>setTab('miembros')}>Grupo</button>
      </div>
      <main className={styles.main}>
        {tab==='pronosticos' && (
          <div>
            <div className={styles.phaseScroll}>
              {PHASES.map(ph=>{
                const pm=matches.filter(m=>m.phase===ph)
                if (!pm.length) return null
                const lk=pm.every(m=>m.status==='locked')
                return <button key={ph} className={[styles.phaseBtn,phase===ph?styles.phaseBtnActive:'',lk?styles.phaseBtnLocked:''].join(' ')} onClick={()=>{if(!lk)setPhase(ph)}}><PhaseLabel phase={ph}/>{lk&&' lock'}</button>
              })}
            </div>
            {Object.keys(grp).sort().map(gk=>(
              <div key={gk}>
                {phase==='group'&&<div className={styles.groupHeader}>Grupo {gk}</div>}
                {grp[gk].map(match=>{
                  const pred=preds[match.id]||{}
                  const cl=isClosed(match)
                  const fin=match.status==='finished'
                  const lk=match.status==='locked'
                  let pl='';let pc=''
                  if (fin&&pred.points!==undefined) {
                    if (pred.points===3){pc=styles.ptsExact;pl='Exacto 3 pts'}
                    else if (pred.points===1){pc=styles.ptsResult;pl='Resultado 1 pt'}
                    else{pc=styles.ptsMiss;pl='Sin puntos'}
                  }
                  return (
                    <Card key={match.id} className={cl?styles.matchCard+' '+styles.matchClosed:styles.matchCard}>
                      <div className={styles.matchMeta}><span>{fmt(match.match_date)}</span><span>{match.city}</span></div>
                      <div className={styles.matchBody}>
                        <div className={styles.team}><Flag name={match.home_team} size={40}/><span className={styles.teamName}>{match.home_team}</span></div>
                        <div className={styles.scores}>
                          {lk?(
                            <span>-</span>
                          ):fin?(
                            <div className={styles.result}><span>{match.home_score}</span><span className={styles.dash}>-</span><span>{match.away_score}</span></div>
                          ):(
                            <div className={styles.inputs}>
                              <input className={cl?styles.scoreInput+' '+styles.scoreInputClosed:styles.scoreInput} type="number" min="0" max="20" value={pred.home_score!==undefined?pred.home_score:0} onChange={e=>{if(!cl)chg(match.id,'home_score',e.target.value)}} readOnly={cl}/>
                              <span className={styles.dash}>-</span>
                              <input className={cl?styles.scoreInput+' '+styles.scoreInputClosed:styles.scoreInput} type="number" min="0" max="20" value={pred.away_score!==undefined?pred.away_score:0} onChange={e=>{if(!cl)chg(match.id,'away_score',e.target.value)}} readOnly={cl}/>
                            </div>
                          )}
                        </div>
                        <div className={styles.team}><Flag name={match.away_team} size={40}/><span className={styles.teamName}>{match.away_team}</span></div>
                      </div>
                      {pl&&<div className={pc}>{pl}</div>}
                    </Card>
                  )
                })}
              </div>
            ))}
            <div className={styles.saveBar}>
              {msg&&<span className={styles.savedMsg}>{msg}</span>}
              <Button variant="primary" size="lg" fullWidth loading={saving} onClick={save}>Guardar pronosticos</Button>
            </div>
          </div>
        )}
        {tab==='tabla'&&(
          <div>
            <div className={styles.lbCard}>
              <div className={styles.lbHeader}><span>#</span><span>Jugador</span><span>Exactos</span><span>Pts</span></div>
              {lb.map((row,i)=>(
                <div key={row.id} className={row.id===user.uid?styles.lbRow+' '+styles.lbRowMe:styles.lbRow}>
                  <span className={styles.lbPos}>{i+1}</span>
                  <div className={styles.lbUser}><Avatar name={row.username} color={row.avatar_color} size={30}/><div><div className={styles.lbName}>{row.username}{row.id===user.uid&&<span className={styles.youChip}>Vos</span>}</div><div className={styles.lbSub}>{row.total_predictions} pronosticos</div></div></div>
                  <span className={styles.lbExact}>{row.exact_scores}</span>
                  <span className={styles.lbPts}>{row.total_points}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {tab==='miembros'&&(
          <div>
            <Card className={styles.inviteCard}>
              <div className={styles.inviteTitle}>Invita a tus amigos</div>
              <div className={styles.inviteDesc}>Compartí el codigo para que se unan.</div>
              <div className={styles.codeBox}>{group?group.code:''}</div>
              <Button variant="secondary" fullWidth onClick={copyCode}>{copied?'Copiado!':'Copiar codigo'}</Button>
            </Card>
            <div className={styles.memberList}>
              <div className={styles.memberListTitle}>{members.length} participantes</div>
              {members.map(m=>{
                const row=lb.find(l=>l.id===m.id)
                return <div key={m.id} className={styles.memberRow}><Avatar name={m.username} color={m.avatar_color} size={36}/><div className={styles.memberInfo}><div className={styles.memberName}>{m.username}</div><div className={styles.memberStat}>{row?row.total_predictions:0} pronosticos - {row?row.total_points:0} pts</div></div></div>
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
