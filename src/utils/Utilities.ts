import { PlayerAgentConfig, TeamConfig } from '~/scenes/TeamMgmt'
import { PlayerRank } from './PlayerConstants'
import { Save, SaveKeys } from './Save'
import { LAST_NAMES, MALE_FIRST_NAMES } from './Names'

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

  public static getWinLossRatio(teamConfig: TeamConfig) {
    if (teamConfig.losses == 0) {
      return Number.MAX_SAFE_INTEGER
    }
    return teamConfig.wins / teamConfig.losses
  }

  public static getRankNameForEnum(rank: PlayerRank) {
    const ranks = [
      'BRONZE',
      'SILVER',
      'GOLD',
      'PLATINUM',
      'DIAMOND',
      'MASTER',
      'GRANDMASTER',
      'CHALLENGER',
    ]
    return ranks[rank]
  }

  public static getAbbrevRankNameForEnum(rank: PlayerRank) {
    const ranks = ['BRO', 'SIL', 'GOL', 'PLA', 'DIA', 'MAS', 'GM', 'CHA']
    return `${ranks[rank]}.`
  }

  public static getOverallRank(player: PlayerAgentConfig) {
    return Math.round(
      Object.values(player.attributes).reduce((acc, curr) => {
        return acc + curr
      }, 0) / Object.keys(player.attributes).length
    )
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
}
