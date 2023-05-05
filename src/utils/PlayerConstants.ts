export enum PlayerRank {
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM',
  DIAMOND = 'DIAMOND',
  MASTER = 'MASTER',
  GRANDMASTER = 'GRANDMASTER',
  CHALLENGER = 'CHALLENGER',
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