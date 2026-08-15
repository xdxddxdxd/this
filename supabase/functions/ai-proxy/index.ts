// Deploy with: supabase functions deploy ai-proxy
// Set GROQ_API_KEY, OPENROUTER_API_KEY and GEMINI_API_KEY as Supabase secrets.
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  try {
    const { provider = 'groq', model, systemPrompt, prompt, image } = await request.json();
    const key = provider === 'openrouter' ? Deno.env.get('OPENROUTER_API_KEY') : provider === 'gemini' ? Deno.env.get('GEMINI_API_KEY') : Deno.env.get('GROQ_API_KEY');
    if (!key) return json({ error: 'AI provider is not configured.' }, 503);
    if (provider === 'gemini') {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-2.5-flash'}:generateContent?key=${key}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }, ...(image ? [{ inline_data: { mime_type: 'image/jpeg', data: image } }] : [])] }] })
      });
      const payload = await response.json();
      if (!response.ok) return json({ error: payload.error?.message || 'Gemini request failed.' }, response.status);
      return json({ content: payload.candidates?.[0]?.content?.parts?.[0]?.text || '' });
    }
    const endpoint = provider === 'openrouter' ? 'https://openrouter.ai/api/v1/chat/completions' : 'https://api.groq.com/openai/v1/chat/completions';
    const response = await fetch(endpoint, { method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model, response_format: { type: 'json_object' }, temperature: 0, messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: prompt }] }) });
    const payload = await response.json();
    if (!response.ok) return json({ error: payload.error?.message || 'AI request failed.' }, response.status);
    return json({ content: payload.choices?.[0]?.message?.content || '{}' });
  } catch {
    return json({ error: 'Invalid AI request.' }, 400);
  }
});
