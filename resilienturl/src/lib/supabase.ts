import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tcgbecwoqrknanzttwnw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjZ2JlY3dvcXJrbmFuenR0d253Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4NzM5NzQsImV4cCI6MjA2MTQ0OTk3NH0.88rxyIHOcxRA0AISADVqFkzXbf_EliXSbS_QEddsYhk';

export const supabase = createClient(supabaseUrl, supabaseKey);