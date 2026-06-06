/**
 * FLAG REGISTRY
 *
 * Single source of truth for every flag used in the game.
 * Flags are boolean values stored in GameState.flags that track
 * narrative decisions, NPC encounters, and world state.
 *
 * ADDING A FLAG:
 *   1. Add an entry here with a key, description, and category.
 *   2. Use the key (via GameFlags) in your scene JSON and engine code.
 *   3. If the flag should trigger an achievement, fill in the `achievement` field.
 *
 * NAMING CONVENTION:
 *   met_{npc}           — player has encountered an NPC
 *   did_{action}        — player performed a specific action
 *   has_{thing}         — player possesses or belongs to something
 *   chose_{path}        — player took a named narrative path
 *   survived_{event}    — player made it through a milestone
 *   betrayed_{entity}   — player betrayed an NPC or faction
 */

// ─── Flag Categories ──────────────────────────────────────────────────────────

export type FlagCategory =
  | 'narrative' // story beats and scene decisions
  | 'npc' // NPC encounters and relationships
  | 'faction' // faction membership and standing
  | 'survival' // milestone survival markers
  | 'world' // world-state changes
  | 'hidden' // hidden/secret flags not shown to the player

// ─── Achievement Shape (pre-wired for future use) ────────────────────────────

export interface AchievementDefinition {
  id: string
  title: string
  description: string
  icon: string // emoji or asset key
  secret: boolean // if true, hidden until unlocked
}

// ─── Flag Definition ─────────────────────────────────────────────────────────

export interface FlagDefinition {
  key: GameFlag
  description: string
  category: FlagCategory
  achievement: AchievementDefinition | null
}

// ─── Flag Keys (the canonical string union) ──────────────────────────────────
//
// Import GameFlag wherever you reference a flag key in TypeScript.
// Your scene JSON uses the raw string — this type keeps engine code type-safe.

