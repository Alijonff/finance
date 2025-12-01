import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rxrvlrjihredbhttkrql.supabase.co';
const supabaseKey = 'sb_publishable_urq6RUeMTu5hRDT2wPEt7Q_w1Lt0OzK';

export const supabase = createClient(supabaseUrl, supabaseKey);
