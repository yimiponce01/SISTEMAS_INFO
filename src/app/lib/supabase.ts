import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ogohkzvwgdmesxpoapkt.supabase.co/rest/v1/'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nb2hrenZ3Z2RtZXN4cG9hcGt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4NjE5MTIsImV4cCI6MjA5NDQzNzkxMn0.UnhThj_evoiP6I9kqEg5aV7cFDjC2bgXLWhtxXBUIU0'

export const supabase = createClient(
    supabaseUrl,
    supabaseKey
)