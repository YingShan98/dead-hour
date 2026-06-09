import { useI18n } from '@/i18n/useI18n'
import { interpolate } from '@/i18n/interpolate'

export default function DayTransition({ day }: { day: number }) {
  const { LL } = useI18n()
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-background/70 pointer-events-none"
      aria-hidden
      // 'both' fill-mode: element is invisible (0% keyframe) during the 400ms delay,
      // then fades in once the incoming scene has had time to appear.
      style={{ animation: 'dayBanner 1.8s ease 0.4s both' }}
    >
      <p className="font-display text-5xl text-text-dim tracking-[0.25em] flex items-center gap-5">
        <span className="font-ui text-xs text-border">──</span>
        {interpolate(LL.time.day, { day })}
        <span className="font-ui text-xs text-border">──</span>
      </p>
    </div>
  )
}
