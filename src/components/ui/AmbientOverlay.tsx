import {
  infectionTintOpacity,
  baseVignetteColor,
  willTintOpacity,
  endingVignetteColor,
} from '@/engine/atmosphereHelpers'
import type { EndingType } from '@/engine/types'

interface Props {
  hoursFromStart?: number
  infection?: number
  will?: number
  danger?: boolean
  endingType?: EndingType
}

function VignetteLayer({ color, clearStop = 25 }: { color: string; clearStop?: number }) {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[1]"
      aria-hidden
      style={{
        background: `radial-gradient(ellipse 85% 75% at 50% 45%, transparent ${clearStop}%, ${color} 100%)`,
        transition: 'background 2s ease',
      }}
    />
  )
}

export default function AmbientOverlay({
  hoursFromStart = -48,
  infection = 0,
  will = 0,
  danger,
  endingType,
}: Props) {
  const baseColor = endingType ? endingVignetteColor(endingType) : baseVignetteColor(hoursFromStart)

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
      <VignetteLayer color={baseColor} clearStop={35} />
      <VignetteLayer color={`rgba(50, 10, 55, ${infectionTintOpacity(infection)})`} />
      <VignetteLayer color={`rgba(180, 140, 20, ${willTintOpacity(will)})`} />
      <VignetteLayer color={`rgba(60, 0, 0, ${danger ? 0.65 : 0})`} />
    </>
  )
}
