declare namespace Deno {
  export interface Env {
    SUPABASE_URL: string;
    SUPABASE_SERVICE_ROLE_KEY: string;
    SUPABASE_ANON_KEY: string;
  }
  export interface Headers {
    get(name: string): string | null;
  }
  export interface Request {
    method: string;
    headers: Headers;
    clone(): Request;
  }
}
