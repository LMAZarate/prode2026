const fs = require('fs')
let c = fs.readFileSync('src/pages/Group.module.css', 'utf8')

c = c.replace(
  '.saveBar {\n  position: fixed;\n  bottom: 0;\n  left: 0;\n  right: 0;\n  padding: 1rem;\n  background: var(--c-surface);\n  border-top: 0.5px solid var(--c-border);',
  '.saveBar {\n  position: fixed;\n  bottom: 0;\n  left: 0;\n  right: 0;\n  padding: 1rem;\n  background: var(--c-surface);\n  border-top: 2px solid var(--c-accent);\n  box-shadow: 0 -4px 12px rgba(0,0,0,0.15);'
)

fs.writeFileSync('src/pages/Group.module.css', c, 'utf8')
console.log('OK')