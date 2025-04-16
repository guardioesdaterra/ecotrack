import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ycttxorvsijgagobvqiq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InljdHR4b3J2c2lqZ2Fnb2J2cWlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0Njc2OTEsImV4cCI6MjA2MDA0MzY5MX0.Jqa7rFw2kZ431ZArIp-A3pHV1GjablWCARV6e19dDbE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
