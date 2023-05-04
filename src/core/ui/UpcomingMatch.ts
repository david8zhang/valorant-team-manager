import TeamMgmt, { TeamConfig } from '~/scenes/TeamMgmt'
import { Constants } from '~/utils/Constants'

export interface UpcomingMatchConfig {
  homeTeam: TeamConfig
  awayTeam: TeamConfig
  allTeamConfigs: TeamConfig[]
}

export class UpcomingMatch {
  private scene: TeamMgmt
  private group: Phaser.GameObjects.Group
  private static TEAM_START_X = 320
  private static TEAM_START_Y = Constants.WINDOW_HEIGHT / 2

  constructor(scene: TeamMgmt, config: UpcomingMatchConfig) {
    this.scene = scene
    this.group = this.scene.add.group()
    const awayTeamRect = this.renderTeam(
      config.awayTeam,
      UpcomingMatch.TEAM_START_X,
      UpcomingMatch.TEAM_START_Y
    )
    const homeTeamRect = this.renderTeam(
      config.homeTeam,
      UpcomingMatch.TEAM_START_X + awayTeamRect.displayWidth + 15,
      UpcomingMatch.TEAM_START_Y
    )
  }

  setVisible(isVisible: boolean) {
    this.group.setVisible(isVisible)
  }

  renderTeam(teamConfig: TeamConfig, x: number, y: number) {
    const bgRect = this.scene.add.rectangle(x, y, 200, 200, 0xffffff).setStrokeStyle(0, 0x000000)
    const image = this.scene.add.sprite(x, y, '')
    const teamName = this.scene.add.text(
      image.x,
      image.y + image.displayHeight / 2 + 20,
      teamConfig.name,
      {
        fontSize: '18px',
        color: 'black',
      }
    )
    teamName.setPosition(
      teamName.x - teamName.displayWidth / 2,
      teamName.y - teamName.displayHeight / 2
    )
    const record = this.scene.add.text(
      teamName.x,
      teamName.y,
      `${teamConfig.wins}W - ${teamConfig.losses}L`,
      {
        fontSize: '15px',
        color: 'black',
      }
    )
    record.setPosition(
      image.x - record.displayWidth / 2,
      teamName.y + teamName.displayHeight + 15 - record.displayHeight / 2
    )
    this.group.add(image)
    this.group.add(bgRect)
    this.group.add(teamName)
    this.group.add(record)
    return bgRect
  }
}
