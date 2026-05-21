// ─── Flag Keys ───────────────────────────────────────────────────────────────
//
// AUTO-GENERATED — do not edit manually.
// Source of truth: src/data/zh/flags.json
// Regenerate:      pnpm gen-flags
//

// Tuple of every registered flag id. Used to derive KnownFlag and for
// runtime membership checks without importing the full flags.json.
export const FLAG_KEYS = [
  'act1_noticed_clues',
  'act1_ignored_clues',
  'medical_disinfected_wound',
  'medical_has_first_aid_training',
  'info_searched_details',
  'prep_bought_plates',
  'social_warned_neighbor',
  'prep_trap_strategy',
  'info_knows_details',
  'resource_energy_prepared',
  'resource_check',
  'social_warned_neighbors',
  'npc_pei_warning_received',
  'prep_door_fortified',
  'shelter_has_home_base',
  'prep_hallway_trapped',
  'risk_made_noise_at_hour_zero',
  'mobility_left_home_early',
  'info_knows_infected_pattern',
  'info_knows_city_layout',
  'prep_weak_defense',
  'act2_stayed_in_city',
  'act2_started_scavenging',
  'social_checked_on_neighbors',
  'act2_fled_toward_suburbs',
  'npc_helped_the_kid',
  'stealth_sealed_store_door',
  'draft_act2_frontier',
  'ending_survived_one_year',
  'faction_has_group',
  'ending_built_shelter',
  'npc_met_doctor',
  'faction_betrayed_militia',
] as const

// Union of every registered flag id — use this for type-safe flag references.
export type KnownFlag = (typeof FLAG_KEYS)[number]
