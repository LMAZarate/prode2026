const fs = require('fs')
let c = fs.readFileSync('src/pages/Group.jsx', 'utf8')

// Cambiar valor default de 0 a vacio
c = c.replace('value={pred.home_score!==undefined?pred.home_score:0}', 'value={pred.home_score!==undefined?pred.home_score:""}')
c = c.replace('value={pred.away_score!==undefined?pred.away_score:0}', 'value={pred.away_score!==undefined?pred.away_score:""}')

// Corregir condicion de guardado
c = c.replace(
  "if (pred.home_score===''||pred.away_score===''||pred.home_score===undefined||pred.away_score===undefined) return",
  "if (pred.home_score===undefined||pred.away_score===undefined) return"
)

fs.writeFileSync('src/pages/Group.jsx', c, 'utf8')
console.log('OK')