import { createClient } from '@supabase/supabase-js';

// 替换为你真实的 Supabase URL 和 anon Key
const supabaseUrl = 'https://idoeuqqfnkbfburpgevw.supabase.co';
const supabaseAnonKey = 'sb_publishable_1iqFf43L6Wh3HWZbPJ08kQ_3wOuPOJS';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);