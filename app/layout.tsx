import type { Metadata, Viewport } from 'next'
import './globals.css'
import InstallPrompt from './components/InstallPrompt'

export const metadata: Metadata = {
  title: 'HiveClock',
  description: 'The world\'s most humane clock. By Hive.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'HiveClock',
  },
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
}

export const viewport: Viewport = {
  themeColor: '#060a14',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}


const NAV_STYLE = { fontSize: "11px", color: "rgba(180,200,225,0.55)", textDecoration: "none" };
const DOT = { color: "rgba(26,58,92,0.5)", fontSize: "11px" };

function HiveNav() {
  return (
    <header style={{ borderBottom: "1px solid rgba(13,31,53,0.7)", padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(2,4,8,0.6)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 50 }}>
      <a href="https://hive.baby" style={{ fontSize: "13px", fontWeight: 700, color: "rgba(212,175,55,0.75)", textDecoration: "none", letterSpacing: "-0.02em" }}>
        ← Hive
      </a>
      <nav style={{ display: "flex", gap: "14px", alignItems: "center" }}>
        <a href="https://hive.baby/about" style={NAV_STYLE}>About</a>
        <span style={DOT}>·</span>
        <a href="https://hive.baby/contribute" style={NAV_STYLE}>Contribute</a>
        <span style={DOT}>·</span>
        <a href="https://hive.baby/patrons" style={NAV_STYLE}>Patrons</a>
      </nav>
    </header>
  );
}

function HiveFooter() {
  return (
    <footer style={{ borderTop: "1px solid rgba(13,31,53,0.8)", padding: "20px 24px 32px", textAlign: "center" }}>
      <p style={{ fontSize: "11px", color: "rgba(26,58,92,0.5)", marginBottom: "14px", letterSpacing: "0.05em" }}>
        No ads. No investors. No agenda.
      </p>
      <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap", marginBottom: "14px" }}>
        <a href="https://buy.stripe.com/14A6oJ6Mv3sReEa0YV0RG00" target="_blank" rel="noopener noreferrer"
          style={{ fontSize: "11px", color: "rgba(212,175,55,0.5)", textDecoration: "none" }}>Support $1.99 / mo</a>
        <span style={DOT}>·</span>
        <a href="https://buy.stripe.com/7sYcN79YHe7v53AcHD0RG01" target="_blank" rel="noopener noreferrer"
          style={{ fontSize: "11px", color: "rgba(212,175,55,0.5)", textDecoration: "none" }}>$19 / year</a>
        <span style={DOT}>·</span>
        <a href="https://buy.stripe.com/9B6aEZ7Qzd3rcw2bDz0RG02" target="_blank" rel="noopener noreferrer"
          style={{ fontSize: "11px", color: "rgba(212,175,55,0.5)", textDecoration: "none" }}>$5 once</a>
      </div>
      <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap", marginBottom: "16px" }}>
        <a href="https://hive.baby/about" style={NAV_STYLE}>About</a>
        <span style={DOT}>·</span>
        <a href="https://hive.baby/contribute" style={NAV_STYLE}>Contribute</a>
        <span style={DOT}>·</span>
        <a href="https://hive.baby/patrons" style={NAV_STYLE}>Patrons</a>
        <span style={DOT}>·</span>
        <a href="https://hive.baby/privacy" style={NAV_STYLE}>Privacy</a>
      </div>
      <form action="https://hive.baby" method="get" style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
        <input name="q" type="text" placeholder="Find another engine…" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "6px", padding: "6px 12px", fontSize: "12px", color: "rgba(255,255,255,0.45)", outline: "none", width: "180px" }} />
        <button type="submit" style={{ background: "none", border: "1px solid rgba(212,175,55,0.25)", borderRadius: "6px", padding: "6px 10px", fontSize: "12px", color: "rgba(212,175,55,0.45)", cursor: "pointer" }}>→</button>
      </form>
    </footer>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <InstallPrompt />
        <HiveFooter />
      </body>
    </html>
  )
}
