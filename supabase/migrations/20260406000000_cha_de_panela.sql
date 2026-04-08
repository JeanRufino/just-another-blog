-- Chá de Panela — schema
-- Cole no SQL Editor do Supabase para criar as tabelas.

-- Usuários (sem autenticação real)
create table usuarios (
  id uuid default gen_random_uuid() primary key,
  nome text not null,
  email text not null unique,
  created_at timestamp default now()
);

-- Itens da lista de presentes
create table presentes (
  id uuid default gen_random_uuid() primary key,
  nome text not null,
  loja text,
  url text not null unique,
  imagem_url text,
  created_at timestamp default now()
);

-- Reservas (quem escolheu qual presente)
create table reservas (
  id uuid default gen_random_uuid() primary key,
  presente_id uuid references presentes(id) not null,
  usuario_id uuid references usuarios(id) not null,
  created_at timestamp default now(),
  unique(presente_id) -- cada presente só pode ser reservado uma vez
);

-- Mensagens enviadas
create table mensagens (
  id uuid default gen_random_uuid() primary key,
  usuario_id uuid references usuarios(id),
  nome text not null,
  email text not null,
  mensagem text not null,
  created_at timestamp default now()
);

-- RLS policies (acesso público — app sem auth real)
alter table usuarios  enable row level security;
alter table presentes enable row level security;
alter table reservas  enable row level security;
alter table mensagens enable row level security;

create policy "public_all" on usuarios  for all using (true) with check (true);
create policy "public_all" on presentes for all using (true) with check (true);
create policy "public_all" on reservas  for all using (true) with check (true);
create policy "public_all" on mensagens for all using (true) with check (true);
