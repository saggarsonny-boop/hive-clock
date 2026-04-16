'use client'

import { useState, useEffect } from 'react'

const EXAMPLES = [
  'What time is it in Tokyo right now?',
  'How long until midnight?',
  'What time is sunset in London today?',
  'How many hours since noon?',
  'What time is it for my mum in Lagos?',
  'Quelle heure est-il à Paris?',
  'Wie lange bis Mitternacht?',
  '今は東京で何時ですか?',
]

const PET_MOODS = ['🐝', '🌙', '⏰', '🌅', '🕰️']

export default function HiveClock() {
  const [input, setInput] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [time, setTime] = useState('')
  const [date, setDate] = useState('')
  const [exampleIndex, setExampleIndex] = useState(0)
  const [petMood, setPetMood] = useState('🐝')
  const [timezone, setTimezone] = useState('')
  const [showSupport, setShowSupport] = useState(false)
  const [suggestion, setSuggestion] = useState('')

  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    setTimezone(tz)
    const tick = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
      setDate(now.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))
      const hour = now.getHours()
      if (hour >= 5 && hour < 12) setPetMood('🌅')
      else if (hour >= 12 && hour < 17) setPetMood('☀️')
      else if (hour >= 17 && hour < 21) setPetMood('🌆')
      else setPetMood('🌙')
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setExampleIndex(i => (i + 1) % EXAMPLES.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const anticipate = (query: string) => {
    const q = query.toLowerCase()
    if (q.includes('tokyo') || q.includes('japan')) setSuggestion('What time is it in Osaka?')
    else if (q.includes('sunset')) setSuggestion('What time is sunrise tomorrow?')
    else if (q.includes('midnight')) setSuggestion('How many hours until dawn?')
    else if (q.includes('london')) setSuggestion('What time is it in New York?')
    else setSuggestion('')
  }

  const handleAsk = async () => {
    if (!input.trim()) return
    setLoading(true)
    setAnswer('')
    setSuggestion('')
    try {
      const res = await fetch('/api/clock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, timezone })
      })
      const data = await res.json()
      setAnswer(data.answer || data.error)
      anticipate(input)
    } catch {
      setAnswer('Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  return (
    <main style={{minHeight:'100vh', background:'#060a14', color:'#e8f4ff', fontFamily:'system-ui, sans-serif', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'40px 20px'}}>
      <div style={{width:'100%', maxWidth:'600px', display:'flex', flexDirection:'column', gap:'24px'}}>

        <div style={{textAlign:'center'}}>
          <div style={{fontSize:'13px', color:'#2a4a6a', marginBottom:'8px'}}>{petMood} your time companion</div>
          <div style={{fontSize:'72px', fontWeight:'700', letterSpacing:'-0.03em', color:'#e8f4ff', fontVariantNumeric:'tabular-nums'}}>{time}</div>
          <div style={{fontSize:'16px', color:'#4a7fa5', marginTop:'8px'}}>{date}</div>
          <div style={{fontSize:'13px', color:'#2a4a6a', marginTop:'4px'}}>{timezone}</div>
        </div>

        <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
          <input
            type='text'
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAsk()}
            placeholder={EXAMPLES[exampleIndex]}
            style={{width:'100%', background:'#0d1f35', border:'1px solid #1a3a5c', borderRadius:'16px', padding:'16px 20px', color:'#e8f4ff', fontSize:'16px', outline:'none', boxSizing:'border-box'}}
          />
          <button
            onClick={handleAsk}
            disabled={loading || !input.trim()}
            style={{background: loading || !input.trim() ? '#0d1f35' : 'linear-gradient(135deg, #1a4a7a, #1e6aa5)', border:'none', borderRadius:'16px', padding:'16px', color: loading || !input.trim() ? '#2a4a6a' : '#e8f4ff', fontSize:'16px', fontWeight:'600', cursor: loading || !input.trim() ? 'not-allowed' : 'pointer'}}>
            {loading ? 'Thinking...' : 'Ask'}
          </button>
        </div>

        {answer && (
          <div style={{background:'#0a1a2e', border:'1px solid #1a3a5c', borderRadius:'16px', padding:'24px', display:'flex', flexDirection:'column', gap:'12px'}}>
            <p style={{color:'#c8e0f0', fontSize:'17px', lineHeight:'1.7', margin:0}}>{answer}</p>
            <div style={{display:'flex', gap:'12px', alignItems:'center'}}>
              <button onClick={() => navigator.clipboard.writeText(answer)} style={{background:'none', border:'none', color:'#2a5a7a', fontSize:'13px', cursor:'pointer', padding:0}}>Copy</button>
              {suggestion && (
                <button onClick={() => { setInput(suggestion); setAnswer('') }} style={{background:'none', border:'1px solid #1a3a5c', borderRadius:'8px', color:'#4a7fa5', fontSize:'12px', cursor:'pointer', padding:'4px 10px'}}>
                  Try: {suggestion}
                </button>
              )}
            </div>
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
                <a href='https://buy.stripe.com/14A6oJ6Mv3sReEa0YV0RG00' target='_blank' rel='noopener noreferrer'
                  style={{background:'#0d1f35', border:'1px solid #1a3a5c', borderRadius:'10px', padding:'10px 16px', color:'#c8e0f0', fontSize:'13px', textDecoration:'none', fontWeight:'500'}}>
                  $1.99 / month
                </a>
                <a href='https://buy.stripe.com/7sYcN79YHe7v53AcHD0RG01' target='_blank' rel='noopener noreferrer'
                  style={{background:'#0d1f35', border:'1px solid #1a3a5c', borderRadius:'10px', padding:'10px 16px', color:'#c8e0f0', fontSize:'13px', textDecoration:'none', fontWeight:'500'}}>
                  $19 / year
                </a>
                <a href='https://buy.stripe.com/9B6aEZ7Qzd3rcw2bDz0RG02' target='_blank' rel='noopener noreferrer'
                  style={{background:'#0d1f35', border:'1px solid #1a3a5c', borderRadius:'10px', padding:'10px 16px', color:'#c8e0f0', fontSize:'13px', textDecoration:'none', fontWeight:'500'}}>
                  $5 one-time
                </a>
              </div>
            </div>
          )}
        </div>

      </div>
    </main>
  )
}
