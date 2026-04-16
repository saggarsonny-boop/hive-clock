'use client'

import { useState, useEffect, useRef } from 'react'

const EXAMPLES = [
  'What time is it in Tokyo right now?',
  'How long until midnight?',
  'Wie lange bis Mitternacht?',
  'What time is sunset in London today?',
  '今は東京で何時ですか?',
  'Should I sleep now?',
  'Quelle heure est-il à Paris?',
  'كم الساعة الآن في دبي؟',
]

const ALL_CITIES = [
  { name: 'London', tz: 'Europe/London' },
  { name: 'New York', tz: 'America/New_York' },
  { name: 'Tokyo', tz: 'Asia/Tokyo' },
  { name: 'Dubai', tz: 'Asia/Dubai' },
  { name: 'Sydney', tz: 'Australia/Sydney' },
  { name: 'Paris', tz: 'Europe/Paris' },
  { name: 'Mumbai', tz: 'Asia/Kolkata' },
  { name: 'Lagos', tz: 'Africa/Lagos' },
  { name: 'São Paulo', tz: 'America/Sao_Paulo' },
  { name: 'Los Angeles', tz: 'America/Los_Angeles' },
  { name: 'Chicago', tz: 'America/Chicago' },
  { name: 'Singapore', tz: 'Asia/Singapore' },
]

const MOON_PHASES = ['🌑','🌒','🌓','🌔','🌕','🌖','🌗','🌘']

function getMoonPhase() {
  const now = new Date()
  const known = new Date(2000, 0, 6)
  const diff = (now.getTime() - known.getTime()) / (1000 * 60 * 60 * 24)
  const cycle = diff % 29.53
  return MOON_PHASES[Math.floor(cycle / 29.53 * 8)]
}

function AnalogClock({ time, accent, faceImage }: { time: Date, accent: string, faceImage: string }) {
  const h = ((time.getHours() % 12) + time.getMinutes() / 60) * 30
  const m = (time.getMinutes() + time.getSeconds() / 60) * 6
  const s = time.getSeconds() * 6
  return (
    <div style={{position:'relative', width:'200px', height:'200px', margin:'0 auto'}}>
      <div style={{position:'absolute', inset:0, borderRadius:'50%', border:`3px solid ${accent}`, background: faceImage ? `url(${faceImage}) center/cover` : '#0a1a2e', overflow:'hidden'}}>
        {!faceImage && Array.from({length:12},(_,i) => (
          <div key={i} style={{position:'absolute', width:'2px', height:'10px', background:accent, left:'50%', top:'8px', transformOrigin:'1px 92px', transform:`rotate(${i*30}deg)`, marginLeft:'-1px'}}/>
        ))}
      </div>
      <div style={{position:'absolute', width:'3px', height:'60px', background:'#e8f4ff', left:'50%', top:'40px', transformOrigin:'1.5px 60px', transform:`rotate(${h}deg)`, marginLeft:'-1.5px', borderRadius:'2px'}}/>
      <div style={{position:'absolute', width:'2px', height:'75px', background:accent, left:'50%', top:'25px', transformOrigin:'1px 75px', transform:`rotate(${m}deg)`, marginLeft:'-1px', borderRadius:'2px'}}/>
      <div style={{position:'absolute', width:'1px', height:'80px', background:'#f87171', left:'50%', top:'20px', transformOrigin:'0.5px 80px', transform:`rotate(${s}deg)`, marginLeft:'-0.5px'}}/>
      <div style={{position:'absolute', width:'8px', height:'8px', background:accent, borderRadius:'50%', left:'50%', top:'50%', transform:'translate(-50%,-50%)'}}/>
    </div>
  )
}