export type GameFlag =
  // ── Narrative / Early decisions ──────────────────────────────────────────
  | 'researched_outbreak_early'
  | 'watched_deleted_video'
  | 'prepped_early'
  | 'bought_gloves'
  | 'bought_pipe'
  | 'money_obsolete' // cash no longer matters — UI hides money stat
  | 'delayed_exit_week' // player waited until day 14 before leaving apartment
  | 'visited_supermarket' // player completed scene_day10_supermarket
  | 'day8_returned_home' // brief return to apartment from scene_day8 hub
  | 'scavenged_pharmacy' // completed scene_day8_pharmacy

  // ── NPC outcomes ─────────────────────────────────────────────────────────
  | 'saved_the_kid'
  | 'intervened_at_pharmacy'

  // ── Faction membership ────────────────────────────────────────────────────
  | 'has_group'

  // ── World state ───────────────────────────────────────────────────────────
  | 'has_vehicle'
  | 'has_shelter'
  | 'built_shelter'
  | 'has_first_aid_training'
  | 'has_family_nearby'
  | 'knows_city_layout'

  // ── Survival milestones ───────────────────────────────────────────────────
  | 'survived_first_night'
  | 'survived_first_week'
  | 'survived_first_month'
  | 'survived_first_winter'
  | 'survived_one_year'

  // ── Hidden / secret ───────────────────────────────────────────────────────
  | 'wrote_journal' // enables secret ending

  // ── Transformation system (喻城 infection arc) ───────────────────────────
  | 'finger_cut' // infection entry point — set by scene_101 onEnter
  | 'wound_cleaned' // player cleaned the wound properly
  | 'wound_ignored' // player ignored the wound
  | 'noticed_outbreak_signs' // player connected the news dots early
  | 'noticed_wound_color' // player noticed the wound's abnormal discolouration
  | 'heard_rumor_at_breakfast'
  | 'late_from_breakfast' // spent 3h+ investigating at the breakfast shop — iron plates sold out by arrival
  | 'fortified_door' // iron plates fixed to door interior
  | 'gave_in_to_raw_hunger' // zombie path accelerator
  | 'resisted_primal_urge' // player suppressed an instinct — will +
  | 'superpower_awakening' // will>=8 AND infection 3-5 — awakening path
  | 'zombie_turning' // infection>=8 — zombie arc begins
  | 'full_zombie' // infection=10 — zombie ending
  | 'neighbor_explored' // player explored neighbour's room
  | 'truck_key_found' // truck key acquired from neighbour
  | 'gloves_worn' // player wore insulated gloves during neighbour scene
  | 'neighbor_zombie' // neighbour has turned — tracked for combat

  // ── 裴嘉应 survival status (mutually exclusive, set in scene_105) ─────────
  | 'pei_status_hidden' // she hid in the equipment room — stable
  | 'pei_status_trapped_outside' // she escaped but trapped near hospital
  | 'pei_status_injured_lost' // she was injured/lost during the call

  // ── 裴嘉应 full companion arc (Phase 2–4) ─────────────────────────────────
  | 'pei_alive' // she survived and is with the group
  | 'pei_research_begun' // she started the clinical observation notebook
  | 'pei_research_complete' // her notebook is a complete document (Phase 3+)
  | 'pei_knows_infection' // she knows about 喻城's infection
  | 'pei_confrontation_done' // the infection confrontation scene has played

  // ── Phase 2: base location (mutually exclusive) ───────────────────────────
  | 'base_factory' // abandoned machinery factory
  | 'base_bunker' // underground civil defense bunker
  | 'base_farm' // suburban farm

  // ── Phase 2: NPC recruitment ──────────────────────────────────────────────
  | 'npc_lao_xu_recruited' // 老许 (factory engineer) recruited
  | 'npc_lian_yu_recruited' // 连珏 (civil defense officer) recruited
  | 'npc_a_fu_recruited' // 阿福 (farmer) recruited

  // ── Phase 3: key story gates ──────────────────────────────────────────────
  | 'scientist_saved' // 郑博士 rescued and joined
  | 'zombie_signal_received' // ambiguous signal from herd leader

  // ── Phase 3: faction states ───────────────────────────────────────────────
  | 'factions_hostile' // all human factions hostile
  | 'factions_allied' // at least one faction alliance established

  // ── Phase 1 moral / event flags ───────────────────────────────────────────
  | 'helped_stranger' // Day 10: helped injured family at supermarket
  | 'heard_government_broadcast' // Day 15: radio signal with coordinates received
  | 'trusts_official_government' // Day 15: player chose to follow the official broadcast direction
  | 'trusts_alternative_broadcast' // Day 15: player chose to follow the alternative broadcast direction

  // ── Phase 1 daily loop observation ───────────────────────────────────────
  | 'noticed_patrol_pattern' // Day 3: player studied zombie movement routes

  // ── Phase 1 exit & rescue milestones ─────────────────────────────────────
  | 'left_apartment' // player has exited the apartment for the first time
  | 'pei_ankle_injured' // 裴嘉应 has a twisted ankle from her bakery escape

  // ── Phase 1 faction foreshadowing ────────────────────────────────────────
  | 'spotted_military_convoy' // Day 22: saw the military truck pass without stopping
  | 'entered_hospital' // Day 30: physically entered the hospital
  | 'pei_noticed_wound' // Day 45: 裴嘉应 glanced at the right hand — she noticed
  | 'winter_shelter_established' // Day 60: stable winter shelter confirmed and settled
  | 'received_military_broadcast' // Day 75: heard the Military Management Committee broadcast in full

  // ── Special ending conditions ─────────────────────────────────────────────
  | 'excessive_exertion' // 18+ consecutive action days without rest → H-2 ending

// ─── Registry ─────────────────────────────────────────────────────────────────

