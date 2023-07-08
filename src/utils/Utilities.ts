import { PlayerAgentConfig, TeamConfig } from '~/scenes/TeamMgmt'
import { PlayerAttributes, PlayerRank } from './PlayerConstants'
import { Save, SaveKeys } from './Save'
import { LAST_NAMES, MALE_FIRST_NAMES } from './Names'
import { RANK_TO_ASKING_AMOUNT_MAPPING } from './PlayerConstants'

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
}