export default function HiveClock() {
  const [now, setNow] = useState(new Date())
  const [input, setInput] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [exampleIndex, setExampleIndex] = useState(0)
  const [timezone, setTimezone] = useState('UTC')
  const [showSupport, setShowSupport] = useState(false)
  const [tab, setTab] = useState<'clock'|'world'|'timer'|'face'>('clock')
  const [is24h, setIs24h] = useState(false)
  const [isAnalog, setIsAnalog] = useState(false)
  const [worldCities, setWorldCities] = useState(ALL_CITIES.slice(0,6))
  const [showCityPicker, setShowCityPicker] = useState(false)
  const [worldTimes, setWorldTimes] = useState<{name:string,time:string,period:string}[]>([])
  const [timerInput, setTimerInput] = useState('')
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [timerRunning, setTimerRunning] = useState(false)
  const [timerDone, setTimerDone] = useState(false)
  const [dayPercent, setDayPercent] = useState(0)
  const [mode, setMode] = useState<'day'|'wind'|'wake'>('day')
  const [sunrise, setSunrise] = useState('')
  const [sunset, setSunset] = useState('')
  const [facePrompt, setFacePrompt] = useState('')
  const [faceImage, setFaceImage] = useState('')
  const [faceLoading, setFaceLoading] = useState(false)
  const [suggestion, setSuggestion] = useState('')
  const [microRitual, setMicroRitual] = useState('')
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

  const getMicroRitual = () => {
    const hour = now.getHours()
    if (hour >= 5 && hour < 9) return 'Morning light. One breath before the day begins.'
    if (hour >= 9 && hour < 12) return 'The day is moving. You are in it.'
    if (hour >= 12 && hour < 14) return 'Midday. A moment to reset.'
    if (hour >= 14 && hour < 17) return 'Afternoon. Steady on.'
    if (hour >= 17 && hour < 20) return 'The day is winding. You made it this far.'
    if (hour >= 20 && hour < 23) return 'Evening. Let the day go.'
    return 'Late night. The world is quiet. So can you be.'
  }

  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    setTimezone(tz)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        fetch('/api/suntime', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({lat:pos.coords.latitude, lon:pos.coords.longitude}) })
          .then(r=>r.json()).then(d=>{ if(d.sunrise){ setSunrise(d.sunrise); setSunset(d.sunset) } })
      })
    }
    setMicroRitual(getMicroRitual())
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      const n = new Date()
      setNow(n)
      const pct = (n.getHours()*3600 + n.getMinutes()*60 + n.getSeconds()) / 86400 * 100
      setDayPercent(pct)
      const hour = n.getHours()
      if (hour >= 21 || hour < 6) setMode('wind')
      else if (hour >= 6 && hour < 9) setMode('wake')
      else setMode('day')
      setWorldTimes(worldCities.map(c => ({
        name: c.name,
        time: n.toLocaleTimeString('en-US', { timeZone: c.tz, hour:'2-digit', minute:'2-digit', hour12: !is24h }),
        period: (() => { const h = parseInt(n.toLocaleTimeString('en-US',{timeZone:c.tz,hour:'numeric',hour12:false})); return h>=6&&h<22?'day':'night' })()
      })))
    }, 1000)
    return () => clearInterval(interval)
  }, [worldCities, is24h])

  useEffect(() => {
    const interval = setInterval(() => setExampleIndex(i => (i+1) % EXAMPLES.length), 3000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (timerRunning && timerSeconds > 0) {
      timerRef.current = setTimeout(() => setTimerSeconds(s=>s-1), 1000)
    } else if (timerRunning && timerSeconds === 0) {
      setTimerRunning(false); setTimerDone(true)
    }
    return () => { if(timerRef.current) clearTimeout(timerRef.current) }
  }, [timerRunning, timerSeconds])

  const formatTime = (d: Date) => d.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit', second:'2-digit', hour12: !is24h })
  const formatDate = (d: Date) => d.toLocaleDateString([], { weekday:'long', year:'numeric', month:'long', day:'numeric' })
  const formatTimer = (s: number) => { const h=Math.floor(s/3600); const m=Math.floor((s%3600)/60); const sec=s%60; return h>0?`${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`:`${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}` }

  const startTimer = () => {
    const parts = timerInput.trim().split(':')
    let secs = 0
    if (parts.length===2) secs=parseInt(parts[0])*60+parseInt(parts[1])
    else if (parts.length===3) secs=parseInt(parts[0])*3600+parseInt(parts[1])*60+parseInt(parts[2])
    else secs=parseInt(timerInput)*60
    if (secs>0) { setTimerSeconds(secs); setTimerRunning(true); setTimerDone(false) }
  }

  const anticipate = (q: string) => {
    const ql = q.toLowerCase()
    if (ql.includes('tokyo')||ql.includes('japan')) setSuggestion('What time is it in Osaka?')
    else if (ql.includes('sunset')) setSuggestion('What time is sunrise tomorrow?')
    else if (ql.includes('midnight')) setSuggestion('How many hours until dawn?')
    else if (ql.includes('london')) setSuggestion('What time is it in New York?')
    else setSuggestion('')
  }

  const handleAsk = async () => {
    if (!input.trim()) return
    setLoading(true); setAnswer(''); setSuggestion('')
    try {
      const res = await fetch('/api/clock', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({input, timezone}) })
      const data = await res.json()
      setAnswer(data.answer || data.error)
      anticipate(input)
    } catch { setAnswer('Something went wrong.') }
    setLoading(false)
  }

  const handleGenerateFace = async () => {
    if (!facePrompt.trim()) return
    setFaceLoading(true); setFaceImage('')
    try {
      const res = await fetch('/api/clockface', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({prompt: facePrompt}) })
      const data = await res.json()
      if (data.imageUrl) setFaceImage(data.imageUrl)
      else setFaceImage('')
    } catch { }
    setFaceLoading(false)
  }

  const accent = getAccent()

  return (
    <main style={{minHeight:'100vh', background:getBg(), color:'#e8f4ff', fontFamily:'system-ui, sans-serif', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'40px 20px', transition:'background 2s'}}>
      <div style={{width:'100%', maxWidth:'620px', display:'flex', flexDirection:'column', gap:'20px'}}>

        <div style={{textAlign:'center'}}>
          <div style={{fontSize:'12px', color:accent, marginBottom:'8px'}}>
            {mode==='wind'?'🌙 wind down':mode==='wake'?'🌅 wake up':'🐝 your time companion'} · {getMoonPhase()} · {sunrise&&`☀️ ${sunrise} — ${sunset}`}
          </div>

          {isAnalog
            ? <AnalogClock time={now} accent={accent} faceImage={faceImage} />
            : <div style={{fontSize:'clamp(48px,12vw,80px)', fontWeight:'700', letterSpacing:'-0.03em', fontVariantNumeric:'tabular-nums'}}>{formatTime(now)}</div>
          }

          <div style={{fontSize:'15px', color:accent, marginTop:'8px'}}>{formatDate(now)}</div>
          <div style={{fontSize:'12px', color:'#2a4a6a', marginTop:'2px'}}>{timezone}</div>

          <div style={{display:'flex', gap:'8px', justifyContent:'center', marginTop:'10px'}}>
            <button onClick={()=>setIsAnalog(!isAnalog)} style={{background:'none', border:`1px solid #1a3a5c`, borderRadius:'20px', padding:'4px 12px', color:accent, fontSize:'12px', cursor:'pointer'}}>
              {isAnalog ? 'Digital' : 'Analog'}
            </button>
            <button onClick={()=>setIs24h(!is24h)} style={{background:'none', border:`1px solid #1a3a5c`, borderRadius:'20px', padding:'4px 12px', color:accent, fontSize:'12px', cursor:'pointer'}}>
              {is24h ? '12h' : '24h'}
            </button>
          </div>

          <div style={{marginTop:'12px', background:'#0d1a2a', borderRadius:'8px', height:'5px', overflow:'hidden'}}>
            <div style={{height:'100%', width:`${dayPercent}%`, background:`linear-gradient(90deg, ${accent}, #e8f4ff)`, borderRadius:'8px', transition:'width 1s'}}/>
          </div>
          <div style={{display:'flex', justifyContent:'space-between', fontSize:'10px', color:'#1a3a5c', marginTop:'3px'}}>
            <span>midnight</span><span>noon</span><span>midnight</span>
          </div>

          <div style={{marginTop:'10px', fontSize:'13px', color:'#2a5a7a', fontStyle:'italic'}}>{microRitual}</div>
        </div>

        <div style={{display:'flex', gap:'6px', justifyContent:'center', flexWrap:'wrap'}}>
          {(['clock','world','timer','face'] as const).map(t => (
            <button key={t} onClick={()=>setTab(t)} style={{padding:'6px 14px', borderRadius:'20px', border:'none', background:tab===t?accent:'#0d1f35', color:tab===t?'#fff':'#4a7fa5', fontSize:'13px', cursor:'pointer', fontWeight:tab===t?'600':'400'}}>
              {t==='clock'?'🕐 Ask':t==='world'?'🌍 World':t==='timer'?'⏱ Timer':'🎨 Face'}
            </button>
          ))}
        </div>

        {tab==='clock' && (
          <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
            <div style={{fontSize:'12px', color:'#2a4a6a', textAlign:'center'}}>Ask in any language — try: "¿Qué hora es en Buenos Aires?" or "몇 시예요?"</div>
            <input type='text' value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleAsk()} placeholder={EXAMPLES[exampleIndex]}
              style={{width:'100%', background:'#0d1f35', border:`1px solid #1a3a5c`, borderRadius:'16px', padding:'16px 20px', color:'#e8f4ff', fontSize:'16px', outline:'none', boxSizing:'border-box'}}/>
            <button onClick={handleAsk} disabled={loading||!input.trim()} style={{background:loading||!input.trim()?'#0d1f35':`linear-gradient(135deg, ${accent}, #1e6aa5)`, border:'none', borderRadius:'16px', padding:'16px', color:loading||!input.trim()?'#2a4a6a':'#e8f4ff', fontSize:'16px', fontWeight:'600', cursor:loading||!input.trim()?'not-allowed':'pointer'}}>
              {loading?'Thinking...':'Ask'}
            </button>
            {answer && (
              <div style={{background:'#0a1a2e', border:`1px solid #1a3a5c`, borderRadius:'16px', padding:'24px', display:'flex', flexDirection:'column', gap:'12px'}}>
                <p style={{color:'#c8e0f0', fontSize:'17px', lineHeight:'1.7', margin:0}}>{answer}</p>
                <div style={{display:'flex', gap:'12px', alignItems:'center'}}>
                  <button onClick={()=>navigator.clipboard.writeText(answer)} style={{background:'none', border:'none', color:'#2a5a7a', fontSize:'13px', cursor:'pointer', padding:0}}>Copy</button>
                  {suggestion && <button onClick={()=>{setInput(suggestion);setAnswer('')}} style={{background:'none', border:`1px solid #1a3a5c`, borderRadius:'8px', color:accent, fontSize:'12px', cursor:'pointer', padding:'4px 10px'}}>Try: {suggestion}</button>}
                </div>
              </div>
            )}
          </div>
        )}

        {tab==='world' && (
          <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px'}}>
              {worldTimes.map(c => (
                <div key={c.name} style={{background:'#0a1a2e', border:'1px solid #1a3a5c', borderRadius:'14px', padding:'14px 18px'}}>
                  <div style={{fontSize:'12px', color:'#2a5a7a', marginBottom:'4px'}}>{c.period==='night'?'🌙':'☀️'} {c.name}</div>
                  <div style={{fontSize:'26px', fontWeight:'700', fontVariantNumeric:'tabular-nums'}}>{c.time}</div>
                </div>
              ))}
            </div>
            <button onClick={()=>setShowCityPicker(!showCityPicker)} style={{background:'none', border:`1px solid #1a3a5c`, borderRadius:'12px', padding:'10px', color:accent, fontSize:'13px', cursor:'pointer'}}>
              {showCityPicker ? 'Close' : 'Customise cities'}
            </button>
            {showCityPicker && (
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px'}}>
                {ALL_CITIES.map(c => {
                  const selected = worldCities.some(w=>w.name===c.name)
                  return (
                    <button key={c.name} onClick={()=>{
                      if (selected) setWorldCities(prev=>prev.filter(w=>w.name!==c.name))
                      else if (worldCities.length<6) setWorldCities(prev=>[...prev,c])
                    }} style={{background:selected?accent:'#0a1a2e', border:`1px solid ${selected?accent:'#1a3a5c'}`, borderRadius:'10px', padding:'8px 12px', color:selected?'#fff':'#4a7fa5', fontSize:'13px', cursor:'pointer'}}>
                      {c.name}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {tab==='timer' && (
          <div style={{display:'flex', flexDirection:'column', gap:'16px', alignItems:'center'}}>
            {!timerRunning && timerSeconds===0 && !timerDone && (
              <div style={{display:'flex', gap:'8px', width:'100%'}}>
                <input type='text' value={timerInput} onChange={e=>setTimerInput(e.target.value)} placeholder='5 (mins) or 1:30 or 0:05:00'
                  style={{flex:1, background:'#0d1f35', border:'1px solid #1a3a5c', borderRadius:'16px', padding:'16px 20px', color:'#e8f4ff', fontSize:'16px', outline:'none'}}/>
                <button onClick={startTimer} style={{background:`linear-gradient(135deg, ${accent}, #1e6aa5)`, border:'none', borderRadius:'16px', padding:'16px 20px', color:'#e8f4ff', fontSize:'16px', fontWeight:'600', cursor:'pointer'}}>Start</button>
              </div>
            )}
            {(timerRunning||timerSeconds>0) && !timerDone && (
              <div style={{textAlign:'center'}}>
                <div style={{fontSize:'72px', fontWeight:'700', fontVariantNumeric:'tabular-nums', color:timerSeconds<10?'#f87171':'#e8f4ff'}}>{formatTimer(timerSeconds)}</div>
                <div style={{display:'flex', gap:'12px', justifyContent:'center', marginTop:'16px'}}>
                  <button onClick={()=>setTimerRunning(!timerRunning)} style={{background:'#0d1f35', border:`1px solid ${accent}`, borderRadius:'12px', padding:'10px 24px', color:accent, fontSize:'15px', cursor:'pointer'}}>{timerRunning?'Pause':'Resume'}</button>
                  <button onClick={()=>{setTimerSeconds(0);setTimerRunning(false);setTimerDone(false)}} style={{background:'#0d1f35', border:'1px solid #1a3a5c', borderRadius:'12px', padding:'10px 24px', color:'#4a7fa5', fontSize:'15px', cursor:'pointer'}}>Reset</button>
                </div>
              </div>
            )}
            {timerDone && (
              <div style={{textAlign:'center'}}>
                <div style={{fontSize:'48px', marginBottom:'8px'}}>⏰</div>
                <div style={{fontSize:'24px', fontWeight:'700'}}>Time is up.</div>
                <button onClick={()=>{setTimerSeconds(0);setTimerDone(false)}} style={{marginTop:'16px', background:'#0d1f35', border:`1px solid ${accent}`, borderRadius:'12px', padding:'10px 24px', color:accent, fontSize:'15px', cursor:'pointer'}}>New timer</button>
              </div>
            )}
          </div>
        )}

        {tab==='face' && (
          <div style={{display:'flex', flexDirection:'column', gap:'16px'}}>
            <div style={{fontSize:'13px', color:'#2a5a7a', textAlign:'center'}}>Describe your dream clock face. AI will generate it.</div>
            <div style={{fontSize:'12px', color:'#1a3a5c', textAlign:'center'}}>Try: "minimalist Japanese ink" · "cosmic nebula" · "Art Deco gold" · "underwater coral reef"</div>
            <input type='text' value={facePrompt} onChange={e=>setFacePrompt(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleGenerateFace()} placeholder='Describe your clock face...'
              style={{width:'100%', background:'#0d1f35', border:`1px solid #1a3a5c`, borderRadius:'16px', padding:'16px 20px', color:'#e8f4ff', fontSize:'16px', outline:'none', boxSizing:'border-box'}}/>
            <button onClick={handleGenerateFace} disabled={faceLoading||!facePrompt.trim()} style={{background:faceLoading||!facePrompt.trim()?'#0d1f35':`linear-gradient(135deg, ${accent}, #1e6aa5)`, border:'none', borderRadius:'16px', padding:'16px', color:faceLoading||!facePrompt.trim()?'#2a4a6a':'#e8f4ff', fontSize:'16px', fontWeight:'600', cursor:faceLoading||!facePrompt.trim()?'not-allowed':'pointer'}}>
              {faceLoading?'Generating your clock face...':'Generate face'}
            </button>
            {faceImage && (
              <div style={{display:'flex', flexDirection:'column', gap:'12px', alignItems:'center'}}>
                <img src={faceImage} alt='Generated clock face' style={{width:'100%', maxWidth:'300px', borderRadius:'50%', border:`3px solid ${accent}`}}/>
                <button onClick={()=>setIsAnalog(true)} style={{background:`linear-gradient(135deg, ${accent}, #1e6aa5)`, border:'none', borderRadius:'12px', padding:'10px 24px', color:'#e8f4ff', fontSize:'14px', cursor:'pointer'}}>Apply to analog clock</button>
                <button onClick={()=>setFaceImage('')} style={{background:'none', border:'none', color:'#2a5a7a', fontSize:'13px', cursor:'pointer'}}>Clear</button>
              </div>
            )}
          </div>
        )}

        <div style={{borderTop:'1px solid #0d1f35', paddingTop:'16px', display:'flex', flexDirection:'column', gap:'12px'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <span style={{fontSize:'12px', color:'#1a3a5c'}}>HiveClock — by Hive</span>
            <div style={{display:'flex', gap:'12px'}}>
              <a href='#' style={{fontSize:'12px', color:'#1a3a5c', textDecoration:'none'}}>Try HiveWeather →</a>
              <button onClick={()=>setShowSupport(!showSupport)} style={{background:'none', border:'none', color:'#2a5a7a', fontSize:'12px', cursor:'pointer', padding:0}}>{showSupport?'Close':'Support this engine'}</button>
            </div>
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
