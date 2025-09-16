import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

function createStubClient() {
  const envError = new Error(
    'Supabase env not configured: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
  )
  return {
    auth: {
      async getSession() {
        return { data: { session: null }, error: envError } as any
      },
      async getUser() {
        return { data: { user: null }, error: envError } as any
      },
      async signInWithPassword() {
        return { data: null, error: envError } as any
      },
      async signUp() {
        return { data: null, error: envError } as any
      },
      async signOut() {
        return { error: envError } as any
      },
    },
    onAuthStateChange() {
      return { data: { subscription: { unsubscribe() {} } } } as any
    },
    from() {
      throw envError
    },
    rpc() {
      throw envError
    }
  } as any
}

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createSupabaseClient(supabaseUrl, supabaseAnonKey)
    : createStubClient()

export const createClient = createSupabaseClient