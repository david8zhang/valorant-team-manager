import { Side } from '~/core/Agent'
import { RoundConstants } from '~/utils/RoundConstants'
import { TeamConfig } from './TeamMgmt'
import { PostRoundScreenKeys } from './screens/ScreenKeys'
import { PostRoundTeamStatsScreen } from './screens/PostRound/PostRoundTeamStatsScreen'
import { PostRoundPlayerStatsScreen } from './screens/PostRound/PostRoundPlayerStatsScreen'
import { PostRoundPlayerExpScreen } from './screens/PostRound/PostRoundPlayerExpScreen'
import { ExpGrowthMapping, SimulationUtils } from '~/utils/SimulationUtils'
import { Utilities } from '~/utils/Utilities'
import { Save, SaveKeys } from '~/utils/Save'

export interface TeamStatConfig {
  totalKills: number
  totalAssists: number
  totalDeaths: number
}

export interface PlayerStatConfig {
  kills: number
  assists: number
  deaths: number
  teamMvp: boolean
  matchMvp: boolean
}

export interface PostRoundConfig {
  winningSide: Side
  teamStats: {
    [key in Side]: TeamStatConfig
  }
  playerStats: {
    [key in Side]: {
      [key: string]: PlayerStatConfig
    }
  }
  cpuTeamConfig: TeamConfig
  playerTeamConfig: TeamConfig
  isPlayoffGame: boolean
}

export class PostRound extends Phaser.Scene {
  public winningSide!: Side
  public teamStats!: {
    [key in Side]: {
      totalKills: number
      totalAssists: number
      totalDeaths: number
    }
  }
  public playerStats!: {
    [key in Side]: {
      [key: string]: {
        kills: number
        assists: number
        deaths: number
        teamMvp: boolean
        matchMvp: boolean
      }
    }
  }
  public playerTeamConfig!: TeamConfig
  public cpuTeamConfig!: TeamConfig
  public screens!: {
    [key in PostRoundScreenKeys]: any
  }
  public activeScreenKey: PostRoundScreenKeys = PostRoundScreenKeys.TEAM_STATS

  init(data: PostRoundConfig) {
    this.winningSide = data.winningSide
    this.teamStats = data.teamStats
    this.playerStats = data.playerStats
    this.playerTeamConfig = data.playerTeamConfig
    this.cpuTeamConfig = data.cpuTeamConfig
  }

  constructor() {
    super('post-round')
  }

  create() {
    this.cameras.main.setBackgroundColor(0xffffff)
    const bgRect = this.add
      .rectangle(1, 0, RoundConstants.WINDOW_WIDTH - 2, RoundConstants.WINDOW_HEIGHT - 2)
      .setStrokeStyle(1, 0x000000)
      .setOrigin(0)
    this.screens = {
      [PostRoundScreenKeys.TEAM_STATS]: new PostRoundTeamStatsScreen(this),
      [PostRoundScreenKeys.PLAYER_STATS]: new PostRoundPlayerStatsScreen(this),
      [PostRoundScreenKeys.PLAYER_EXP]: new PostRoundPlayerExpScreen(this),
    }
    this.renderActiveScreen(PostRoundScreenKeys.TEAM_STATS)
  }

  renderActiveScreen(newActiveScreenKey: PostRoundScreenKeys) {
    if (this.activeScreenKey) {
      const prevActiveScreen = this.screens[this.activeScreenKey]
      prevActiveScreen.setVisible(false)
    }
    this.activeScreenKey = newActiveScreenKey
    const newActiveScreen = this.screens[this.activeScreenKey]
    newActiveScreen.onRender()
    newActiveScreen.setVisible(true)
  }

  simulateOtherTeamMatches() {
    const allTeams = Save.getData(SaveKeys.ALL_TEAM_CONFIGS) as { [key: string]: TeamConfig }
    const teamsToSimulate = Object.values(allTeams).filter((team: TeamConfig) => {
      return team.name !== this.cpuTeamConfig.name && team.name !== this.playerTeamConfig.name
    })
    const shuffledTeams = Utilities.shuffle([...teamsToSimulate])
    const matchups: TeamConfig[][] = []
    for (let i = 0; i <= shuffledTeams.length - 2; i += 2) {
      const matchup = [shuffledTeams[i], shuffledTeams[i + 1]]
      matchups.push(matchup)
    }
    const matchResults = SimulationUtils.simulateMatches(matchups)
    return SimulationUtils.applyMatchResults(matchResults, true)
  }

  applyExpGrowthForTeams(playerTeam: TeamConfig, cpuTeam: TeamConfig, playerExpGrowthMapping: any) {
    SimulationUtils.applyExpGrowth(playerTeam, playerExpGrowthMapping)
    const cpuExpGrowthMapping = SimulationUtils.createPlayerExpGrowthMapping(
      cpuTeam,
      this.playerStats[Side.CPU],
      this.winningSide === Side.CPU
    )
    SimulationUtils.applyExpGrowth(cpuTeam, cpuExpGrowthMapping)
  }

  simulateOtherTeamsAndProgressSeason(playerTeam: TeamConfig, cpuTeam: TeamConfig) {
    const otherTeams = this.simulateOtherTeamMatches()
    const newAllTeams = otherTeams
      .concat(cpuTeam)
      .concat(playerTeam)
      .reduce((acc, curr) => {
        acc[curr.name] = curr
        return acc
      }, {})
    Save.setData(SaveKeys.ALL_TEAM_CONFIGS, newAllTeams)
    const currMatchIndex = Save.getData(SaveKeys.CURR_MATCH_INDEX)
    const seasonSchedule = Save.getData(SaveKeys.SEASON_SCHEDULE)
    Save.setData(SaveKeys.CURR_MATCH_INDEX, Math.min(currMatchIndex + 1, seasonSchedule.length))
  }

  goToTeamMgmtScreen() {
    this.scene.start('team-mgmt')
  }

  updateTeamWinLossRecord(playerTeam: TeamConfig, cpuTeam: TeamConfig) {
    if (this.winningSide === Side.PLAYER) {
      playerTeam.wins++
      cpuTeam.losses++
    } else {
      playerTeam.losses++
      cpuTeam.wins++
    }
  }

  handlePostRoundFinished(playerExpGrowthMapping: ExpGrowthMapping) {
    this.applyExpGrowthForTeams(this.playerTeamConfig, this.cpuTeamConfig, playerExpGrowthMapping)
    this.updateTeamWinLossRecord(this.playerTeamConfig, this.cpuTeamConfig)
    this.simulateOtherTeamsAndProgressSeason(this.playerTeamConfig, this.cpuTeamConfig)
    this.goToTeamMgmtScreen()
  }
}
