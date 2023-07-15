import { MatchConfig, PlayerAgentConfig, TeamConfig } from '~/scenes/TeamMgmt/TeamMgmt'
import { MINIMUM_CONTRACT, PlayerAttributes, PlayerRank } from './PlayerConstants'
import { Save, SaveKeys } from './Save'
import { LAST_NAMES, MALE_FIRST_NAMES } from './Names'
import { RANK_TO_ASKING_AMOUNT_MAPPING } from './PlayerConstants'
import { CPU_TEAM_NAMES, NUM_DRAFT_PROSPECTS, SHORT_NAMES } from './TeamConstants'
import { Agent, MentalState } from '~/core/Agent'

export class Utilities {
  public static shuffle(array: any[]) {
    let currentIndex = array.length,
      randomIndex

    // While there remain elements to shuffle.
    while (currentIndex != 0) {
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex)
      currentIndex--

      // And swap it with the current element.
      ;[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]]
    }

    return array
  }

  public static processFreeAgents(undraftedPlayers: PlayerAgentConfig[]) {
    Save.setData(SaveKeys.FREE_AGENTS, undraftedPlayers)
  }

  public static generateRandomName() {
    const randFirstName = MALE_FIRST_NAMES[Phaser.Math.Between(0, MALE_FIRST_NAMES.length - 1)]
    const randLastName = LAST_NAMES[Phaser.Math.Between(0, LAST_NAMES.length - 1)]
    const convertToProperCase = (str) => {
      return `${str.slice(0, 1)}${str.slice(1).toLowerCase()}`
    }
    const firstNameProperCase = convertToProperCase(randFirstName)
    const lastNameProperCase = convertToProperCase(randLastName)
    return `${firstNameProperCase} ${lastNameProperCase}`
  }

  public static getTotalSalary(roster: PlayerAgentConfig[]) {
    return roster.reduce((acc, curr) => {
      return acc + curr.contract.salary
    }, 0)
  }

  public static getWinLossRatio(teamConfig: TeamConfig) {
    if (teamConfig.losses == 0) {
      return Number.MAX_SAFE_INTEGER
    }
    return teamConfig.wins / teamConfig.losses
  }

  public static getRankNameForEnum(rank: PlayerRank) {
    const ranks = [
      'BRONZE', // 55
      'SILVER', // 65
      'GOLD', // 75
      'PLATINUM', // 80
      'DIAMOND', // 85
      'MASTER', // 90
      'GRANDMASTER', // 95
      'CHALLENGER', // 99
    ]
    return ranks[rank]
  }

  public static getAbbrevRankNameForEnum(rank: PlayerRank) {
    const ranks = ['BRZ', 'SIL', 'GOL', 'PLA', 'DIA', 'MAS', 'GM', 'CHA']
    return `${ranks[rank]}`
  }

  public static getRatingNumberOutOf100(rank: PlayerRank) {
    const overallRating = [55, 65, 75, 80, 85, 90, 95, 99]
    return overallRating[rank]
  }

  public static getTradeValue(player: PlayerAgentConfig) {
    const overallRank = Utilities.getOverallPlayerRank(player)
    const overallOutOf100 = Utilities.getRatingNumberOutOf100(overallRank)
    const potential = player.potential
    const a = 0.00625
    const b = -0.7125
    const c = 21.28
    const overallStarValue = Math.round(a * Math.pow(overallOutOf100, 2) + b * overallOutOf100 + c)
    return overallStarValue + potential
  }

  public static getOverallPlayerRank(player: {
    attributes: {
      [key in PlayerAttributes]: PlayerRank
    }
  }) {
    return Math.round(
      Object.values(player.attributes).reduce((acc, curr) => {
        return acc + curr
      }, 0) / Object.keys(player.attributes).length
    )
  }

  public static getCPUControlledTeamFromSave() {
    const allTeams = Save.getData(SaveKeys.ALL_TEAM_CONFIGS) as { [key: string]: TeamConfig }
    const playerTeamName = Save.getData(SaveKeys.PLAYER_TEAM_NAME)
    return Object.values(allTeams).filter((teamConfig: TeamConfig) => {
      return teamConfig.name !== playerTeamName
    })
  }

  public static getPlayerTeamFromSave() {
    const allTeams = Save.getData(SaveKeys.ALL_TEAM_CONFIGS) as { [key: string]: TeamConfig }
    return allTeams[Save.getData(SaveKeys.PLAYER_TEAM_NAME)] as TeamConfig
  }

  public static updatePlayerTeamInSave(newPlayerTeam: TeamConfig) {
    const allTeams = Save.getData(SaveKeys.ALL_TEAM_CONFIGS) as { [key: string]: TeamConfig }
    allTeams[Save.getData(SaveKeys.PLAYER_TEAM_NAME)] = newPlayerTeam
    Save.setData(SaveKeys.ALL_TEAM_CONFIGS, allTeams)
  }

  public static convertRookies() {
    const allTeams = Save.getData(SaveKeys.ALL_TEAM_CONFIGS) as { [key: string]: TeamConfig }
    Object.values(allTeams).forEach((teamConfig: TeamConfig) => {
      const newRoster = teamConfig.roster.map((playerAgent: PlayerAgentConfig) => {
        if (playerAgent.isRookie) {
          return {
            ...playerAgent,
            isRookie: false,
          }
        }
        return playerAgent
      })
      allTeams[teamConfig.name].roster = newRoster
    })
    Save.setData(SaveKeys.ALL_TEAM_CONFIGS, allTeams)
  }

  public static decrementContractDurations() {
    const allTeams = Save.getData(SaveKeys.ALL_TEAM_CONFIGS) as { [key: string]: TeamConfig }
    Object.values(allTeams).forEach((teamConfig: TeamConfig) => {
      const newTeamRoster = teamConfig.roster.map((playerAgent: PlayerAgentConfig) => {
        return {
          ...playerAgent,
          contract: {
            ...playerAgent.contract,
            duration: Math.max(0, playerAgent.contract.duration - 1),
          },
        }
      })
      allTeams[teamConfig.name].roster = newTeamRoster
    })
    Save.setData(SaveKeys.ALL_TEAM_CONFIGS, allTeams)
  }

  static getAskingAmount(player: PlayerAgentConfig) {
    const overall = Utilities.getOverallPlayerRank(player) as PlayerRank
    return RANK_TO_ASKING_AMOUNT_MAPPING[overall]
  }

  static getExtensionEstimate(player: PlayerAgentConfig, duration: number) {
    const contract = player.contract
    const currDuration = contract.duration
    let askingAmount = Math.max(contract.salary, Utilities.getAskingAmount(player))

    // Factor in potentials
    const potentialMultiplier = 0.15 * player.potential + 0.8
    askingAmount *= potentialMultiplier

    // Factor in duration
    const durationMultiplier = 1.46429 - 0.0714286 * (duration + currDuration)
    askingAmount *= durationMultiplier
    askingAmount = Math.floor(askingAmount)

    // If hero is a rookie, the max they can ask for is 10
    return player.isRookie ? Math.min(askingAmount, 10) : Math.min(askingAmount, 40)
  }

  static getRandomAttrRank() {
    // 70% chance to be bronze, 20% chance for silver, 10% chance for gold
    const randNum = Phaser.Math.Between(1, 100)
    if (randNum > 0 && randNum <= 75) {
      return PlayerRank.BRONZE
    }
    if (randNum > 75 && randNum <= 90) {
      return PlayerRank.SILVER
    }
    return PlayerRank.GOLD
  }

  static applyMentalStateModifier(attributeType: PlayerAttributes, agent: Agent, value: number) {
    const mentalStat = agent.stats.mental
    if (mentalStat) {
      switch (attributeType) {
        case PlayerAttributes.HEADSHOT:
        case PlayerAttributes.ACCURACY: {
          if (agent.mentalState === MentalState.HOT_STREAK) {
            return value * (1 + mentalStat.hotStreakBuff)
          } else if (agent.mentalState === MentalState.COLD_STREAK) {
            return value * (1 - mentalStat.coldStreakDebuff)
          }
          return value
        }
        case PlayerAttributes.REACTION: {
          // Reaction time = smaller is better
          if (agent.mentalState === MentalState.HOT_STREAK) {
            return value * (1 - mentalStat.hotStreakBuff)
          } else if (agent.mentalState === MentalState.COLD_STREAK) {
            return value * (1 + mentalStat.coldStreakDebuff)
          }
          return value
        }
        default: {
          return value
        }
      }
    }
    return value
  }

  static generateTeams() {
    const shuffledCPUTeamNames = Utilities.shuffle([...CPU_TEAM_NAMES])
    const allTeams = shuffledCPUTeamNames.map((teamName) => {
      return {
        name: teamName,
        shortName: SHORT_NAMES[teamName],
        wins: 0,
        losses: 0,
        roster: Utilities.generateNewPlayers(teamName),
      }
    })
    const teamNameToObjMapping = allTeams.reduce((acc, curr) => {
      acc[curr.name] = curr
      return acc
    }, {})
    return teamNameToObjMapping
  }

  static generateSchedule(otherTeamConfigs: TeamConfig[]): MatchConfig[] {
    const result: MatchConfig[] = []
    otherTeamConfigs.forEach((team) => {
      result.push({
        isHome: true,
        opponent: team.name,
        shortName: SHORT_NAMES[team.name],
      })
      result.push({
        isHome: false,
        opponent: team.name,
        shortName: SHORT_NAMES[team.name],
      })
    })
    return Utilities.shuffle([...result])
  }

  static generateNewPlayers(teamName: string, numPlayers: number = 3): PlayerAgentConfig[] {
    const newPlayers: PlayerAgentConfig[] = []
    for (let i = 1; i <= numPlayers; i++) {
      const randomName = Utilities.generateRandomName()
      newPlayers.push({
        id: `${teamName}-player-${i}`,
        name: randomName,
        isStarting: true,
        isRookie: true,
        texture: '',
        potential: Phaser.Math.Between(0, 2),
        contract: {
          ...MINIMUM_CONTRACT,
        },
        attributes: {
          [PlayerAttributes.ACCURACY]: PlayerRank.BRONZE,
          [PlayerAttributes.HEADSHOT]: PlayerRank.BRONZE,
          [PlayerAttributes.REACTION]: PlayerRank.BRONZE,
          [PlayerAttributes.MENTAL]: PlayerRank.BRONZE,
        },
        experience: {
          [PlayerAttributes.ACCURACY]: 0,
          [PlayerAttributes.HEADSHOT]: 0,
          [PlayerAttributes.REACTION]: 0,
          [PlayerAttributes.MENTAL]: 0,
        },
      })
    }
    return newPlayers
  }

  static generateDraftProspects() {
    const newPlayers: PlayerAgentConfig[] = []
    for (let i = 1; i <= NUM_DRAFT_PROSPECTS; i++) {
      const randomName = Utilities.generateRandomName()
      newPlayers.push({
        id: `draft-prospect-${i}`,
        name: randomName,
        isStarting: false,
        isRookie: true,
        texture: '',
        potential: Phaser.Math.Between(0, 2),
        attributes: {
          [PlayerAttributes.ACCURACY]: Utilities.getRandomAttrRank(),
          [PlayerAttributes.HEADSHOT]: Utilities.getRandomAttrRank(),
          [PlayerAttributes.REACTION]: Utilities.getRandomAttrRank(),
          [PlayerAttributes.MENTAL]: Utilities.getRandomAttrRank(),
        },
        contract: { ...MINIMUM_CONTRACT },
        experience: {
          [PlayerAttributes.ACCURACY]: 0,
          [PlayerAttributes.HEADSHOT]: 0,
          [PlayerAttributes.REACTION]: 0,
          [PlayerAttributes.MENTAL]: 0,
        },
      })
    }
    return newPlayers
  }
}
