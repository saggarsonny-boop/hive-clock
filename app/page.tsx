'use client'

import { useState, useEffect, useRef } from 'react'

const EXAMPLES = [
  'What time is it in Tokyo right now?',
  'How long until midnight?',
  'What time is sunset in London today?',
  'Should I sleep now?',
  'What time is it for my mum in Lagos?',
  'Quelle heure est-il à Paris?',
  '今は東京で何時ですか?',
]

const WORLD_CITIES = [
  { name: 'London', tz: 'Europe/London' },
  { name: 'Tokyo', tz: 'Asia/Tokyo' },
  { name: 'Dubai', tz: 'Asia/Dubai' },
  { name: 'New York', tz: 'America/New_York' },
  { name: 'Sydney', tz: 'Australia/Sydney' },
  { name: 'Paris', tz: 'Europe/Paris' },
]

export default function HiveClock() {
  const [input, setInput] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [time, setTime] = useState('')
  const [date, setDate] = useState('')
  const [exampleIndex, setExampleIndex] = useState(0)
  const [timezone, setTimezone] = useState('')
  const [showSupport, setShowSupport] = useState(false)
  const [suggestion, setSuggestion] = useState('')
  const [tab, setTab] = useState<'clock'|'world'|'timer'>('clock')
  const [worldTimes, setWorldTimes] = useState<{name:string, time:string, period:string}[]>([])
  const [timerInput, setTimerInput] = useState('')
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [timerRunning, setTimerRunning] = useState(false)
  const [timerDone, setTimerDone] = useState(false)
  const [dayPercent, setDayPercent] = useState(0)
  const [mode, setMode] = useState<'day'|'wind'|'wake'>('day')
  const timerRef = useRef<NodeJS.Timeout|null>(null)

  const getBg = () => {
    if (mode === 'wind') return 'linear-gradient(135deg, #0a0510 0%, #100a20 100%)'
    if (mode === 'wake') return 'linear-gradient(135deg, #1a0f00 0%, #2a1500 100%)'
    return '#060a14'
  }

  const getAccent = () => {
    if (mode === 'wind') return '#6a4a9a'
    if (mode === 'wake') return '#c87a20'
    return '#4a7fa5'
  }

  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    setTimezone(tz)
    const tick = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
      setDate(now.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))
      const pct = (now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()) / 86400 * 100
      setDayPercent(pct)
      const hour = now.getHours()
      if (hour >= 21 || hour < 6) setMode('wind')
      else if (hour >= 6 && hour < 9) setMode('wake')
      else setMode('day')
      setWorldTimes(WORLD_CITIES.map(c => ({
        name: c.name,
        time: now.toLocaleTimeString('en-US', { timeZone: c.tz, hour: '2-digit', minute: '2-digit' }),
        period: parseInt(now.toLocaleTimeString('en-US', { timeZone: c.tz, hour: 'numeric', hour12: false })) >= 6 && parseInt(now.toLocaleTimeString('en-US', { timeZone: c.tz, hour: 'numeric', hour12: false })) < 22 ? 'day' : 'night'
      })))
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => setExampleIndex(i => (i + 1) % EXAMPLES.length), 3000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (timerRunning && timerSeconds > 0) {
      timerRef.current = setTimeout(() => setTimerSeconds(s => s - 1), 1000)
    } else if (timerRunning && timerSeconds === 0) {
      setTimerRunning(false)
      setTimerDone(true)
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [timerRunning, timerSeconds])

  const startTimer = () => {
    const parts = timerInput.trim().split(':')
    let secs = 0
    if (parts.length === 2) secs = parseInt(parts[0]) * 60 + parseInt(parts[1])
    else if (parts.length === 3) secs = parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2])
    else secs = parseInt(timerInput) * 60
    if (secs > 0) { setTimerSeconds(secs); setTimerRunning(true); setTimerDone(false) }
  }

  const formatTimer = (s: number) => {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
    return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
  }

  const anticipate = (q: string) => {
    const ql = q.toLowerCase()
    if (ql.includes('tokyo')) setSuggestion('What time is it in Osaka?')
    else if (ql.includes('sunset')) setSuggestion('What time is sunrise tomorrow?')
    else if (ql.includes('midnight')) setSuggestion('How many hours until dawn?')
    else if (ql.includes('london')) setSuggestion('What time is it in New York?')
    else setSuggestion('')
  }

  const handleAsk = async () => {
    if (!input.trim()) return
    setLoading(true); setAnswer(''); setSuggestion('')
    try {
      const res = await fetch('/api/clock', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ input, timezone }) })
      const data = await res.json()
      setAnswer(data.answer || data.error)
      anticipate(input)
    } catch { setAnswer('Something went wrong.') }
    setLoading(false)
  }

  const accent = getAccent()

  return (
    <main style={{minHeight:'100vh', background:getBg(), color:'#e8f4ff', fontFamily:'system-ui, sans-serif', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'40px 20px', transition:'background 2s'}}>
      <div style={{width:'100%', maxWidth:'600px', display:'flex', flexDirection:'column', gap:'24px'}}>

        <div style={{textAlign:'center'}}>
          <div style={{fontSize:'13px', color:accent, marginBottom:'8px'}}>
            {mode === 'wind' ? '🌙 wind down mode' : mode === 'wake' ? '🌅 wake up mode' : '🐝 your time companion'}
          </div>
          <div style={{fontSize:'clamp(48px,12vw,80px)', fontWeight:'700', letterSpacing:'-0.03em', fontVariantNumeric:'tabular-nums'}}>{time}</div>
          <div style={{fontSize:'15px', color:accent, marginTop:'6px'}}>{date}</div>
          <div style={{fontSize:'12px', color:'#2a4a6a', marginTop:'2px'}}>{timezone}</div>
          <div style={{marginTop:'12px', background:'#0d1a2a', borderRadius:'8px', height:'6px', overflow:'hidden'}}>
            <div style={{height:'100%', width:`${dayPercent}%`, background:`linear-gradient(90deg, ${accent}, #e8f4ff)`, borderRadius:'8px', transition:'width 1s'}}/>
          </div>
          <div style={{display:'flex', justifyContent:'space-between', fontSize:'10px', color:'#1a3a5c', marginTop:'4px'}}>
            <span>midnight</span><span>noon</span><span>midnight</span>
          </div>
        </div>

        <div style={{display:'flex', gap:'8px', justifyContent:'center'}}>
          {(['clock','world','timer'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{padding:'6px 16px', borderRadius:'20px', border:'none', background: tab===t ? accent : '#0d1f35', color: tab===t ? '#fff' : '#4a7fa5', fontSize:'13px', cursor:'pointer', fontWeight: tab===t ? '600' : '400'}}>
              {t === 'clock' ? '🕐 Ask' : t === 'world' ? '🌍 World' : '⏱ Timer'}
            </button>
          ))}
        </div>

        {tab === 'clock' && (
          <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
            <input type='text' value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==='Enter' && handleAsk()} placeholder={EXAMPLES[exampleIndex]}
              style={{width:'100%', background:'#0d1f35', border:`1px solid #1a3a5c`, borderRadius:'16px', padding:'16px 20px', color:'#e8f4ff', fontSize:'16px', outline:'none', boxSizing:'border-box'}}/>
            <button onClick={handleAsk} disabled={loading||!input.trim()} style={{background:loading||!input.trim()?'#0d1f35':`linear-gradient(135deg, ${accent}, #1e6aa5)`, border:'none', borderRadius:'16px', padding:'16px', color:loading||!input.trim()?'#2a4a6a':'#e8f4ff', fontSize:'16px', fontWeight:'600', cursor:loading||!input.trim()?'not-allowed':'pointer'}}>
              {loading ? 'Thinking...' : 'Ask'}
            </button>
            {answer && (
              <div style={{background:'#0a1a2e', border:`1px solid #1a3a5c`, borderRadius:'16px', padding:'24px', display:'flex', flexDirection:'column', gap:'12px'}}>
                <p style={{color:'#c8e0f0', fontSize:'17px', lineHeight:'1.7', margin:0}}>{answer}</p>
                <div style={{display:'flex', gap:'12px', alignItems:'center'}}>
                  <button onClick={() => navigator.clipboard.writeText(answer)} style={{background:'none', border:'none', color:'#2a5a7a', fontSize:'13px', cursor:'pointer', padding:0}}>Copy</button>
                  {suggestion && <button onClick={() => { setInput(suggestion); setAnswer('') }} style={{background:'none', border:`1px solid #1a3a5c`, borderRadius:'8px', color:accent, fontSize:'12px', cursor:'pointer', padding:'4px 10px'}}>Try: {suggestion}</button>}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'world' && (
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
            {worldTimes.map(c => (
              <div key={c.name} style={{background:'#0a1a2e', border:'1px solid #1a3a5c', borderRadius:'16px', padding:'16px 20px'}}>
                <div style={{fontSize:'12px', color:'#2a5a7a', marginBottom:'4px'}}>{c.period === 'night' ? '🌙' : '☀️'} {c.name}</div>
                <div style={{fontSize:'28px', fontWeight:'700', fontVariantNumeric:'tabular-nums'}}>{c.time}</div>
              </div>
            ))}
          </div>
        )}

        {tab === 'timer' && (
          <div style={{display:'flex', flexDirection:'column', gap:'16px', alignItems:'center'}}>
            {!timerRunning && timerSeconds === 0 && !timerDone && (
              <div style={{display:'flex', gap:'8px', width:'100%'}}>
                <input type='text' value={timerInput} onChange={e => setTimerInput(e.target.value)} placeholder='5 (mins) or 1:30 or 0:05:00'
                  style={{flex:1, background:'#0d1f35', border:'1px solid #1a3a5c', borderRadius:'16px', padding:'16px 20px', color:'#e8f4ff', fontSize:'16px', outline:'none'}}/>
                <button onClick={startTimer} style={{background:`linear-gradient(135deg, ${accent}, #1e6aa5)`, border:'none', borderRadius:'16px', padding:'16px 24px', color:'#e8f4ff', fontSize:'16px', fontWeight:'600', cursor:'pointer'}}>Start</button>
              </div>
            )}
            {(timerRunning || timerSeconds > 0) && !timerDone && (
              <div style={{textAlign:'center'}}>
                <div style={{fontSize:'72px', fontWeight:'700', fontVariantNumeric:'tabular-nums', color: timerSeconds < 10 ? '#f87171' : '#e8f4ff'}}>{formatTimer(timerSeconds)}</div>
                <div style={{display:'flex', gap:'12px', justifyContent:'center', marginTop:'16px'}}>
                  <button onClick={() => setTimerRunning(!timerRunning)} style={{background:'#0d1f35', border:`1px solid ${accent}`, borderRadius:'12px', padding:'10px 24px', color:accent, fontSize:'15px', cursor:'pointer'}}>
                    {timerRunning ? 'Pause' : 'Resume'}
                  </button>
                  <button onClick={() => { setTimerSeconds(0); setTimerRunning(false); setTimerDone(false) }} style={{background:'#0d1f35', border:'1px solid #1a3a5c', borderRadius:'12px', padding:'10px 24px', color:'#4a7fa5', fontSize:'15px', cursor:'pointer'}}>Reset</button>
                </div>
              </div>
            )}
            {timerDone && (
              <div style={{textAlign:'center'}}>
                <div style={{fontSize:'48px', marginBottom:'8px'}}>⏰</div>
                <div style={{fontSize:'24px', fontWeight:'700', color:'#e8f4ff'}}>Time is up.</div>
                <button onClick={() => { setTimerSeconds(0); setTimerDone(false) }} style={{marginTop:'16px', background:'#0d1f35', border:`1px solid ${accent}`, borderRadius:'12px', padding:'10px 24px', color:accent, fontSize:'15px', cursor:'pointer'}}>New timer</button>
              </div>
            )}
          </div>
        )}

        <div style={{borderTop:'1px solid #0d1f35', paddingTop:'16px', display:'flex', flexDirection:'column', gap:'12px'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <span style={{fontSize:'12px', color:'#1a3a5c'}}>HiveClock — by Hive</span>
            <button onClick={() => setShowSupport(!showSupport)} style={{background:'none', border:'none', color:'#2a5a7a', fontSize:'12px', cursor:'pointer', padding:0}}>
              {showSupport ? 'Close' : 'Support this engine'}
            </button>
          </div>
          {showSupport && (
            <div style={{background:'#0a1a2e', border:'1px solid #1a3a5c', borderRadius:'16px', padding:'20px', display:'flex', flexDirection:'column', gap:'12px'}}>
              <p style={{color:'#4a7fa5', fontSize:'13px', margin:0}}>HiveClock is free forever. If it saves you time, consider supporting it.</p>
              <div style={{display:'flex', gap:'8px', flexWrap:'wrap'}}>
                <a href='https://buy.stripe.com/14A6oJ6Mv3sReEa0YV0RG00' target='_blank' rel='noopener noreferrer' style={{background:'#0d1f35', border:'1px solid #1a3a5c', borderRadius:'10px', padding:'10px 16px', color:'#c8e0f0', fontSize:'13px', textDecoration:'none', fontWeight:'500'}}>$1.99 / month</a>
                <a href='https://buy.stripe.com/7sYcN79YHe7v53AcHD0RG01' target='_blank' rel='noopener noreferrer' style={{background:'#0d1f35', border:'1px solid #1a3a5c', borderRadius:'10px', padding:'10px 16px', color:'#c8e0f0', fontSize:'13px', textDecoration:'none', fontWeight:'500'}}>$19 / year</a>
                <a href='https://buy.stripe.com/9B6aEZ7Qzd3rcw2bDz0RG02' target='_blank' rel='noopener noreferrer' style={{background:'#0d1f35', border:'1px solid #1a3a5c', borderRadius:'10px', padding:'10px 16px', color:'#c8e0f0', fontSize:'13px', textDecoration:'none', fontWeight:'500'}}>$5 one-time</a>
              </div>
            </div>
          )}
        </div>

      </div>
    </main>
  )
}
