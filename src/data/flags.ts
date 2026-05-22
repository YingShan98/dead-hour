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
  | 'narrative'   // story beats and scene decisions
  | 'npc'         // NPC encounters and relationships
  | 'faction'     // faction membership and standing
  | 'survival'    // milestone survival markers
  | 'world'       // world-state changes
  | 'hidden'      // hidden/secret flags not shown to the player

// ─── Achievement Shape (pre-wired for future use) ────────────────────────────

export interface AchievementDefinition {
  id: string
  title: string
  description: string
  icon: string          // emoji or asset key
  secret: boolean       // if true, hidden until unlocked
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
  | 'saw_patient_zero_video'
  | 'warned_a_stranger'
  | 'warned_neighbors'
  | 'researched_outbreak_early'
  | 'went_to_city_hall_early'
  | 'prepped_early'

  // ── NPC encounters ────────────────────────────────────────────────────────
  | 'met_doctor'            // Dr. Lena Marsh
  | 'met_militia_leader'    // Rook
  | 'met_collective_organizer' // Yusuf
  | 'met_the_kid'
  | 'met_ghost'             // The Loner

  // ── NPC outcomes ─────────────────────────────────────────────────────────
  | 'saved_the_kid'
  | 'betrayed_militia'
  | 'betrayed_collective'
  | 'deferred_clinic_offer'
  | 'intervened_at_pharmacy'

  // ── Faction membership ────────────────────────────────────────────────────
  | 'joined_clinic'
  | 'joined_militia'
  | 'joined_collective'
  | 'has_group'

  // ── World state ───────────────────────────────────────────────────────────
  | 'has_vehicle'
  | 'has_shelter'
  | 'built_shelter'
  | 'has_first_aid_training'
  | 'has_family_nearby'
  | 'knows_city_layout'
  | 'knows_westfield_name'
  | 'located_westfield_signal'
  | 'knows_westfield_location'

  // ── Survival milestones ───────────────────────────────────────────────────
  | 'survived_first_night'
  | 'survived_first_week'
  | 'survived_first_month'
  | 'survived_first_winter'
  | 'survived_one_year'

  // ── Act 1 narrative ──────────────────────────────────────────────────────
  | 'act1_noticed_clues'
  | 'act1_ignored_clues'

  // ── Act 2 narrative ──────────────────────────────────────────────────────
  | 'act2_stayed_in_city'
  | 'act2_started_scavenging'
  | 'act2_fled_toward_suburbs'
  | 'draft_act2_frontier'

  // ── Preparation ──────────────────────────────────────────────────────────
  | 'prep_bought_plates'
  | 'prep_trap_strategy'
  | 'prep_door_fortified'
  | 'prep_hallway_trapped'
  | 'prep_weak_defense'
  | 'resource_energy_prepared'
  | 'resource_check'

  // ── Medical ───────────────────────────────────────────────────────────────
  | 'medical_disinfected_wound'
  | 'medical_has_first_aid_training'

  // ── Information gathering ─────────────────────────────────────────────────
  | 'info_searched_details'
  | 'info_knows_details'
  | 'info_knows_city_layout'
  | 'info_knows_infected_pattern'

  // ── Social ────────────────────────────────────────────────────────────────
  | 'social_warned_neighbor'
  | 'social_warned_neighbors'
  | 'social_checked_on_neighbors'

  // ── Shelter & mobility ────────────────────────────────────────────────────
  | 'shelter_has_home_base'
  | 'mobility_left_home_early'

  // ── NPC-specific ─────────────────────────────────────────────────────────
  | 'npc_pei_warning_received'
  | 'npc_helped_the_kid'

  // ── Risk / stealth ────────────────────────────────────────────────────────
  | 'risk_made_noise_at_hour_zero'
  | 'stealth_sealed_store_door'

