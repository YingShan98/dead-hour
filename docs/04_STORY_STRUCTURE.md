# 04 — Story Structure
### Dead Hour | Narrative Design

---

## Overview

The game spans approximately **one in-game year**, structured into four acts. Time is tracked in **hours** before the outbreak and **days** afterward. The player's choices determine which branches they travel through each act, and which ending they reach.

---

## In-Game Timeline

| Phase | In-Game Time | Real Scope | Description |
|-------|-------------|------------|-------------|
| **Act 1: The Warning** | Hour -48 to Hour 0 | ~15–20 scenes | Life before the outbreak. Seeds planted here grow throughout the game. |
| **Act 2: The Fall** | Day 1 to Day 30 | ~30–40 scenes | City collapses. Survival instincts kick in. Critical branching. |
| **Act 3: The Long Winter** | Day 31 to Day 180 | ~40–60 scenes | Scarcity, factions, trust. Who you become. |
| **Act 4: The Year Mark** | Day 181 to Day 365 | ~20–30 scenes | Convergence. All choices lead here. Endings trigger. |

**Total estimated scene count: 120–150 scenes** across all branches. Not all scenes are reachable in a single playthrough — expect ~40–60 per run.

---

## Act Breakdown

### Act 1: The Warning (Hours -48 to 0)

The city is normal. The player has a job, a routine, maybe a family or friends.

**Purpose:** Establish who the player is. Choices here are low-stakes but set lasting flags and stats.

**Key scenes:**
- `scene_001` — The Morning Commute (the viral video)
- `scene_005` — First Night (dinner, news coverage, something feels wrong)
- `scene_010` — Hour Zero (the first confirmed attack in the player's district)

**Key flags established in Act 1:**
- `has_first_aid_training` — opens medical choices throughout
- `has_vehicle` — mobility options in Act 2
- `has_family_nearby` — adds moral weight and optional quest line
- `warned_neighbors` — affects community trust stat
- `knows_city_layout` — navigation-based choices in Act 2

**Stat growth in Act 1:** Morale starts at 10. Leadership and Stealth both start at 0 but can reach up to 3–4 by Act 2 start depending on choices.

---

### Act 2: The Fall (Days 1–30)

The city is in chaos. Emergency services fail. People flee or hunker down.

**Purpose:** The core survival loop starts. Resource management becomes real. First major branch point.

**The first major branch (around Day 3):**

```
                    ┌─── Branch A: Stay in the city ───┐
                    │    (urban survival, scavenging)   │
Day 3: Crisis Point─┤                                   ├─── merge at Day 30
                    │                                   │
                    └─── Branch B: Flee to suburbs ─────┘
                         (mobility, exposure, strangers)
```

Both branches converge at Act 3 but with very different stats, inventory, and flags.

**Key scenes:**
- `scene_020` — The Supermarket (first resource conflict with other survivors)
- `scene_025` — The Radio Broadcast (a voice claiming to have a safe zone)
- `scene_030` — Day 7 (a week in — first major character can die or survive based on earlier choices)

**Resource pressure starts here:** food and medicine become scarce. Inventory management is now real.

---

### Act 3: The Long Winter (Days 31–180)

Six months. This is where the game breathes and the player's identity solidifies.

**Purpose:** Faction dynamics, NPC relationships, moral complexity. Who do you become when survival requires compromise?

**Key factions introduced:**
- **The Militia** — armed, organized, ruthless. Can protect you or turn on you.
- **The Clinic** — a doctor running a small medical refuge. Trust-based.
- **The Collective** — a group of survivors building something together. Leadership-heavy.
- **The Loner** — not a faction, but a recurring NPC who reflects the player's path

**Key flags:** `joined_militia`, `joined_clinic`, `joined_collective`, `stayed_alone`

You can only truly belong to one. Attempting to play all sides lowers the `trust` stat with all of them.

**The second major branch (around Day 90):**
Centered on a moral choice — do you sacrifice someone vulnerable to protect your group, or do you risk everything to save them? This choice is heavily weighted in ending evaluation.

---

### Act 4: The Year Mark (Days 181–365)

The chaos has settled into a new, broken normal. The city — or what's left of it — has a shape again.

**Purpose:** Payoff. All the flags, stats, and choices from the past three acts converge here. The engine checks endings in priority order after the final scene of this act.

**The final scene:** Always the same entry point (`scene_final`), but what happens inside it — and what choices are available — varies wildly based on state.

**Endings summary:**

| Ending ID | Type | Primary Conditions |
|-----------|------|--------------------|
| `ending_death_*` | Bad | Health ≤ 0 (can trigger in any act) |
| `ending_collapse_morale` | Bad | Morale ≤ 0 at any point |
| `ending_exile` | Neutral | Survived but `trust < 3`, no group |
| `ending_solo_survivor` | Neutral | Survived, no group, health ≥ 1 |
| `ending_militia_enforcer` | Mixed | Survived via militia, high stealth, low trust |
| `ending_clinic_refuge` | Good | Survived, `joined_clinic`, leadership ≥ 10 |
| `ending_community_leader` | Good | Survived, `has_group`, leadership ≥ 15, trust ≥ 12 |
| `ending_the_record` | Secret | Survived, `wrote_journal` flag (hidden collectible path) |

---

## Branching Philosophy

### Don't fake branches

Every branch must lead to **meaningfully different content** — different scenes, different NPCs, different challenges. Branches that only differ in stat numbers but share all the same text are not real branches.

### Flags over stats for gating

Use **flags** to gate story content (did the player meet X? did they do Y?). Use **stats** to gate specific choices within scenes (is the player strong/smart/trusted enough?). This gives the most expressive narrative control.

### Convergence is okay

Acts 1 and 2 can have very different branches that **converge into Act 3**. Don't try to maintain completely parallel paths forever — it multiplies content requirements exponentially. Bring threads together, but carry the consequences forward through flags.

### The weight system (informal)

Some choices should feel heavier than others. Use these signals:
- Heavy choice = more narrative text before presenting options, fewer options available
- Light choice = briefer setup, more options
- Irreversible choice = no confirmation, but immediate consequence description

---

## NPC Design Notes

Key recurring characters across all acts:

| NPC | Role | First Appears | Fate Affected By |
|-----|------|--------------|-----------------|
| **Dr. Lena Marsh** | Clinic leader, moral anchor | Act 2, Day 5 | Trust stat, `joined_clinic` |
| **Rook** | Militia captain, pragmatist | Act 2, Day 3 | Stealth, `betrayed_militia` |
| **Yusuf** | Collective organizer, idealist | Act 2, Day 10 | Leadership, `joined_collective` |
| **The Kid** | Unnamed child, ~10 yrs old | Act 1, last scene | Morale, `saved_the_kid` |
| **Ghost** | The Loner, mirrors player | Act 3, Day 60 | Mirrors player's dominant stat |

---

## Writing Tone Guidelines

- **Present tense.** "You step into the alley." Not "You stepped."
- **Second person.** The player *is* the protagonist. No named protagonist.
- **No purple prose.** Short sentences under tension. Breathing room in calm.
- **Show the world, not just action.** A florist's shop window full of dead flowers says more than "the city was dying."
- **Choices should feel alive.** Avoid "A) Do the good thing / B) Do the bad thing." Frame choices as real tradeoffs with no obvious right answer.
