# Dead Hour — Project Overview
### A Word Adventure Game | Solo Dev Kickstart Documentation

---

## What This Project Is

A **text-driven branching narrative game** set in a city on the eve of a zombie outbreak. The player begins 48 hours before the first confirmed attack and must navigate decisions across an in-game timeline spanning approximately one year. Every meaningful choice the player makes shapes:

- The **story path** they travel (branching narrative)
- Their **character stats** (health, morale, leadership, etc.)
- Their **inventory and resources** (food, medicine, weapons, fuel)
- Ultimately, **which ending** they reach (multiple endings, some wildly different)

The project is built in **React + TypeScript**, authored as a **solo developer**, and designed from the start for future extensibility.

---

## Document Index

| # | Document | Purpose |
|---|----------|---------|
| 00 | `00_PROJECT_OVERVIEW.md` | This file — big picture |
| 01 | `01_ARCHITECTURE.md` | System design, tech stack, folder structure |
| 02 | `02_DATA_MODEL.md` | Scene, choice, stat, inventory schema |
| 03 | `03_GAME_ENGINE_SPEC.md` | Engine logic — state machine, condition evaluator |
| 04 | `04_STORY_STRUCTURE.md` | Narrative design — acts, timeline, ending conditions |
| 05 | `05_DEVELOPMENT_ROADMAP.md` | Phased plan, milestones, solo-dev priorities |
| 06 | `06_CONTENT_AUTHORING_GUIDE.md` | How to write scenes and choices in JSON |

---

## Core Design Pillars

### 1. Player Agency is Real
Choices must have **actual consequences**. Decisions made in Hour -48 can close doors (or open them) in Month 6. Avoid the illusion of choice.

### 2. State is the Story
The game's story *is* the state of the world — the player's stats, their inventory, what they chose. The engine renders story from state, not the other way around.

### 3. Data Drives Content
Story content (scenes, choices, dialogue) lives in **JSON data files**, completely separate from the engine code. You can write new story content without touching TypeScript.

### 4. Scope is a Feature
For a solo dev, a small well-crafted game beats a vast unfinished one. The architecture supports growth, but the roadmap respects limits.

---

## High-Level Game Loop

```
Load Game State
      │
      ▼
Render Current Scene
(text + choices filtered by conditions)
      │
      ▼
Player Selects a Choice
      │
      ▼
Engine Applies Effects
(stat changes, inventory changes, flags set)
      │
      ▼
Engine Evaluates Next Scene
(based on choice outcome + current state)
      │
      ▼
Check Ending Conditions
(if met → show ending; else → loop)
```

---

## Technology Summary

| Concern | Choice | Rationale |
|---------|--------|-----------|
| UI Framework | React 18 + TypeScript | Type safety for complex state; component reuse |
| Build Tool | Vite | Fast dev server, minimal config |
| State Management | Zustand | Lightweight; game state fits naturally |
| Story Content | JSON files | Human-writable; separates content from code |
| Styling | Tailwind CSS | Rapid iteration; dark/atmospheric theme |
| Persistence | localStorage | No backend needed; single-player offline |
| Testing | Vitest + React Testing Library | Unit test engine logic; component tests |

---

## What This Is Not (Scope Boundaries)

- Not a multiplayer game
- Not a real-time game (turn-based / scene-based)
- Not server-side rendered
- No user accounts in v1
- No procedural content generation (all content hand-authored)
