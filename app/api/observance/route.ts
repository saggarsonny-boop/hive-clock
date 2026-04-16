import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { lat, lon, tradition, custom } = await req.json()

    if (tradition === 'islam') {
      const res = await fetch(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=2`)
      const data = await res.json()
      const t = data.data.timings
      return NextResponse.json({
        tradition: 'Islam',
        times: [
          { name: 'Fajr', time: t.Fajr },
          { name: 'Sunrise', time: t.Sunrise },
          { name: 'Dhuhr', time: t.Dhuhr },
          { name: 'Asr', time: t.Asr },
          { name: 'Maghrib', time: t.Maghrib },
          { name: 'Isha', time: t.Isha },
        ]
      })
    }

    if (tradition === 'judaism') {
      const today = new Date()
      const mm = String(today.getMonth()+1).padStart(2,'0')
      const dd = String(today.getDate()).padStart(2,'0')
      const yyyy = today.getFullYear()
      const res = await fetch(`https://www.hebcal.com/shabbat?cfg=json&latitude=${lat}&longitude=${lon}&m=50&gy=${yyyy}&gm=${mm}&gd=${dd}`)
      const data = await res.json()
      const times = data.items?.filter((i: {category:string}) => i.category === 'candles' || i.category === 'havdalah').map((i: {title:string, date:string}) => ({
        name: i.title,
        time: new Date(i.date).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })
      })) || []
      return NextResponse.json({ tradition: 'Judaism', times })
    }

    if (tradition === 'sunrise') {
      const res = await fetch(`https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lon}&formatted=0`)
      const data = await res.json()
      const r = data.results
      const fmt = (d: string) => new Date(d).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })
      return NextResponse.json({
        tradition: 'Sun follower',
        times: [
          { name: 'Astronomical dawn', time: fmt(r.astronomical_twilight_begin) },
          { name: 'Nautical dawn', time: fmt(r.nautical_twilight_begin) },
          { name: 'Civil dawn', time: fmt(r.civil_twilight_begin) },
          { name: 'Sunrise', time: fmt(r.sunrise) },
          { name: 'Solar noon', time: fmt(r.solar_noon) },
          { name: 'Sunset', time: fmt(r.sunset) },
          { name: 'Civil dusk', time: fmt(r.civil_twilight_end) },
          { name: 'Nautical dusk', time: fmt(r.nautical_twilight_end) },
          { name: 'Astronomical dusk', time: fmt(r.astronomical_twilight_end) },
        ]
      })
    }

    if (tradition === 'moon') {
      const now = new Date()
      const known = new Date(2000, 0, 6)
      const diff = (now.getTime() - known.getTime()) / (1000 * 60 * 60 * 24)
      const cycle = diff % 29.53
      const phases = ['New Moon','Waxing Crescent','First Quarter','Waxing Gibbous','Full Moon','Waning Gibbous','Last Quarter','Waning Crescent']
      const phase = phases[Math.floor(cycle / 29.53 * 8)]
      const daysInCycle = Math.round(cycle)
      const daysToFull = cycle < 14.765 ? Math.round(14.765 - cycle) : Math.round(29.53 - cycle + 14.765)
      return NextResponse.json({
        tradition: 'Lunar',
        times: [
          { name: 'Current phase', time: phase },
          { name: 'Day in cycle', time: `Day ${daysInCycle} of 29` },
          { name: 'Days to full moon', time: `${daysToFull} days` },
        ]
      })
    }

    if (tradition === 'custom' && custom) {
      const sunRes = await fetch(`https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lon}&formatted=0`)
      const sunData = await sunRes.json()
      const r = sunData.results
      const sunrise = new Date(r.sunrise).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })
      const sunset = new Date(r.sunset).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })
      const solarNoon = new Date(r.solar_noon).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })

      const response = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 500,
        system: `You are a sacred time calculator. Given a tradition or practice, return the key observance times for today based on the sun data provided. Return ONLY a JSON array of objects with "name" and "time" fields. No markdown, no explanation.`,
        messages: [{
          role: 'user',
          content: `Tradition: ${custom}
Today's sun data: sunrise ${sunrise}, solar noon ${solarNoon}, sunset ${sunset}
Location: latitude ${lat}, longitude ${lon}

Return the key observance times for this tradition today as a JSON array. Include 3-8 times relevant to this tradition.`
        }]
      })

      const raw = response.content[0].type === 'text' ? response.content[0].text : '[]'
      const times = JSON.parse(raw)
      return NextResponse.json({ tradition: custom, times })
    }

    return NextResponse.json({ tradition: 'custom', times: [] })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
