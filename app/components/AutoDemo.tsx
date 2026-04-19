'use client'
import { useEffect, useState, useRef } from 'react'

const DEMO_KEY = 'hive_demo_clock'
const DEMO_INPUT = 'What time is Fajr in London today?'
const DEMO_OUTPUT = 'Fajr 04:12 · Sunrise 06:08 · Dhuhr 13:06 · Asr 16:47 · Maghrib 20:23 · Isha 22:05 · London · Based on your date and location.'

export default function AutoDemo() {
  const [phase, setPhase] = useState<'hidden'|'typing'|'result'|'fading'>('hidden')
  const [typed, setTyped] = useState('')
  const mounted = useRef(false)

  useEffect(() => {
    if (mounted.current) return
    mounted.current = true
    if (typeof window === 'undefined') return
    if (localStorage.getItem(DEMO_KEY)) return
    const t = setTimeout(() => {
      setPhase('typing')
      let i = 0
      const ti = setInterval(() => {
        i++; setTyped(DEMO_INPUT.slice(0, i))
        if (i >= DEMO_INPUT.length) {
          clearInterval(ti)
          setTimeout(() => {
            setPhase('result')
            setTimeout(() => {
              setPhase('fading')
              setTimeout(() => { setPhase('hidden'); localStorage.setItem(DEMO_KEY,'1') }, 600)
            }, 8000)
          }, 400)
        }
      }, 48)
    }, 1200)
    return () => clearTimeout(t)
  }, [])

  if (phase === 'hidden') return null
  const dismiss = () => { setPhase('fading'); setTimeout(() => { setPhase('hidden'); localStorage.setItem(DEMO_KEY,'1') }, 600) }

  return (
    <div onClick={dismiss} style={{ position:'fixed',inset:0,zIndex:100,background:'rgba(3,7,18,0.88)',backdropFilter:'blur(8px)',display:'flex',alignItems:'center',justifyContent:'center',padding:'24px',opacity:phase==='fading'?0:1,transition:'opacity 0.6s',pointerEvents:phase==='fading'?'none':'auto' }}>
      <div onClick={e=>e.stopPropagation()} style={{ width:'100%',maxWidth:'480px',display:'flex',flexDirection:'column',gap:'14px' }}>
        <div style={{ fontSize:'11px',letterSpacing:'0.12em',textTransform:'uppercase',color:'rgba(251,191,36,0.45)',textAlign:'center' }}>Here's how it works</div>
        <div style={{ background:'rgba(17,24,39,0.95)',border:'1px solid rgba(107,114,128,0.4)',borderRadius:'10px',padding:'14px 16px',fontSize:'15px',color:'#f9fafb',minHeight:'50px' }}>
          {typed || <span style={{color:'rgba(107,114,128,0.6)'}}>What time is Fajr in London today?</span>}
          {phase==='typing' && <span style={{ display:'inline-block',width:'2px',height:'15px',background:'#fbbf24',marginLeft:'1px',verticalAlign:'middle',animation:'blink 0.7s step-end infinite' }}/>}
        </div>
        {phase==='result' && (
          <div style={{ background:'rgba(17,24,39,0.95)',border:'1px solid rgba(107,114,128,0.25)',borderRadius:'12px',padding:'20px 22px',fontSize:'15px',color:'#e5e7eb',lineHeight:'1.7',animation:'demoIn 0.4s ease' }}>
            {DEMO_OUTPUT}
          </div>
        )}
        <button onClick={dismiss} style={{ alignSelf:'center',background:'none',border:'1px solid rgba(107,114,128,0.3)',borderRadius:'100px',padding:'8px 24px',color:'rgba(107,114,128,0.6)',fontSize:'12px',fontFamily:'inherit',cursor:'pointer' }}>Got it — let me try</button>
      </div>
      <style>{`@keyframes demoIn{from{transform:translateY(14px);opacity:0}to{transform:translateY(0);opacity:1}}@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>
    </div>
  )
}
