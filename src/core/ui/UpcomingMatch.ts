import TeamMgmt, { TeamConfig } from '~/scenes/TeamMgmt/TeamMgmt'
import { RoundConstants } from '~/utils/RoundConstants'
import { UpcomingMatchTeam } from './UpcomingMatchTeam'

export interface UpcomingMatchConfig {
  homeTeam: TeamConfig
  awayTeam: TeamConfig
}

export class UpcomingMatch {
  private scene: TeamMgmt
  private homeTeam!: UpcomingMatchTeam
  private awayTeam!: UpcomingMatchTeam

  private static TEAM_START_X = 320
  private static TEAM_START_Y = RoundConstants.WINDOW_HEIGHT / 2

  constructor(scene: TeamMgmt, config: UpcomingMatchConfig) {
    this.scene = scene
    this.awayTeam = new UpcomingMatchTeam(this.scene, {
      teamConfig: config.awayTeam,
      position: {
        x: UpcomingMatch.TEAM_START_X,
        y: UpcomingMatch.TEAM_START_Y,
      },
    })
    this.homeTeam = new UpcomingMatchTeam(this.scene, {
      teamConfig: config.homeTeam,
      position: {
        x: UpcomingMatch.TEAM_START_X + 215,
        y: UpcomingMatch.TEAM_START_Y,
      },
    })
  }

  updateTeams(homeTeam: TeamConfig, awayTeam: TeamConfig) {
    this.homeTeam.updateTeamInfo(homeTeam)
    this.awayTeam.updateTeamInfo(awayTeam)
  }

  setVisible(isVisible: boolean) {
    this.awayTeam.setVisible(isVisible)
    this.homeTeam.setVisible(isVisible)
  }
}
