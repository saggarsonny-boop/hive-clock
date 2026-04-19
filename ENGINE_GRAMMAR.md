# ENGINE_GRAMMAR — HiveClock

<GrapplerHook>
engine: HiveClock
version: 1.0.0
governance: QueenBee.MasterGrappler
safety: enabled
multilingual: pending
premium: false
</GrapplerHook>

## Engine Identity
- **Name:** HiveClock
- **Domain:** hiveclock.hive.baby
- **Repo:** saggarsonny-boop/hive-clock
- **Status:** Live
- **Stack:** Next.js + TypeScript + Anthropic SDK (claude-opus-4-5)

## Purpose
The world's most humane clock. Analog and digital time display, AI-generated human faces showing time through expression and pose, world time zones, prayer times, and time-based reflections. Time is not just a number — it's a moment.

## Inputs
- Current time (auto, from device)
- Location (optional, for prayer times and local sunrise/sunset)
- World city selection (for world time)

## Outputs
- Analog clock face
- Digital time display
- AI-generated face reflecting the time of day (morning, afternoon, evening, night)
- World time for selected cities
- Prayer times (if location provided)
- Time-based ambient reflection (optional)

## Modes
- **Standard:** Analog + digital, current local time
- **World:** Multi-timezone display
- **Prayer:** Fajr, Dhuhr, Asr, Maghrib, Isha for location
- **Portrait:** AI face matching the hour's mood

## Reasoning Steps
1. Read device time
2. Select face/expression appropriate to time of day and season
3. Calculate prayer times from latitude/longitude using standard algorithms
4. Display world times for requested cities
5. Generate ambient reflection if requested

## Safety Templates
- Prayer times are estimates — always defer to local mosque/authority for precision
- No religious rulings or fatwa; times only

## Multilingual Ribbon
- Status: pending (high priority — prayer times engine has global Muslim audience)
- Target: Arabic, Urdu, Turkish, Malay, Indonesian, French, English minimum
- MLLR integration: post-QB deployment

## Premium Locks
- None currently. Future Pro: custom face styles, alarm integration, world clock wallpaper export.

## Governance Inheritance
- Governed by: QueenBee.MasterGrappler (pending)
- Safety level: standard
- Output schema: time-response
- Tone: warm

## API Model Strings
- Primary: `claude-opus-4-5`

## Deployment Notes
- Vercel: auto-deploy on push to main
- Domain: hiveclock.hive.baby → Cloudflare CNAME → cname.vercel-dns.com
- Deployment Protection: OFF
