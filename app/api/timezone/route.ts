import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { city } = await req.json()
    if (!city) return NextResponse.json({ error: 'city required' }, { status: 400 })

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 150,
      system: 'You are a timezone lookup tool. Given any city name return ONLY a raw JSON object with two fields: timezone (valid IANA string) and name (clean city name). No markdown, no backticks, no explanation. Example: {"timezone":"America/Chicago","name":"St. Louis"}',
      messages: [{ role: 'user', content: city }]
    })

    const raw = response.content[0].type === 'text' ? response.content[0].text.trim() : ''
    const result = JSON.parse(raw)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
