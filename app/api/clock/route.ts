import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { input, timezone } = await req.json()

    const now = new Date()
    const timeContext = `Current UTC time: ${now.toISOString()}. User timezone: ${timezone || 'UTC'}`

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 300,
      system: `You are HiveClock. You answer time-related questions with warmth and precision.

${timeContext}

Rules:
- Respond in the user's language
- Keep responses under 3 sentences
- Be warm but concise
- End every response with one short companion note on a new line starting with a dash
- Never use markdown, asterisks, or formatting symbols
- Stay focused on time, do not drift into philosophy or essays
- If the question is not time-related, gently redirect: I am a clock, ask me anything about time`,
      messages: [
        {
          role: 'user',
          content: `${input || 'What time is it right now?'}`
        }
      ]
    })

    const answer = response.content[0].type === 'text' ? response.content[0].text : ''
    return NextResponse.json({ answer, timestamp: now.toISOString() })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
