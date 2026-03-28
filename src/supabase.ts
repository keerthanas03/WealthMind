import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mxejnvlvgmzyjdzcaspv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14ZWpudmx2Z216eWpkemNhc3B2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2OTY3NDYsImV4cCI6MjA5MDI3Mjc0Nn0.xwt9Y0lYqrkLMlOqRjQ9oLjNAYzrA8Qs2Fn1co_2z1U';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
