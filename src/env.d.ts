declare namespace NodeJS {
  interface ProcessEnv {
    ADMIN_EMAIL?: string;
    ADMIN_PASSWORD?: string;
    NEXT_PUBLIC_SUPABASE_URL?: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
    /** Server-only: used for exams table and other admin data (never expose to client). */
    SUPABASE_SERVICE_ROLE_KEY?: string;
  }
}
