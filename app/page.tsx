'use client'

import { useState, useEffect } from 'react'

const EXAMPLES = [
  'What time is it in Tokyo right now?',
  'How long until midnight?',
  'What time is sunset in London today?',
  'How many hours since noon?',
  'What time is it for my mum in Lagos?',
]

export default function HiveClock() {
  const [input, setInput] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [time, setTime] = useState('')
  const [date, setDate] = useState('')
  const [exampleIndex, setExampleIndex] = useState(0)
  const [timezone, setTimezone] = useState('')

  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    setTimezone(tz)
    const tick = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
      setDate(now.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))
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

  const handleAsk = async () => {
    if (!input.trim()) return
    setLoading(true)
    setAnswer('')
    try {
      const res = await fetch('/api/clock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, timezone })
      })
      const data = await res.json()
      setAnswer(data.answer || data.error)
    } catch {
      setAnswer('Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  return (
    <main style={{minHeight:'100vh', background:'#060a14', color:'#e8f4ff', fontFamily:'system-ui, sans-serif', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'40px 20px'}}>
      <div style={{width:'100%', maxWidth:'600px', display:'flex', flexDirection:'column', gap:'32px'}}>

        <div style={{textAlign:'center'}}>
          <div style={{fontSize:'72px', fontWeight:'700', letterSpacing:'-0.03em', color:'#e8f4ff', fontVariantNumeric:'tabular-nums'}}>{time}</div>
          <div style={{fontSize:'16px', color:'#4a7fa5', marginTop:'8px'}}>{date}</div>
          <div style={{fontSize:'13px', color:'#2a4a6a', marginTop:'4px'}}>{timezone}</div>
        </div>

        <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
          <div style={{position:'relative'}}>
            <input
              type='text'
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAsk()}
              placeholder={EXAMPLES[exampleIndex]}
              style={{width:'100%', background:'#0d1f35', border:'1px solid #1a3a5c', borderRadius:'16px', padding:'16px 20px', color:'#e8f4ff', fontSize:'16px', outline:'none', boxSizing:'border-box', transition:'border-color 0.2s'}}
              onFocus={e => e.target.style.borderColor = '#2a6aa5'}
              onBlur={e => e.target.style.borderColor = '#1a3a5c'}
            />
          </div>
          <button
            onClick={handleAsk}
            disabled={loading || !input.trim()}
            style={{background: loading || !input.trim() ? '#0d1f35' : 'linear-gradient(135deg, #1a4a7a, #1e6aa5)', border:'none', borderRadius:'16px', padding:'16px', color: loading || !input.trim() ? '#2a4a6a' : '#e8f4ff', fontSize:'16px', fontWeight:'600', cursor: loading || !input.trim() ? 'not-allowed' : 'pointer', transition:'all 0.2s'}}>
            {loading ? 'Thinking...' : 'Ask'}
          </button>
        </div>

        {answer && (
          <div style={{background:'#0a1a2e', border:'1px solid #1a3a5c', borderRadius:'16px', padding:'24px', display:'flex', flexDirection:'column', gap:'16px'}}>
            <p style={{color:'#c8e0f0', fontSize:'17px', lineHeight:'1.7', margin:0}}>{answer}</p>
            <button
              onClick={() => navigator.clipboard.writeText(answer)}
              style={{alignSelf:'flex-start', background:'none', border:'none', color:'#2a5a7a', fontSize:'13px', cursor:'pointer', padding:0}}>
              Copy
            </button>
          </div>
        )}

        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', borderTop:'1px solid #0d1f35', paddingTop:'16px'}}>
          <span style={{fontSize:'12px', color:'#1a3a5c'}}>HiveClock — by Hive</span>
          <a href='#support' style={{fontSize:'12px', color:'#2a5a7a', textDecoration:'none'}}>Support this engine</a>
        </div>

      </div>
    </main>
  )
}
