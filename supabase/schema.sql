-- ============================================================
-- AuraMatch · Supabase 数据库结构（与线上项目 idoeuqqfnkbfburpgevw 实际一致）
--
-- 说明：这份文件最早是我在没连 Supabase 之前"猜"的一版表结构。真正接上
-- 官方 Supabase MCP 连接器、用 list_tables 探查后发现，项目里其实已经有
-- 另一版 profiles 表在跑（30 条种子数据，字段是 full_name / native_culture /
-- target_culture / is_ai_agent），而不是我猜的 name / country / city 那套。
-- 为了不覆盖已有真实数据，最终是在原表基础上做增量迁移，而不是重建表。
-- 下面这份 SQL 已经用 apply_migration 在线上执行过了，此文件只是留档，
-- 方便你以后要在一个全新的 Supabase 项目上复现同样的结构时直接复制执行。
-- ============================================================

-- profiles 表（原本就存在，这里列出完整结构方便查阅）
-- create table public.profiles (
--   id uuid primary key default gen_random_uuid(),
--   full_name text not null,
--   avatar_url text,
--   native_culture text,   -- 形如 "🇹🇭 泰国·曼谷"，已带国旗 emoji
--   target_culture text,   -- 形如 "🇬🇧 英国/英语"，即想学的语言/文化
--   bio text,
--   interests text[],
--   is_ai_agent boolean default false,  -- true = 种子/影子账号，false = 真实用户
--   created_at timestamptz default timezone('utc'::text, now()),
--   age int   -- 本次迁移新增
-- );

-- messages 表（同样是已存在的表，目前前端还没用到，留给以后的聊天功能）
-- create table public.messages (
--   id uuid primary key default gen_random_uuid(),
--   sender text,
--   text text,
--   is_alert boolean default false,
--   created_at timestamptz default timezone('utc'::text, now())
-- );

-- ============================================================
-- 本次实际执行的增量迁移（已通过 Supabase MCP 的 apply_migration 跑过）：
-- 1) 给 profiles 加 age 字段
-- 2) 修复 30 条种子数据里头像重复的问题，统一换成 randomuser.me 的 30 张不重复真人肖像，
--    并把 age 一并补上（和本地影子卡片 SHADOW_PROFILES 的数值保持一致）
-- 3) 给 profiles 加 insert 策略，允许匿名提交（阶段三建卡表单要用）
-- 4) 建 avatars 这个 Storage bucket，供阶段三用户上传自己的头像
-- ============================================================

alter table public.profiles add column if not exists age int;

drop policy if exists "Anyone can create a profile" on public.profiles;
create policy "Anyone can create a profile"
  on public.profiles for insert
  with check (true);

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "Avatar images are publicly accessible" on storage.objects;
create policy "Avatar images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "Anyone can upload an avatar" on storage.objects;
create policy "Anyone can upload an avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars');

-- 头像去重 + 补 age 的 30 条 UPDATE 语句已经在线上跑过，具体内容见本次会话记录，
-- 这里不重复贴，避免这份文件过长；如需要在新项目复现，找我要一份完整脚本即可。
