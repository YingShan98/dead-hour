# 06 — Content Authoring Guide
### Dead Hour | How to Write Scenes

This document is a practical reference for writing story content in JSON. You'll return to this every time you author new scenes.

---

## The Golden Rule

**The engine is dumb. The story is smart.**

The engine just evaluates conditions and applies effects. It doesn't know what makes a good story. All narrative craft — tension, pacing, consequence — comes from how you design your JSON. The engine will faithfully execute whatever you write, good or bad.

---

## Minimal Scene (No Conditions, No Stats)

The simplest possible scene:

```json
{
  "id": "scene_002_office",
  "title": "Business As Usual",
  "act": "act1",
  "gameTime": { "hoursFromStart": -46 },
  "narrative": [
    "Your office is the same as always. Fluorescent lights, the hum of the coffee machine, someone's passive-aggressive note about labelling food in the fridge.",
    "Your phone buzzes. Your manager needs the quarterly report by noon.",
    "On the TV screen in the corner, a news ticker runs: CIVIL UNREST IN DOWNTOWN. POLICE ADVISE AVOIDING THE AREA."
  ],
  "conditions": {},
  "choices": [
    {
      "id": "choice_002a",
      "text": "Work on the report. Act normal.",
      "conditions": {},
      "effects": { "stats": { "morale": -1 }, "flags": {}, "items": [] },
      "nextSceneId": "scene_003_lunchbreak"
    },
    {
      "id": "choice_002b",
      "text": "Look up the downtown situation on your phone.",
      "conditions": {},
      "effects": { "flags": { "researched_outbreak_early": true }, "stats": {}, "items": [] },
      "nextSceneId": "scene_003_lunchbreak"
    }
  ]
}
```

---

## Scene with Stat-Gated Choice

```json
{
  "id": "scene_015_confrontation",
  "title": "The Argument",
  "act": "act2",
  "gameTime": { "hoursFromStart": 12 },
  "narrative": [
    "Two men are fighting over a backpack near the pharmacy entrance. One of them has a child with him.",
    "People are watching. Nobody's stepping in."
  ],
  "conditions": {},
  "choices": [
    {
      "id": "choice_015a",
      "text": "Keep walking. It's not your problem.",
      "conditions": {},
      "effects": { "stats": { "morale": -2 } },
      "nextSceneId": "scene_016_pharmacy"
    },
    {
      "id": "choice_015b",
      "text": "Step between them and talk them down.",
      "conditions": {
        "requiredStats": [{ "stat": "leadership", "min": 3 }]
      },
      "hint": "Requires Leadership 3+",
      "effects": {
        "stats": { "leadership": 1, "morale": 2 },
        "flags": { "intervened_at_pharmacy": true }
      },
      "nextSceneId": "scene_016_pharmacy_resolved"
    },
    {
      "id": "choice_015c",
      "text": "Slip around the back entrance while they're distracted.",
      "conditions": {
        "requiredStats": [{ "stat": "stealth", "min": 2 }]
      },
      "hint": "Requires Stealth 2+",
      "effects": {
        "stats": { "stealth": 1 },
        "items": [{ "itemId": "medkit", "delta": 1 }]
      },
      "nextSceneId": "scene_016_pharmacy"
    }
  ]
}
```

---

## Scene with Item-Gated Choice

```json
{
  "id": "scene_030_radio_broadcast",
  "title": "The Signal",
  "act": "act2",
  "gameTime": { "hoursFromStart": 72 },
  "narrative": [
    "From someone's abandoned apartment, you hear static. Then a voice.",
    "'...repeating: Westfield Community Centre is open. We have food, water, and medical supplies. Come to the Centre. We are organized. We are safe...'",
    "It cuts out. Static again."
  ],
  "conditions": {},
  "choices": [
    {
      "id": "choice_030a",
      "text": "Try to find the signal's frequency on your radio.",
      "conditions": {
        "requiredItems": [{ "itemId": "radio", "minQuantity": 1 }]
      },
      "hint": "Requires: Emergency Radio",
      "effects": {
        "flags": { "located_westfield_signal": true, "knows_westfield_location": true }
      },
      "nextSceneId": "scene_031_strong_signal"
    },
    {
      "id": "choice_030b",
      "text": "Note the name — Westfield Community Centre — and move on.",
      "conditions": {},
      "effects": {
        "flags": { "knows_westfield_name": true }
      },
      "nextSceneId": "scene_031_street"
    }
  ]
}
```

---

