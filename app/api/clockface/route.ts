import OpenAI from 'openai'
import { NextRequest, NextResponse } from 'next/server'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { prompt } = await req.json()
    if (!prompt) return NextResponse.json({ error: 'prompt is required' }, { status: 400 })

    const safePrompt = `A beautiful decorative clock face design: ${prompt}. Circular clock, clear hour markers, elegant hands, no text, no numbers, artistic illustration style, high quality.`

    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: safePrompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard'
    })

    const imageUrl = response.data?.[0]?.url ?? null
    return NextResponse.json({ imageUrl })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
