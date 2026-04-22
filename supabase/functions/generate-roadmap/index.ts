import { OpenAI } from "openai"
import { serve } from "std/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { goals } = await req.json()

    if (!goals || !Array.isArray(goals)) {
      return new Response(
        JSON.stringify({ error: 'Goals must be an array of strings' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENROUTER_API_KEY'),
      baseURL: 'https://openrouter.ai/api/v1',
    })

    const prompt = `
      You are an elite manifestation coach and world-class strategic advisor.
      Given the following goals: ${goals.join(", ")}
      
      Generate a professional, high-performance roadmap for each goal.
      For each goal, provide:
      1. Exactly 5 reputable YouTube channels, podcasts, or content creators that specialize in the mindset or specific skills needed for this goal.
      2. Exactly 5 high-quality online communities (Reddit subs, Discord servers, professional networks, masterminds) where successful people in that field hang out.
      
      Requirements:
      - The descriptions must be highly specific to the goal.
      - Don't give generic advice.
      - Return the data in a flat array of objects as shown below.
      
      Format your response strictly as a JSON array of objects:
      [{ "goal": "string", "content": ["string", "string", "string", "string", "string"], "network": ["string", "string", "string", "string", "string"] }]
    `

    const chatCompletion = await openai.chat.completions.create({
      model: "google/gemini-2.0-flash-001",
      messages: [
        { role: "system", content: "You are a helpful assistant that returns JSON roadmaps." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    })

    const roadmapData = JSON.parse(
      chatCompletion.choices?.[0]?.message?.content || '{"roadmaps": []}'
    );
    const finalData = roadmapData.roadmaps || roadmapData

    return new Response(
      JSON.stringify(finalData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
