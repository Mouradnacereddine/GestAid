/// <reference types="deno" />

declare module 'https://deno.land/std@0.177.0/http/server.ts' {
  export function serve(handler: (req: Request) => Promise<Response>): void;
}

declare module 'https://deno.land/std@0.177.0/dotenv/mod.ts' {
  export function load(): Promise<{ get(key: string): string | undefined }>;
}

declare module 'https://esm.sh/@supabase/supabase-js' {
  export function createClient(url: string, key: string, options?: any): any;
}