  // ── Hidden / secret ───────────────────────────────────────────────────────
  | 'wrote_journal'           // enables secret ending
  | 'rested_at_safehouse'

// ─── Registry ─────────────────────────────────────────────────────────────────

export const FLAG_REGISTRY: FlagDefinition[] = [

  // ── Narrative / Early decisions ────────────────────────────────────────────

  {
    key: 'saw_patient_zero_video',
    description: 'Player saw the viral video of the first attack before the outbreak.',
    category: 'narrative',
    achievement: null,
  },
  {
    key: 'warned_a_stranger',
    description: 'Player showed the outbreak video to a stranger on the subway.',
    category: 'narrative',
    achievement: {
      id: 'achievement_good_samaritan',
      title: 'Good Samaritan',
      description: 'You warned someone you didn\'t have to.',
      icon: '🤝',
      secret: false,
    },
  },
  {
    key: 'warned_neighbors',
    description: 'Player warned their neighbours before the outbreak escalated.',
    category: 'narrative',
    achievement: null,
  },
  {
    key: 'researched_outbreak_early',
    description: 'Player researched the downtown situation before it became public knowledge.',
    category: 'narrative',
    achievement: null,
  },
  {
    key: 'went_to_city_hall_early',
    description: 'Player physically went to the outbreak site before Hour Zero.',
    category: 'narrative',
    achievement: {
      id: 'achievement_first_responder',
      title: 'First Responder',
      description: 'You went toward the danger when everyone else looked away.',
      icon: '🚨',
      secret: false,
    },
  },
  {
    key: 'prepped_early',
    description: 'Player gathered supplies before the outbreak was confirmed.',
    category: 'narrative',
    achievement: null,
  },

  // ── NPC encounters ─────────────────────────────────────────────────────────

  {
    key: 'met_doctor',
    description: 'Player has met Dr. Lena Marsh.',
    category: 'npc',
    achievement: null,
  },
  {
    key: 'met_militia_leader',
    description: 'Player has met Rook, the militia captain.',
    category: 'npc',
    achievement: null,
  },
  {
    key: 'met_collective_organizer',
    description: 'Player has met Yusuf, the collective organiser.',
    category: 'npc',
    achievement: null,
  },
  {
    key: 'met_the_kid',
    description: 'Player has encountered the unnamed child.',
    category: 'npc',
    achievement: null,
  },
  {
    key: 'met_ghost',
    description: 'Player has encountered Ghost, the Loner.',
    category: 'npc',
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
    key: 'betrayed_militia',
    description: 'Player betrayed the militia, burning that alliance permanently.',
    category: 'npc',
    achievement: null,
  },
  {
    key: 'betrayed_collective',
    description: 'Player betrayed the collective.',
    category: 'npc',
    achievement: null,
  },
  {
    key: 'deferred_clinic_offer',
    description: 'Player did not immediately accept Dr. Marsh\'s offer to join the clinic.',
    category: 'npc',
    achievement: null,
  },
  {
    key: 'intervened_at_pharmacy',
    description: 'Player stepped in during the pharmacy confrontation.',
    category: 'narrative',
    achievement: null,
  },

  // ── Faction membership ─────────────────────────────────────────────────────

  {
    key: 'joined_clinic',
    description: 'Player has committed to Dr. Marsh\'s clinic.',
    category: 'faction',
    achievement: null,
  },
  {
    key: 'joined_militia',
    description: 'Player has joined Rook\'s militia.',
    category: 'faction',
    achievement: null,
  },
  {
    key: 'joined_collective',
    description: 'Player has joined Yusuf\'s collective.',
    category: 'faction',
    achievement: null,
  },
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
  {
    key: 'knows_westfield_name',
    description: 'Player heard the name "Westfield Community Centre" as a potential safe zone.',
    category: 'world',
    achievement: null,
  },
  {
    key: 'located_westfield_signal',
    description: 'Player located the Westfield broadcast frequency using a radio.',
    category: 'world',
    achievement: null,
  },
  {
    key: 'knows_westfield_location',
    description: 'Player knows the exact location of Westfield.',
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
      description: 'A week in. Most didn\'t make it this far.',
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
      description: 'A year since it started. You\'re still here.',
      icon: '⏳',
      secret: false,
    },
  },

  // ── Hidden / secret ────────────────────────────────────────────────────────

  {
    key: 'wrote_journal',
    description: 'Player found and maintained a journal throughout the game. Enables the secret ending.',
    category: 'hidden',
    achievement: {
      id: 'achievement_the_record',
      title: 'The Record',
      description: 'Someone has to remember.',
      icon: '📓',
      secret: true,
    },
  },
  {
    key: 'rested_at_safehouse',
    description: 'Player rested at the safehouse.',
    category: 'hidden',
    achievement: null,
  },
]

// ─── Lookup Helpers ───────────────────────────────────────────────────────────

/** Get a flag definition by key. Returns undefined if not found. */
export function getFlagDefinition(key: GameFlag): FlagDefinition | undefined {
  return FLAG_REGISTRY.find(f => f.key === key)
}

/** Get all flags that have an achievement attached. */
export function getAchievementFlags(): FlagDefinition[] {
  return FLAG_REGISTRY.filter(f => f.achievement !== null)
}

/** Get all flags by category. */
export function getFlagsByCategory(category: FlagCategory): FlagDefinition[] {
  return FLAG_REGISTRY.filter(f => f.category === category)
}

/** Get all achievement definitions (flattened, nulls removed). */
export function getAllAchievements(): AchievementDefinition[] {
  return FLAG_REGISTRY
    .map(f => f.achievement)
    .filter((a): a is AchievementDefinition => a !== null)
}
