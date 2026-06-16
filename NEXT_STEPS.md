# Dead Hour — Next Steps

> Updated 2026-06-11.
>
> Everything from the 2026-06-05 analysis (immediate bugs #1-3, doc corrections #5-6, dead-code
> cleanup #7, missing data #8, and Quick Polish / Replay & Engagement / Immersion / Accessibility
> items A-K, plus the Day 15-90 content arc and passive cold/infection mechanics) has been
> implemented and verified against the current codebase. Removed from this list.

---

## Remaining Endings

9 endings exist (`ending_full_zombie`, `ending_death_health`, `ending_death_morale`,
`ending_fortress_irony`, `ending_solo_survivor`, `ending_escape_truck`,
`ending_superpower_awakening`, `ending_community_leader`, `ending_the_record`). The 9 below from
the original GDD plan are still missing:

| ID                        | Name                 | Trigger condition                                           |
| ------------------------- | -------------------- | ----------------------------------------------------------- |
| `ending_cold_death`       | BE-1 极寒熄火        | Survived winter but health reaches 0 from cold              |
| `ending_last_stand_fail`  | BE-3 第364天功亏一篑 | Survived 364 days then health reaches 0                     |
| `ending_fortress_solo`    | H-1 最强钉子户       | High security + solo + survived one year                    |
| `ending_together`         | H-2 双向奔赴         | Pei alive + excessive_exertion + survived one year          |
| `ending_dawn_of_man`      | A-1 凡人钢铁黎明     | Survived without awakening or turning                       |
| `ending_gene_blocker`     | A-2 基因阻断剂       | 郑博士 saved + pei_research_complete + infection controlled |
| `ending_new_human_leader` | B-2 新人类领袖       | Awakening + factions_allied + leadership ≥15                |
| `ending_species_shift`    | C-2 物种更替         | Full zombie + zombie_signal_received                        |
| `ending_ceasefire`        | B-1 停战协议         | factions_allied + survived one year + no zombie arc         |

Priority: BE-1 and H-1 have the simplest conditions and can be added without new content. The
rest require Phase 2+ content to be reachable.

---

## Deferred: Scene `timeOfDay` tagging (accurate day/night atmosphere)

Raised during the "Reactive Visual Atmosphere" immersion brainstorm (2026-06-11). The current plan
for that feature derives an ambient day/night tint from `hoursFromStart < 0` (before/after
outbreak) plus infection level — both unambiguous from existing data.

A full day/night _cycle_ (dawn/day/dusk/night tinting) was considered but deferred because
`hoursFromStart % 24` does not reliably match a scene's narrative time-of-day. Examples:

- `scene_day3_night` (h=72) and `scene_day4_morning` (h=96) both resolve to `% 24 === 0`, despite
  being opposite times of day.
- `scene_day3_morning` (h=56, 清晨/dawn) → hour 8; `scene_day4_day` (h=88, 白天/day) → hour 16;
  `scene_day4_dusk` (h=92, 黄昏/dusk) → hour 20 — these happen to line up, but the day3/day4
  pattern isn't consistent across all ~45 scenes.

**To do this properly:** add an explicit `timeOfDay: 'dawn' | 'day' | 'dusk' | 'night'` field to
the `Scene` type and tag all scene JSON files accordingly (cross-checking against each scene's
title, which already encodes this in Chinese — 清晨/白天/黄昏/夜). Then `AmbientOverlay` can blend
a dawn/day/dusk/night vignette tint directly from `scene.timeOfDay` instead of deriving it from
`hoursFromStart`.

Scope: ~45 scene file edits + 1 type addition + `validate-scenes` schema update + AmbientOverlay
tint logic. Not urgent — purely atmospheric polish, independent of any other system.
