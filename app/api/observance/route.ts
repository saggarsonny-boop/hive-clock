import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { lat, lon, tradition } = await req.json()

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

    return NextResponse.json({ tradition: 'custom', times: [] })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