## Scene with Flag-Gated Entry

Use the scene-level `conditions` field to make a scene only accessible if the player has met prerequisites. The loader will not route to this scene unless those conditions are met — but **you must ensure your choice `nextSceneId` pointers only point here when appropriate**.

```json
{
  "id": "scene_040_doctor_trust",
  "title": "Lena's Offer",
  "act": "act2",
  "gameTime": { "hoursFromStart": 120 },
  "conditions": {
    "requiredFlags": ["met_doctor"],
    "requiredStats": [{ "stat": "trust", "min": 7 }]
  },
  "narrative": [
    "Dr. Marsh finds you alone in the corridor.",
    "'I've been watching you,' she says. Not unkindly. 'You make decisions. Real ones. Not everyone does anymore.'",
    "'We need someone like that here. But I need to know you're in. All the way.'"
  ],
  "choices": [
    {
      "id": "choice_040a",
      "text": "'I'm in.'",
      "conditions": {},
      "effects": {
        "flags": { "joined_clinic": true },
        "stats": { "morale": 3 }
      },
      "nextSceneId": "scene_041_clinic_orientation"
    },
    {
      "id": "choice_040b",
      "text": "'I need more time.'",
      "conditions": {},
      "effects": {
        "flags": { "deferred_clinic_offer": true },
        "stats": { "trust": -1 }
      },
      "nextSceneId": "scene_041_corridor"
    }
  ]
}
```

---

## Scene with `onEnter` Effects

Use `onEnter` for effects that happen automatically when entering a scene — regardless of how you got there. Useful for time passing, passive events, environmental hazards.

```json
{
  "id": "scene_050_safe_house_night",
  "title": "Night at the Safehouse",
  "act": "act2",
  "gameTime": { "hoursFromStart": 168 },
  "onEnter": {
    "stats": { "health": 2, "morale": 1 },
    "flags": { "rested_at_safehouse": true },
    "items": []
  },
  "narrative": [
    "You sleep for the first time in three days.",
    "No dreams. Just dark, and then light."
  ],
  "conditions": {},
  "choices": [
    {
      "id": "choice_050a",
      "text": "Check the supplies before moving on.",
      "conditions": {},
      "effects": {},
      "nextSceneId": "scene_051_supply_check"
    }
  ]
}
```

---

## Common Mistakes to Avoid

### 1. Forgetting to clamp stats
Stats clamp automatically in the executor (between `min` and `max`), but writing `"health": -99` in an effect is still valid JSON. Don't try to use effects to force states — use ending conditions for game-over scenarios.

### 2. Circular `nextSceneId` references
Scene A → Scene B → Scene A creates an infinite loop. The engine won't detect this — you will, when your browser freezes. Keep a scene graph diagram or simple spreadsheet tracking which scenes link to which.

### 3. Orphaned scenes
A scene with no `nextSceneId` pointing to it will never be reached. Run `validate-scenes.ts` periodically to catch these.

### 4. Flags that never get set
If you gate a scene on `requiredFlags: ['has_radio']` but no earlier scene sets that flag, no player will ever reach your scene. Cross-reference flag usage in a simple spreadsheet.

### 5. Over-gating choices
If you gate every interesting choice behind stats, low-stat players will always get boring options. At least one interesting choice per scene should always be available.

---

## Scene ID Naming Convention

```
scene_{act_number}{sequence}_{short_description}

Examples:
  scene_001_morning_commute
  scene_215_doctor_offer
  scene_340_shelter_collapse
  scene_final

Act prefixes:
  1xx = Act 1
  2xx = Act 2
  3xx = Act 3
  4xx = Act 4
  scene_final = convergence scene
```

---

## Choice ID Naming Convention

```
{parent_scene_id}_choice_{letter}

Examples:
  scene_001_morning_commute_choice_a
  scene_001_morning_commute_choice_b
```

---

## Authoring Checklist (per scene)

Before committing a new scene:

- [ ] Scene `id` matches the filename (`scene_001.json` → `"id": "scene_001"`)
- [ ] `gameTime.hoursFromStart` is set correctly
- [ ] `narrative` has at least 2 paragraphs
- [ ] At least 1 choice has no conditions (always available)
- [ ] All `nextSceneId` values point to scenes that exist (or will exist in this phase)
- [ ] No `nextSceneId` creates a loop back to this scene
- [ ] Any `hint` is written in the format: `"Requires [Stat] [N]+"`
- [ ] Scene passes `npx ts-node scripts/validate-scenes.ts`
