'use client'

import { useState, useEffect } from 'react'

export default function InstallPrompt() {
  const [show, setShow] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isAndroid, setIsAndroid] = useState(false)

  useEffect(() => {
    const dismissed = localStorage.getItem('hc_install_dismissed')
    if (dismissed) return
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent)
    const android = /android/i.test(navigator.userAgent)
    const installed = window.matchMedia('(display-mode: standalone)').matches
    setIsIOS(ios)
    setIsAndroid(android)
    if (!installed && (ios || android)) {
      const timer = setTimeout(() => setShow(true), 30000)
      return () => clearTimeout(timer)
    }
  }, [])

  const dismiss = () => {
    localStorage.setItem('hc_install_dismissed', 'true')
    setShow(false)
  }

  if (!show) return null

  return (
    <div style={{position:'fixed', bottom:'20px', left:'50%', transform:'translateX(-50%)', width:'calc(100% - 40px)', maxWidth:'580px', background:'#0a1a2e', border:'1px solid #1a3a5c', borderRadius:'16px', padding:'16px 20px', display:'flex', justifyContent:'space-between', alignItems:'center', gap:'16px', zIndex:1000, boxShadow:'0 8px 32px rgba(0,0,0,0.4)'}}>
      <div style={{display:'flex', flexDirection:'column', gap:'4px'}}>
        <span style={{color:'#c8e0f0', fontSize:'14px', fontWeight:'600'}}>Add HiveClock to your home screen</span>
        {isIOS && <span style={{color:'#4a7fa5', fontSize:'12px'}}>Tap Share ↑ then Add to Home Screen</span>}
        {isAndroid && <span style={{color:'#4a7fa5', fontSize:'12px'}}>Tap menu then Add to Home Screen</span>}
      </div>
      <button onClick={dismiss} style={{background:'none', border:'none', color:'#2a5a7a', fontSize:'20px', cursor:'pointer', padding:'4px', flexShrink:0}}>×</button>
    </div>
  )
}
