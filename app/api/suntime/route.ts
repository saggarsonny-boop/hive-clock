import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json()
    const lat = body.lat
    const lon = body.lon
    const tz = body.tz || 'UTC'
    if (!lat || !lon) return NextResponse.json({ error: 'lat and lon required' }, { status: 400 })
    const res = await fetch('https://api.sunrise-sunset.org/json?lat=' + lat + '&lng=' + lon + '&formatted=0')
    const data = await res.json()
    const r = data.results
    const rise = new Date(r.sunrise)
    const set = new Date(r.sunset)
    const sunrise = rise.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: tz })
    const sunset = set.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: tz })
    const dayLength = Math.round(r.day_length / 3600 * 10) / 10
    return NextResponse.json({ sunrise, sunset, dayLength })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
