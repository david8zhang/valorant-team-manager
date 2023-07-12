export enum PlayerPotential {
  HIGH,
  MEDIUM,
  LOW,
}

export enum PlayerAttributes {
  ACCURACY = 'accuracy',
  REACTION = 'reaction',
  HEADSHOT = 'headshot',
  MENTAL = 'mental',
}

export const PLAYER_ATTRIBUTE_ABBREV = {
  [PlayerAttributes.ACCURACY]: 'Acc.',
  [PlayerAttributes.REACTION]: 'React.',
  [PlayerAttributes.HEADSHOT]: 'HS',
  [PlayerAttributes.MENTAL]: 'Mental',
}

export enum PlayerRank {
  BRONZE,
  SILVER,
  GOLD,
  PLATINUM,
  DIAMOND,
  MASTER,
  GRANDMASTER,
  CHALLENGER,
}

export const RANK_TO_ASKING_AMOUNT_MAPPING = {
  [PlayerRank.BRONZE]: 5,
  [PlayerRank.SILVER]: 10,
  [PlayerRank.GOLD]: 15,
  [PlayerRank.PLATINUM]: 20,
  [PlayerRank.DIAMOND]: 25,
  [PlayerRank.MASTER]: 30,
  [PlayerRank.GRANDMASTER]: 35,
  [PlayerRank.CHALLENGER]: 40,
}

export const RANK_TO_ACCURACY_MAPPING = {
  [PlayerRank.BRONZE]: 25,
  [PlayerRank.SILVER]: 40,
  [PlayerRank.GOLD]: 50,
  [PlayerRank.PLATINUM]: 60,
  [PlayerRank.DIAMOND]: 70,
  [PlayerRank.MASTER]: 80,
  [PlayerRank.GRANDMASTER]: 85,
  [PlayerRank.CHALLENGER]: 90,
}

export const RANK_TO_HS_MAPPING = {
  [PlayerRank.BRONZE]: 5,
  [PlayerRank.SILVER]: 10,
  [PlayerRank.GOLD]: 20,
  [PlayerRank.PLATINUM]: 30,
  [PlayerRank.DIAMOND]: 40,
  [PlayerRank.MASTER]: 55,
  [PlayerRank.GRANDMASTER]: 60,
  [PlayerRank.CHALLENGER]: 65,
}

export const RANK_TO_REACTION_MAPPING = {
  [PlayerRank.BRONZE]: 350,
  [PlayerRank.SILVER]: 300,
  [PlayerRank.GOLD]: 250,
  [PlayerRank.PLATINUM]: 225,
  [PlayerRank.DIAMOND]: 200,
  [PlayerRank.MASTER]: 175,
  [PlayerRank.GRANDMASTER]: 170,
  [PlayerRank.CHALLENGER]: 165,
}

// "Mental" stat is a multi-faceted stat which allows players to get into "hot streaks" (buff to stats) and "cold streaks" (debuff to stats)
// Every 3 kills, there's a chance to go into a hot streak
// Every 3 deaths, there's a chance to go into a cold streak
export const RANK_TO_MENTAL_MAPPING = {
  [PlayerRank.BRONZE]: {
    hotStreakPct: 0.05,
    coldStreakPct: 0.25,
    hotStreakBuff: 0.05,
    coldStreakDebuff: 0.35,
  },
  [PlayerRank.SILVER]: {
    hotStreakPct: 0.1,
    coldStreakPct: 0.2,
    hotStreakBuff: 0.075,
    coldStreakDebuff: 0.3,
  },
  [PlayerRank.GOLD]: {
    hotStreakPct: 0.15,
    coldStreakPct: 0.15,
    hotStreakBuff: 0.1,
    coldStreakDebuff: 0.25,
  },
  [PlayerRank.PLATINUM]: {
    hotStreakPct: 0.2,
    coldStreakPct: 0.1,
    hotStreakBuff: 0.15,
    coldStreakDebuff: 0.2,
  },
  [PlayerRank.DIAMOND]: {
    hotStreakPct: 0.25,
    coldStreakPct: 0.05,
    hotStreakBuff: 0.2,
    coldStreakDebuff: 0.15,
  },
  [PlayerRank.MASTER]: {
    hotStreakPct: 0.3,
    coldStreakPct: 0.025,
    hotStreakBuff: 0.25,
    coldStreakDebuff: 0.1,
  },
  [PlayerRank.GRANDMASTER]: {
    hotStreakPct: 0.35,
    coldStreakPct: 0.02,
    hotStreakBuff: 0.3,
    coldStreakDebuff: 0.075,
  },
  [PlayerRank.CHALLENGER]: {
    hotStreakPct: 0.4,
    coldStreakPct: 0.01,
    hotStreakBuff: 0.35,
    coldStreakDebuff: 0.05,
  },
}

export const MENTAL_RANK_DESC_MAPPING = {
  [PlayerRank.BRONZE]: ['Erratic', 'Immature', 'Nervous'],
  [PlayerRank.SILVER]: ['Unsteady', 'Inexperienced'],
  [PlayerRank.GOLD]: ['Average', 'Mild'],
  [PlayerRank.PLATINUM]: ['Solid', 'Reliable'],
  [PlayerRank.DIAMOND]: ['Composed', 'Relaxed'],
  [PlayerRank.MASTER]: ['Experienced', 'Poised'],
  [PlayerRank.GRANDMASTER]: ['Immovable', 'Professional'],
  [PlayerRank.CHALLENGER]: ['Godlike', 'Invincible', 'Killer', 'Masterful'],
}

export const PLAYER_POTENTIAL_TO_EXP_MAPPING = {
  [PlayerPotential.LOW]: {
    low: 5,
    high: 15,
  },
  [PlayerPotential.MEDIUM]: {
    low: 10,
    high: 20,
  },
  [PlayerPotential.HIGH]: {
    low: 15,
    high: 25,
  },
}

export const MINIMUM_CONTRACT = {
  duration: 1,
  salary: 5,
}
