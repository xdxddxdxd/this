import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };
serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: cors });
  const { word } = await request.json();
  const clean = typeof word === 'string' ? word.trim() : '';
  if (!clean || clean.length > 100) return new Response(JSON.stringify({ error: 'Invalid word.' }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } });
  const response = await fetch(`https://sozluk.gov.tr/gts?ara=${encodeURIComponent(clean)}`);
  const payload = await response.json();
  const valid = Array.isArray(payload) && !payload.error;
  return new Response(JSON.stringify({ isValid: valid, correctForm: valid ? clean : undefined, meanings: valid ? payload.map((item: { anlamlarListe?: unknown[] }) => item.anlamlarListe || []).flat().slice(0, 10) : [] }), { headers: { ...cors, 'Content-Type': 'application/json' } });
});
