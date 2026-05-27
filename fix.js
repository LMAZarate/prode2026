const fs = require('fs')

const c = fs.readFileSync('src/pages/Group.jsx', 'utf8')
const lines = c.split('\n')

// Reemplazar bloque problematico lineas 231-254
const newBlock = [
  "                          ) : (",
  "                            <div className={styles.inputs}>",
  "                              <input className={isClosed ? styles.scoreInput + ' ' + styles.scoreInputClosed : styles.scoreInput} type=\"number\" min=\"0\" max=\"20\" value={pred.home_score !== undefined ? pred.home_score : 0} onChange={e => { if (!isClosed) chg(match.id, 'home_score', e.target.value) }} readOnly={isClosed} />",
  "                              <span className={styles.dash}>-</span>",
  "                              <input className={isClosed ? styles.scoreInput + ' ' + styles.scoreInputClosed : styles.scoreInput} type=\"number\" min=\"0\" max=\"20\" value={pred.away_score !== undefined ? pred.away_score : 0} onChange={e => { if (!isClosed) chg(match.id, 'away_score', e.target.value) }} readOnly={isClosed} />",
  "                            </div>"
]

lines.splice(230, 7, ...newBlock)

fs.writeFileSync('src/pages/Group.jsx', lines.join('\n'), 'utf8')
console.log('OK - lineas:', lines.length)