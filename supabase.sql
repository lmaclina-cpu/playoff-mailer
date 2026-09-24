-- Playoff Mailer: prepara Supabase para guardar los envíos y las imágenes.
-- Pégalo entero en Supabase → SQL Editor → New query → Run. Se puede ejecutar
-- más de una vez sin romper nada.

-- 1. Los envíos (borradores) del equipo.
create table if not exists public.envios (
  id            text primary key,
  nombre        text not null default '',
  plantilla_id  text not null default '',
  guardado      text not null default '',
  autor         text not null default '',
  editado_por   text not null default '',
  doc           jsonb not null
);

-- Nadie entra a la tabla desde fuera: solo la app, con su clave secreta
-- (la clave secreta se salta estas reglas; la pública no puede leer nada).
alter table public.envios enable row level security;

-- Permisos explícitos para la clave secreta de la app, por si el proyecto se creó
-- sin "Automatically expose new tables" (lo recomendable).
grant usage on schema public to service_role;
grant select, insert, update, delete on public.envios to service_role;

-- 2. Las imágenes de los correos: tienen que ser públicas para que se vean en Gmail,
-- Outlook, etc. Solo la app puede subir (con la clave secreta).
insert into storage.buckets (id, name, public)
values ('imagenes', 'imagenes', true)
on conflict (id) do update set public = true;
