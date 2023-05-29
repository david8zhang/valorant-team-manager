export enum PlayerPotential {
  HIGH,
  MEDIUM,
  LOW,
}

export enum PlayerAttributes {
  ACCURACY = 'accuracy',
  REACTION = 'reaction',
  HEADSHOT = 'headshot',
}

export const PLAYER_ATTRIBUTE_ABBREV = {
  [PlayerAttributes.ACCURACY]: 'Acc.',
  [PlayerAttributes.REACTION]: 'React.',
  [PlayerAttributes.HEADSHOT]: 'HS',
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

export const DEFAULT_CONTRACT = {
  duration: 3,
  salary: 5,
}