export const FLAG_REGISTRY: FlagDefinition[] = [
  // ── Narrative / Early decisions ────────────────────────────────────────────

  {
    key: 'researched_outbreak_early',
    description:
      'Player called 裴嘉应 from a back alley before Hour Zero and learned that the hospital was already receiving bite victims. First confirmed intelligence — not rumour, not inference, a witness report.',
    category: 'narrative',
    achievement: null,
  },
  {
    key: 'watched_deleted_video',
    description:
      'Player approached a stranger at the breakfast shop and watched a partial social media clip — someone crawling, movement wrong, not injured — before the video was deleted mid-watch. Visual evidence, half-confirmed, unverifiable.',
    category: 'narrative',
    achievement: {
      id: 'achievement_first_responder',
      title: 'First Responder',
      description: 'You looked directly at it when everyone else said it was a rumor.',
      icon: '🚨',
      secret: false,
    },
  },
  {
    key: 'prepped_early',
    description:
      'Player bought defensive supplies (iron plates, duct tape, weapons) before the outbreak was publicly confirmed.',
    category: 'narrative',
    achievement: null,
  },

  {
    key: 'bought_gloves',
    description: 'Purchased insulated gloves at the hardware store.',
    category: 'narrative',
    achievement: null,
  },
  {
    key: 'bought_pipe',
    description: 'Purchased steel pipe at the hardware store.',
    category: 'narrative',
    achievement: null,
  },
  {
    key: 'money_obsolete',
    description:
      'Outbreak confirmed — paper money no longer has purchasing power. Hides the money stat in the UI (set by scene_105 onEnter).',
    category: 'world',
    achievement: null,
  },
  {
    key: 'delayed_exit_week',
    description:
      'Player chose to wait an extra week before leaving (scene_day7_wait → scene_day14_exit). Used for alternate scene_day8 narrative.',
    category: 'narrative',
    achievement: null,
  },
  {
    key: 'visited_supermarket',
    description: 'Player has completed the day-10 supermarket scene at least once.',
    category: 'narrative',
    achievement: null,
  },
  {
    key: 'day8_returned_home',
    description: 'Player returned to the apartment once from the day-8 city hub.',
    category: 'narrative',
    achievement: null,
  },
  {
    key: 'scavenged_pharmacy',
    description: 'Player looted the corner pharmacy (scene_day8_pharmacy).',
    category: 'narrative',
    achievement: null,
  },

  // ── NPC outcomes ───────────────────────────────────────────────────────────

  {
    key: 'saved_the_kid',
    description: 'Player chose to protect the child at personal risk.',
    category: 'npc',
    achievement: {
      id: 'achievement_not_alone',
      title: 'Not Alone',
      description: 'Some things are worth the risk.',
      icon: '🧒',
      secret: false,
    },
  },
  {
    key: 'intervened_at_pharmacy',
    description: 'Player stepped in during the pharmacy confrontation.',
    category: 'narrative',
    achievement: null,
  },

  // ── Faction membership ─────────────────────────────────────────────────────

  {
    key: 'has_group',
    description: 'Player is part of an organised survivor group of any kind.',
    category: 'faction',
    achievement: null,
  },

  // ── World state ────────────────────────────────────────────────────────────

  {
    key: 'has_vehicle',
    description: 'Player has access to a working vehicle.',
    category: 'world',
    achievement: null,
  },
  {
    key: 'has_shelter',
    description: 'Player has a secure shelter to return to.',
    category: 'world',
    achievement: null,
  },
  {
    key: 'built_shelter',
    description: 'Player actively constructed or fortified a shelter.',
    category: 'world',
    achievement: {
      id: 'achievement_architect',
      title: 'Architect of the After',
      description: 'You built something meant to last.',
      icon: '🏗️',
      secret: false,
    },
  },
  {
    key: 'has_first_aid_training',
    description: 'Player has first aid knowledge, enabling medical choices.',
    category: 'world',
    achievement: null,
  },
  {
    key: 'has_family_nearby',
    description: 'Player has family in the city, adding a personal quest thread.',
    category: 'world',
    achievement: null,
  },
  {
    key: 'knows_city_layout',
    description: 'Player knows the city well enough to navigate by memory.',
    category: 'world',
    achievement: null,
  },

  // ── Survival milestones ────────────────────────────────────────────────────

  {
    key: 'survived_first_night',
    description: 'Player survived the first night of the outbreak.',
    category: 'survival',
    achievement: {
      id: 'achievement_night_one',
      title: 'Night One',
      description: 'The first night is the hardest. You made it.',
      icon: '🌑',
      secret: false,
    },
  },
  {
    key: 'survived_first_week',
    description: 'Player survived the first week.',
    category: 'survival',
    achievement: {
      id: 'achievement_seven_days',
      title: 'Seven Days',
      description: "A week in. Most didn't make it this far.",
      icon: '📅',
      secret: false,
    },
  },
  {
    key: 'survived_first_month',
    description: 'Player survived the first month.',
    category: 'survival',
    achievement: null,
  },
  {
    key: 'survived_first_winter',
    description: 'Player survived the first winter.',
    category: 'survival',
    achievement: {
      id: 'achievement_the_long_winter',
      title: 'The Long Winter',
      description: 'Cold is its own kind of enemy.',
      icon: '❄️',
      secret: false,
    },
  },
  {
    key: 'survived_one_year',
    description: 'Player has survived a full year since the outbreak.',
    category: 'survival',
    achievement: {
      id: 'achievement_one_year',
      title: 'Dead Hour — Anniversary',
      description: "A year since it started. You're still here.",
      icon: '⏳',
      secret: false,
    },
  },

  // ── Hidden / secret ────────────────────────────────────────────────────────

  {
    key: 'wrote_journal',
    description:
      'Player found and maintained a journal throughout the game. Enables the secret ending.',
    category: 'hidden',
    achievement: {
      id: 'achievement_the_record',
      title: 'The Record',
      description: 'Someone has to remember.',
      icon: '📓',
      secret: true,
    },
  },
  // ── 裴嘉应 survival status ─────────────────────────────────────────────────

  {
    key: 'pei_status_hidden',
    description: '裴嘉应 hid in the hospital equipment room and survived Phase 1 stably.',
    category: 'npc',
    achievement: null,
  },
  {
    key: 'pei_status_trapped_outside',
    description:
      '裴嘉应 escaped the hospital but is trapped in the surrounding street, waiting for rescue.',
    category: 'npc',
    achievement: null,
  },
  {
    key: 'pei_status_injured_lost',
    description: '裴嘉应 was injured or went missing during the phone call. Her status is unknown.',
    category: 'npc',
    achievement: null,
  },

  // ── 裴嘉应 companion arc (Phase 2–4) ──────────────────────────────────────

  {
    key: 'pei_alive',
    description: '裴嘉应 survived Phase 1 and is an active companion in the group.',
    category: 'npc',
    achievement: null,
  },
  {
    key: 'pei_research_begun',
    description: '裴嘉应 has started her clinical observation notebook (「临床观察·样本A」).',
    category: 'npc',
    achievement: null,
  },
  {
    key: 'pei_research_complete',
    description: 'Her research notebook is complete — a full document usable for science endings.',
    category: 'npc',
    achievement: {
      id: 'achievement_the_notebook',
      title: 'Clinical Observer',
      description: 'She wrote everything down. She always did.',
      icon: '🔬',
      secret: false,
    },
  },
  {
    key: 'pei_knows_infection',
    description:
      "裴嘉应 knows about 喻城's infection — either told by him or discovered independently.",
    category: 'npc',
    achievement: null,
  },
  {
    key: 'pei_confrontation_done',
    description: 'The infection confrontation scene between 喻城 and 裴嘉应 has played out.',
    category: 'npc',
    achievement: null,
  },

  // ── Phase 2: base location ─────────────────────────────────────────────────

  {
    key: 'base_factory',
    description: 'Player chose the abandoned machinery factory as the long-term base.',
    category: 'world',
    achievement: null,
  },
  {
    key: 'base_bunker',
    description: 'Player chose the underground civil defense bunker as the long-term base.',
    category: 'world',
    achievement: null,
  },
  {
    key: 'base_farm',
    description: 'Player chose the suburban farm as the long-term base.',
    category: 'world',
    achievement: null,
  },

  // ── Phase 2: NPC recruitment ───────────────────────────────────────────────

  {
    key: 'npc_lao_xu_recruited',
    description: '老许 (retired engineer, 58) has been recruited at the factory.',
    category: 'npc',
    achievement: null,
  },
  {
    key: 'npc_lian_yu_recruited',
    description: '连珏 (former civil defense officer, 35) has been recruited at the bunker.',
    category: 'npc',
    achievement: null,
  },
  {
    key: 'npc_a_fu_recruited',
    description: '阿福 (young farmer, 21) has been recruited at the farm.',
    category: 'npc',
    achievement: null,
  },

  // ── Phase 3: key story gates ───────────────────────────────────────────────

  {
    key: 'scientist_saved',
    description: '郑博士 (virologist) was found and rescued. His research enables science endings.',
    category: 'npc',
    achievement: {
      id: 'achievement_scientist_saved',
      title: 'The Last Lab',
      description: 'His notes were worth the risk.',
      icon: '🧫',
      secret: false,
    },
  },
  {
    key: 'zombie_signal_received',
    description: 'An ambiguous signal was received from the herd leader. Its meaning is unknown.',
    category: 'world',
    achievement: null,
  },

  // ── Phase 3: faction states ────────────────────────────────────────────────

  {
    key: 'factions_hostile',
    description: "All human factions are now hostile to the player's group.",
    category: 'faction',
    achievement: null,
  },
  {
    key: 'factions_allied',
    description: 'At least one formal alliance with a human faction has been established.',
    category: 'faction',
    achievement: null,
  },

  // ── Phase 1 moral / event flags ────────────────────────────────────────────

  {
    key: 'helped_stranger',
    description: 'Day 10: player chose to help the injured family at the supermarket.',
    category: 'narrative',
    achievement: {
      id: 'achievement_helped_stranger',
      title: 'Still Human',
      description: "You stopped when you didn't have to.",
      icon: '🫂',
      secret: false,
    },
  },
  {
    key: 'heard_government_broadcast',
    description: 'Day 15: radio signal with government coordinates received. Destination unknown.',
    category: 'narrative',
    achievement: null,
  },
  {
    key: 'trusts_official_government',
    description:
      'Day 15: player decided to follow the official government broadcast direction. Gates Phase 2 faction alignment toward the Military Management Committee.',
    category: 'faction',
    achievement: null,
  },
  {
    key: 'trusts_alternative_broadcast',
    description:
      'Day 15: player chose to follow the alternative broadcast over the official channel. Gates Phase 2 faction alignment toward civilian resistance.',
    category: 'faction',
    achievement: null,
  },

  // ── Phase 1 daily loop observation ────────────────────────────────────────

  {
    key: 'noticed_patrol_pattern',
    description:
      'Day 3: player spent time watching zombie movement routes from the window. Unlocks stealth options.',
    category: 'narrative',
    achievement: null,
  },
  {
    key: 'left_apartment',
    description:
      'Player has left their apartment for the first time since the outbreak. Set at Day 7 milestone exit.',
    category: 'survival',
    achievement: {
      id: 'achievement_first_step',
      title: 'First Step',
      description: 'The door opened both ways.',
      icon: '🚪',
      secret: false,
    },
  },
  {
    key: 'pei_ankle_injured',
    description:
      '裴嘉应 twisted her ankle escaping the hospital bakery. Carries a health penalty for ~30 days after rescue.',
    category: 'npc',
    achievement: null,
  },

  // ── Phase 1 faction foreshadowing ─────────────────────────────────────────

  {
    key: 'spotted_military_convoy',
    description:
      'Day 22: player witnessed a military truck pass through the city without stopping. First proof that organized military exists but is not helping civilians. Gates Day 75 broadcast recognition and Phase 3 faction options.',
    category: 'faction',
    achievement: null,
  },
  {
    key: 'entered_hospital',
    description:
      'Day 30: player physically entered the hospital building. Affects Phase 2 medical options and 裴嘉应 research completeness.',
    category: 'narrative',
    achievement: null,
  },
  {
    key: 'pei_noticed_wound',
    description:
      "Day 45: 裴嘉应 glanced at 喻城's right hand without asking about it. She noticed. She chose not to ask. Gates Phase 2 confrontation arc timing — if set, the confrontation window opens earlier.",
    category: 'npc',
    achievement: null,
  },
  {
    key: 'winter_shelter_established',
    description:
      'Day 60: stable winter shelter has been confirmed and settled into. Affects Phase 2 starting security and morale baselines.',
    category: 'survival',
    achievement: {
      id: 'achievement_winter_shelter',
      title: 'Against the Cold',
      description: 'You built something that could last a season.',
      icon: '🏚️',
      secret: false,
    },
  },
  {
    key: 'received_military_broadcast',
    description:
      "Day 75: player heard the Military Management Committee's full broadcast. The tone was administrative, not desperate. Prerequisite for recognising the faction in Phase 3.",
    category: 'faction',
    achievement: null,
  },

  // ── Special ending conditions ──────────────────────────────────────────────

  {
    key: 'excessive_exertion',
    description:
      'Player worked 18+ consecutive action days without rest — triggers H-2 ending condition.',
    category: 'hidden',
    achievement: null,
  },

  // ── Transformation system — infection arc registry entries ─────────────────
  // These flags are set by scene onEnter effects and player choices.
  // They drive the survivor / awakening / zombie path detection.

  {
    key: 'finger_cut',
    description:
      'The infection entry point. Set automatically by scene_101 onEnter. The wound happened before the game opened.',
    category: 'hidden',
    achievement: null,
  },
  {
    key: 'wound_cleaned',
    description:
      'Player properly cleaned and disinfected the finger wound. Slows infection progression.',
    category: 'narrative',
    achievement: null,
  },
  {
    key: 'wound_ignored',
    description: 'Player ignored the wound and kept working. Accelerates infection progression.',
    category: 'narrative',
    achievement: null,
  },
  {
    key: 'noticed_outbreak_signs',
    description: 'Player connected the news reports and recognised the outbreak pattern early.',
    category: 'narrative',
    achievement: null,
  },
  {
    key: 'noticed_wound_color',
    description:
      'Player looked closely at the wound and registered the abnormal discolouration. A separate observation from connecting the outbreak news — this is about the body, not the world.',
    category: 'hidden',
    achievement: null,
  },
  {
    key: 'heard_rumor_at_breakfast',
    description: 'Player overheard the breakfast-shop rumour about the downtown incident.',
    category: 'narrative',
    achievement: null,
  },
  {
    key: 'late_from_breakfast',
    description:
      'Player spent 3+ hours investigating at the breakfast shop (watched the deleted video). Arrived at the hardware store after the clearance sale ended — iron plates sold out.',
    category: 'narrative',
    achievement: null,
  },
  {
    key: 'fortified_door',
    description: 'Player successfully fortified the apartment door with iron plates and wire.',
    category: 'world',
    achievement: {
      id: 'achievement_iron_door',
      title: 'The Iron Door',
      description: 'Nothing gets through this.',
      icon: '🚪',
      secret: false,
    },
  },
  {
    key: 'gave_in_to_raw_hunger',
    description:
      'Player gave in to an unidentifiable hunger at Hour Zero. Primary zombie-path trigger.',
    category: 'hidden',
    achievement: null,
  },
  {
    key: 'resisted_primal_urge',
    description: 'Player noticed and actively suppressed a primal instinct. Raises will.',
    category: 'hidden',
    achievement: {
      id: 'achievement_still_me',
      title: 'Still Me',
      description: "You noticed. You stopped. That's the part that matters.",
      icon: '◇',
      secret: false,
    },
  },
  {
    key: 'superpower_awakening',
    description:
      'The virus rewired something. Infection 3–7 with will >= 8. Awakening path is active.',
    category: 'hidden',
    achievement: {
      id: 'achievement_something_changed',
      title: 'Something Changed',
      description: 'You can feel the metal.',
      icon: '⚙️',
      secret: false,
    },
  },
  {
    key: 'zombie_turning',
    description:
      'Set by scene_109_turning onEnter — reached when the player gave in to raw hunger at Hour Zero. The transformation arc is active. Read by scene_109_awakening (blocked) and scene_crisis_turning (required).',
    category: 'hidden',
    achievement: null,
  },
  {
    key: 'full_zombie',
    description:
      'Set in scene_crisis_turning when will is too low to resist opening the door. Marks complete loss of agency. Note: ending_full_zombie triggers on infection stat >= 10, not this flag — this flag is for in-scene logic downstream.',
    category: 'hidden',
    achievement: null,
  },
  {
    key: 'neighbor_explored',
    description:
      "Player explored the neighbour's room. Triggered the encounter with the turned neighbour.",
    category: 'narrative',
    achievement: null,
  },
  {
    key: 'truck_key_found',
    description:
      "Player acquired the truck key from the neighbour's apartment. Enables late-game escape route.",
    category: 'world',
    achievement: null,
  },
  {
    key: 'gloves_worn',
    description:
      'Player wore insulated gloves during the neighbour encounter. Prevented blood contact.',
    category: 'narrative',
    achievement: null,
  },
  {
    key: 'neighbor_zombie',
    description: 'The neighbour has turned. Tracked for encounter scene logic.',
    category: 'hidden',
    achievement: null,
  },
]

// ─── Lookup Helpers ───────────────────────────────────────────────────────────

/** Get a flag definition by key. Returns undefined if not found. */
export function getFlagDefinition(key: GameFlag): FlagDefinition | undefined {
  return FLAG_REGISTRY.find((f) => f.key === key)
}

/** Get all flags that have an achievement attached. */
export function getAchievementFlags(): FlagDefinition[] {
  return FLAG_REGISTRY.filter((f) => f.achievement !== null)
}

/** Get all flags by category. */
export function getFlagsByCategory(category: FlagCategory): FlagDefinition[] {
  return FLAG_REGISTRY.filter((f) => f.category === category)
}

/** Get all achievement definitions (flattened, nulls removed). */
export function getAllAchievements(): AchievementDefinition[] {
  return FLAG_REGISTRY.map((f) => f.achievement).filter(
    (a): a is AchievementDefinition => a !== null,
  )
}
