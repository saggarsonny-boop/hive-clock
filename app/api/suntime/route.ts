import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { lat, lon } = await req.json()
    if (!lat || !lon) return NextResponse.json({ error: 'lat and lon required' }, { status: 400 })

    const res = await fetch(`https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lon}&formatted=0`)
    const data = await res.json()

    const sunrise = new Date(data.results.sunrise).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const sunset = new Date(data.results.sunset).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const dayLength = Math.round(data.results.day_length / 3600 * 10) / 10

    return NextResponse.json({ sunrise, sunset, dayLength })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
