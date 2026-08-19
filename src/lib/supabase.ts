import { createClient } from '@supabase/supabase-js';

// 优先读取 .env 中的 VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY（Netlify 部署时在环境变量里配置同名变量即可）。
// 保留硬编码兜底值，避免本地忘记配 .env 时直接白屏。
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://idoeuqqfnkbfburpgevw.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_1iqFf43L6Wh3HWZbPJ08kQ_3wOuPOJS';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);