import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { input, timezone, language } = await req.json()

    const now = new Date()
    const timeContext = `Current UTC time: ${now.toISOString()}`

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: `You are HiveClock, the world's most humane clock. You understand time in every human dimension: practical, emotional, cultural, and contextual.

${timeContext}

Your job is to answer any time-related query in the user's language with warmth, precision, and zero friction. You support all languages including fictional ones.

Rules:
- Always respond in the same language the user writes in
- Be precise but warm, never robotic
- Include relevant context (sunrise/sunset, day arc, seasonal awareness) when helpful
- For simple "what time is it" queries, give the time cleanly with gentle context
- For complex queries, reason carefully and answer completely
- Never ask follow-up questions
- Keep responses concise and immediately useful
- Include a one-line "companion note" at the end — a gentle, human observation about this moment in time`,
      messages: [
        {
          role: 'user',
          content: `Timezone: ${timezone || 'UTC'}
Query: ${input || 'What time is it right now?'}`
        }
      ]
    })

    const answer = response.content[0].type === 'text' ? response.content[0].text : ''
    return NextResponse.json({ answer, timestamp: now.toISOString() })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
