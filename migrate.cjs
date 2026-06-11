const { initializeApp } = require('firebase/app')
const { getFirestore, collection, getDocs, doc, deleteDoc, updateDoc } = require('firebase/firestore')

const app = initializeApp({
  apiKey: process.env.FB_KEY || "AIzaSyCOcGz-aYwtPTKe4HvK36mOrb-8HhkXEhQ",
  authDomain: "prode2026-ed283.firebaseapp.com",
  projectId: "prode2026-ed283",
})

const db = getFirestore(app)

async function reset() {
  // Borrar predicciones
  const pSnap = await getDocs(collection(db, 'predictions'))
  for (const d of pSnap.docs) {
    await deleteDoc(doc(db, 'predictions', d.id))
    console.log('Borrado prediction:', d.id)
  }

  // Resetear partidos finished a upcoming
  const mSnap = await getDocs(collection(db, 'matches'))
  for (const d of mSnap.docs) {
    if (d.data().status === 'finished') {
      await updateDoc(doc(db, 'matches', d.id), { status: 'upcoming', home_score: null, away_score: null })
      console.log('Reseteado match:', d.data().match_number)
    }
  }

  console.log('LISTO!')
  process.exit(0)
}

reset().catch(e => { console.error(e); process.exit(1) })