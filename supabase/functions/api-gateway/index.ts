import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

/**
 * 9FIT API Gateway — Central router for versioned API endpoints
 * 
 * Routes:
 *   POST /api/v1/training/generate     → generate-workout
 *   POST /api/v1/training/modify       → modify-workout
 *   POST /api/v1/training/full-plan    → generate-full-plan
 *   POST /api/v1/analytics/recommend   → generate-recommendations
 *   POST /api/v1/assessments/analyze   → analyze-periodization
 *   GET  /api/v1/health                → health check
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const MODULE_ID = 'smartreino';
const API_VERSION = '1.0';

// Route map: path → edge function name
const ROUTES: Record<string, string> = {
  '/api/v1/training/generate': 'generate-workout',
  '/api/v1/training/modify': 'modify-workout',
  '/api/v1/training/full-plan': 'generate-full-plan',
  '/api/v1/analytics/recommend': 'generate-recommendations',
  '/api/v1/assessments/analyze': 'analyze-periodization',
};

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

// In-memory rate limiting (per-instance, resets on cold start)
const rateLimitMap = new Map<string, RateLimitEntry>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 30; // 30 requests per minute per user

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(userId, { count: 1, windowStart: now });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count++;
  return true;
}

function standardHeaders(extra?: Record<string, string>) {
  return {
    ...corsHeaders,
    'Content-Type': 'application/json',
    'X-9FIT-Module': MODULE_ID,
    'X-9FIT-Version': API_VERSION,
    'X-9FIT-Gateway': 'true',
    ...(extra || {}),
  };
}

function jsonResponse(body: unknown, status = 200, extra?: Record<string, string>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: standardHeaders(extra),
  });
}

async function authenticateRequest(req: Request): Promise<{ userId: string; authHeader: string } | Response> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return jsonResponse({ success: false, error: 'Não autorizado — token ausente' }, 401);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

  const authClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: { user }, error } = await authClient.auth.getUser();
  if (error || !user) {
    return jsonResponse({ success: false, error: 'Token inválido ou expirado' }, 401);
  }

  return { userId: user.id, authHeader };
}

function extractPath(req: Request): string {
  const url = new URL(req.url);
  // The path after the function name: /api-gateway/api/v1/...
  // Supabase delivers the full path in the URL
  const fullPath = url.pathname;

  // Extract the route part after /api-gateway
  const gatewayPrefix = '/api-gateway';
  if (fullPath.startsWith(gatewayPrefix)) {
    return fullPath.slice(gatewayPrefix.length) || '/';
  }

  // Fallback: try to use the path as-is or from body
  return fullPath;
}

async function forwardToFunction(
  functionName: string,
  body: unknown,
  authHeader: string,
): Promise<Response> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

  const functionUrl = `${supabaseUrl}/functions/v1/${functionName}`;

  const response = await fetch(functionUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authHeader,
      'apikey': supabaseAnonKey,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  // Add gateway headers to the response
  return jsonResponse(data, response.status);
}

async function logGatewayEvent(
  supabaseUrl: string,
  serviceKey: string,
  eventData: {
    route: string;
    function_name: string;
    user_id: string;
    status: number;
    duration_ms: number;
  },
) {
  try {
    const adminClient = createClient(supabaseUrl, serviceKey);
    await adminClient.from('system_events').insert({
      event_type: 'completed',
      entity_type: 'api_gateway',
      entity_id: crypto.randomUUID(),
      actor_id: eventData.user_id,
      metadata: {
        route: eventData.route,
        function: eventData.function_name,
        status: eventData.status,
        duration_ms: eventData.duration_ms,
        module: MODULE_ID,
        version: API_VERSION,
      },
    });
  } catch {
    // Non-blocking — don't fail the request if logging fails
  }
}

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    // Parse route from request body (since Supabase edge functions use POST to a single endpoint)
    // Support both URL-path routing and body-based routing
    let route: string;
    let body: any = {};

    if (req.method === 'GET') {
      route = extractPath(req);
    } else {
      const rawBody = await req.json().catch(() => ({}));
      // If the body contains a `route` field, use body-based routing
      if (rawBody.route) {
        route = rawBody.route;
        body = rawBody.body || rawBody;
        delete body.route;
      } else {
        route = extractPath(req);
        body = rawBody;
      }
    }

    // Health check — no auth required
    if (route === '/api/v1/health') {
      return jsonResponse({
        status: 'ok',
        module: MODULE_ID,
        version: API_VERSION,
        timestamp: new Date().toISOString(),
        routes: Object.keys(ROUTES),
      });
    }

    // Route listing
    if (route === '/api/v1/routes') {
      return jsonResponse({
        module: MODULE_ID,
        version: API_VERSION,
        routes: Object.entries(ROUTES).map(([path, fn]) => ({
          path,
          method: 'POST',
          function: fn,
        })),
      });
    }

    // Authenticate
    const authResult = await authenticateRequest(req);
    if (authResult instanceof Response) return authResult;
    const { userId, authHeader } = authResult;

    // Rate limit
    if (!checkRateLimit(userId)) {
      return jsonResponse(
        { success: false, error: 'Rate limit excedido. Tente novamente em 1 minuto.' },
        429,
        { 'Retry-After': '60' },
      );
    }

    // Resolve route
    const functionName = ROUTES[route];
    if (!functionName) {
      return jsonResponse(
        {
          success: false,
          error: `Rota não encontrada: ${route}`,
          available_routes: Object.keys(ROUTES),
        },
        404,
      );
    }

    // Forward to target function
    const response = await forwardToFunction(functionName, body, authHeader);
    const duration = Date.now() - startTime;

    // Log event (non-blocking)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    logGatewayEvent(supabaseUrl, serviceKey, {
      route,
      function_name: functionName,
      user_id: userId,
      status: response.status,
      duration_ms: duration,
    });

    return response;
  } catch (error) {
    console.error('[api-gateway] Error:', error);
    return jsonResponse(
      { success: false, error: 'Erro interno no gateway', details: String(error) },
      500,
    );
  }
});
