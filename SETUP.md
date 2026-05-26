# PRODE 2026 — Guía de Setup

## Qué incluye el proyecto

- **Frontend**: React + Vite, listo para Netlify
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **104 partidos**: Fase de grupos (48) + Ronda de 32 + Octavos + Cuartos + Semis + Final
- **Puntuación automática**: 1 pt por resultado correcto, 3 pts por marcador exacto
- **Tabla en tiempo real**: se actualiza automáticamente con Supabase Realtime
- **Grupos con código**: cada grupo tiene un código de 6 letras para invitar amigos

---

## Paso 1 — Crear el proyecto en Supabase

1. Ir a [supabase.com](https://supabase.com) y crear una cuenta gratuita
2. Clic en **New project**
3. Elegir nombre (ej. `prode2026`), región más cercana (US East), y una contraseña de base de datos
4. Esperar que se inicialice (~1 min)

---

## Paso 2 — Ejecutar el schema SQL

1. En el dashboard de Supabase, ir a **SQL Editor**
2. Pegar el contenido de `supabase_schema.sql` y ejecutar (▶ Run)
3. Luego pegar el contenido de `supabase_matches_seed.sql` y ejecutar

Esto crea todas las tablas, políticas de seguridad, la vista de leaderboard, y carga los 104 partidos.

---

## Paso 3 — Obtener las credenciales

1. En Supabase, ir a **Settings → API**
2. Copiar:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public key** → `VITE_SUPABASE_ANON_KEY`

---

## Paso 4 — Configurar variables de entorno localmente

Crear un archivo `.env` en la raíz del proyecto (copiar desde `.env.example`):

```
VITE_SUPABASE_URL=https://XXXXXXXXXXXXXXXX.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Para probar localmente:

```bash
npm install
npm run dev
```

---

## Paso 5 — Deploy en Netlify

### Opción A: desde la interfaz de Netlify (más fácil)

1. Subir el proyecto a GitHub
2. Ir a [netlify.com](https://netlify.com) y crear cuenta gratuita
3. Clic en **Add new site → Import an existing project**
4. Conectar con GitHub y seleccionar el repositorio
5. En **Build settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. En **Environment variables**, agregar:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
7. Clic en **Deploy site**

### Opción B: desde la terminal con Netlify CLI

```bash
npm install -g netlify-cli
netlify login
netlify init
netlify env:set VITE_SUPABASE_URL "tu-url"
netlify env:set VITE_SUPABASE_ANON_KEY "tu-key"
netlify deploy --prod
```

---

## Paso 6 — Configurar la URL de redirección en Supabase

1. Ir a Supabase → **Authentication → URL Configuration**
2. En **Site URL**, poner la URL de Netlify (ej. `https://prode2026.netlify.app`)
3. En **Redirect URLs**, agregar la misma URL

---

## Cómo cargar resultados de partidos

Cuando se juegue un partido, actualizarlo en Supabase:

```sql
UPDATE public.matches
SET home_score = 2,
    away_score = 0,
    status = 'finished'
WHERE id = 1;
```

El trigger automático calcula los puntos de todos los pronósticos al instante.

Para marcar un partido como "en juego" (opcional):
```sql
UPDATE public.matches SET status = 'live' WHERE id = 1;
```

---

## Sistema de puntos

| Situación | Puntos |
|-----------|--------|
| Marcador exacto (ej. pronosticaste 2-1 y fue 2-1) | ⚡ 3 pts |
| Resultado correcto (ej. pronosticaste victoria local) | ✓ 1 pt |
| Sin acierto | 0 pts |

Los pronósticos se cierran automáticamente cuando el horario del partido ya pasó.

---

## Estructura del proyecto

```
prode2026/
├── src/
│   ├── lib/
│   │   ├── supabase.js        # Cliente de Supabase
│   │   └── AuthContext.jsx    # Auth con email/password
│   ├── components/
│   │   ├── UI.jsx             # Componentes reutilizables
│   │   └── UI.module.css
│   ├── pages/
│   │   ├── Auth.jsx           # Login / Registro
│   │   ├── Auth.module.css
│   │   ├── Dashboard.jsx      # Mis grupos
│   │   ├── Dashboard.module.css
│   │   ├── Group.jsx          # Pronósticos + Tabla + Miembros
│   │   └── Group.module.css
│   ├── App.jsx                # Router
│   ├── main.jsx               # Entry point
│   └── index.css              # Estilos globales
├── supabase_schema.sql        # Tablas, RLS, triggers, vistas
├── supabase_matches_seed.sql  # Los 104 partidos
├── netlify.toml               # Config de deploy
├── .env.example               # Variables de entorno de ejemplo
└── package.json
```

---

## Preguntas frecuentes

**¿Cuántos usuarios puede tener?**
El plan gratuito de Supabase soporta 50.000 MAU y 500MB de base de datos. Para un PRODE entre amigos es más que suficiente.

**¿Se pueden agregar más grupos?**
Sí, sin límite. Cada usuario puede crear o unirse a múltiples grupos.

**¿Qué pasa con los partidos de eliminatorias?**
Los partidos de ronda de 32 en adelante tienen equipos genéricos (1A, 2B, etc.) hasta que se definan los clasificados. Podés actualizar los nombres de los equipos con un UPDATE en Supabase cuando se conozcan.

**¿Se puede hacer admin para cargar resultados desde la app?**
En la versión actual, los resultados se cargan directamente en Supabase (SQL). Si querés una pantalla de admin dentro de la app, es el siguiente paso a agregar.
