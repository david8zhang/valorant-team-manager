import { Side } from '~/core/Agent'
import { RoundConstants } from '~/utils/RoundConstants'
import { TeamConfig } from './TeamMgmt'
import { PostRoundScreenKeys } from './screens/ScreenKeys'
import { PostRoundTeamStatsScreen } from './screens/PostRound/PostRoundTeamStatsScreen'
import { PostRoundPlayerStatsScreen } from './screens/PostRound/PostRoundPlayerStatsScreen'
import { PostRoundPlayerExpScreen } from './screens/PostRound/PostRoundPlayerExpScreen'

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
}
