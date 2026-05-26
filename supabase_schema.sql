-- ============================================================
-- PRODE MUNDIAL 2026 — Supabase Schema
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- Profiles (extiende auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text not null,
  avatar_color text default 'blue',
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "Profiles son públicos" on public.profiles for select using (true);
create policy "Usuario edita su propio perfil" on public.profiles for update using (auth.uid() = id);
create policy "Usuario inserta su perfil" on public.profiles for insert with check (auth.uid() = id);

-- Grupos
create table public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text unique not null default upper(substring(gen_random_uuid()::text, 1, 6)),
  created_by uuid references public.profiles(id),
  created_at timestamptz default now()
);
alter table public.groups enable row level security;
create policy "Grupos visibles para miembros" on public.groups for select using (
  exists (select 1 from public.group_members where group_id = id and user_id = auth.uid())
);
create policy "Cualquier usuario autenticado puede crear grupos" on public.groups for insert with check (auth.uid() = created_by);

-- Miembros de grupo
create table public.group_members (
  group_id uuid references public.groups(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  joined_at timestamptz default now(),
  primary key (group_id, user_id)
);
alter table public.group_members enable row level security;
create policy "Miembros visibles" on public.group_members for select using (true);
create policy "Usuario puede unirse a grupos" on public.group_members for insert with check (auth.uid() = user_id);

-- Partidos
create table public.matches (
  id serial primary key,
  phase text not null, -- 'group', 'r32', 'r16', 'qf', 'sf', '3rd', 'final'
  group_name text,     -- 'A'..'L' solo en fase de grupos
  match_number int,
  home_team text not null,
  away_team text not null,
  home_flag text,
  away_flag text,
  venue text,
  city text,
  match_date timestamptz,
  home_score int,      -- null hasta que se juegue
  away_score int,
  status text default 'upcoming' -- 'upcoming', 'live', 'finished'
);
alter table public.matches enable row level security;
create policy "Partidos visibles para todos" on public.matches for select using (true);

-- Solo admins pueden actualizar resultados (via service role en backend)
-- Para un admin manual: crear un usuario y darle permiso vía función RPC

-- Pronósticos
create table public.predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  group_id uuid references public.groups(id) on delete cascade,
  match_id int references public.matches(id) on delete cascade,
  home_score int not null,
  away_score int not null,
  points int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, group_id, match_id)
);
alter table public.predictions enable row level security;
create policy "Ver pronósticos del grupo" on public.predictions for select using (
  exists (select 1 from public.group_members where group_id = predictions.group_id and user_id = auth.uid())
);
create policy "Insertar propio pronóstico" on public.predictions for insert with check (auth.uid() = user_id);
create policy "Actualizar propio pronóstico" on public.predictions for update using (auth.uid() = user_id);

-- Función: calcular puntos cuando se carga un resultado
create or replace function public.calculate_points()
returns trigger language plpgsql security definer as $$
declare
  match_home int;
  match_away int;
  pred_result text;
  match_result text;
  pts int;
begin
  -- Solo cuando el partido pasa a 'finished'
  if new.status = 'finished' and old.status != 'finished' then
    match_home := new.home_score;
    match_away := new.away_score;
    match_result := case
      when match_home > match_away then 'home'
      when match_home < match_away then 'away'
      else 'draw'
    end;

    update public.predictions p set
      points = case
        when p.home_score = match_home and p.away_score = match_away then 3
        when (
          case when p.home_score > p.away_score then 'home'
               when p.home_score < p.away_score then 'away'
               else 'draw' end
        ) = match_result then 1
        else 0
      end,
      updated_at = now()
    where p.match_id = new.id;
  end if;
  return new;
end;
$$;

create trigger on_match_finished
  after update on public.matches
  for each row execute function public.calculate_points();

-- Vista: tabla de posiciones por grupo
create or replace view public.leaderboard as
select
  gm.group_id,
  p.id as user_id,
  p.username,
  p.avatar_color,
  coalesce(sum(pr.points), 0) as total_points,
  coalesce(count(pr.id) filter (where pr.points = 3), 0) as exact_scores,
  coalesce(count(pr.id) filter (where pr.points = 1), 0) as correct_results,
  coalesce(count(pr.id), 0) as total_predictions
from public.group_members gm
join public.profiles p on p.id = gm.user_id
left join public.predictions pr on pr.user_id = gm.user_id and pr.group_id = gm.group_id
group by gm.group_id, p.id, p.username, p.avatar_color
order by gm.group_id, total_points desc, exact_scores desc;

-- Enable realtime en las tablas clave
alter publication supabase_realtime add table public.predictions;
alter publication supabase_realtime add table public.matches;
