/* eslint-disable react-refresh/only-export-components -- pure helpers co-located with overlay component */

export function infectionTintOpacity(infection: number): number {
  const clamped = Math.min(Math.max(infection, 2), 10)
  return ((clamped - 2) / 8) * 0.5
}

export function baseVignetteColor(hoursFromStart: number): string {
  return hoursFromStart < 0 ? 'rgba(10, 18, 35, 0.55)' : 'rgba(0, 0, 0, 0.55)'
}

interface Props {
  hoursFromStart: number
  infection: number
  danger?: boolean
}

export default function AmbientOverlay({ hoursFromStart, infection, danger }: Props) {
  return (
    <>
      <div
        className="pointer-events-none fixed inset-0 z-[1] opacity-[0.04]"
        aria-hidden
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px',
        }}
      />
      <div
        className="pointer-events-none fixed inset-0 z-[1]"
        aria-hidden
        style={{
          background: `radial-gradient(ellipse 85% 75% at 50% 45%, transparent 35%, ${baseVignetteColor(hoursFromStart)} 100%)`,
          transition: 'background 2s ease',
        }}
      />
      <div
        className="pointer-events-none fixed inset-0 z-[1]"
        aria-hidden
        style={{
          background: `radial-gradient(ellipse 85% 75% at 50% 45%, transparent 25%, rgba(50, 10, 55, ${infectionTintOpacity(infection)}) 100%)`,
          transition: 'background 2s ease',
        }}
      />
      <div
        className="pointer-events-none fixed inset-0 z-[1]"
        aria-hidden
        style={{
          background: `radial-gradient(ellipse 85% 75% at 50% 45%, transparent 25%, rgba(60, 0, 0, ${danger ? 0.65 : 0}) 100%)`,
          transition: 'background 2s ease',
        }}
      />
    </>
  )
}
