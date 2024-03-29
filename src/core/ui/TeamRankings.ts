import TeamMgmt, { TeamConfig } from '~/scenes/TeamMgmt/TeamMgmt'
import { RoundConstants } from '~/utils/RoundConstants'
import { Utilities } from '~/utils/Utilities'

export interface TeamRankingsConfig {
  allTeams: TeamConfig[]
}

export class TeamRankings {
  private scene: TeamMgmt
  private group: Phaser.GameObjects.Group
  private titleText: Phaser.GameObjects.Text
  private bgRect: Phaser.GameObjects.Rectangle
  public static START_X = 665

  constructor(scene: TeamMgmt, config: TeamRankingsConfig) {
    this.scene = scene
    this.group = this.scene.add.group()
    this.titleText = this.scene.add.text(
      (TeamRankings.START_X + RoundConstants.WINDOW_WIDTH) / 2,
      50,
      'Team Rankings',
      {
        fontSize: '25px',
        color: 'black',
        align: 'center',
      }
    )
    this.titleText.setWordWrapWidth(RoundConstants.WINDOW_WIDTH - TeamRankings.START_X - 50)
    this.titleText.setPosition(
      (TeamRankings.START_X + RoundConstants.WINDOW_WIDTH) / 2 - this.titleText.displayWidth / 2,
      50
    )
    this.bgRect = this.scene.add
      .rectangle(
        TeamRankings.START_X - 10,
        0,
        RoundConstants.WINDOW_WIDTH - TeamRankings.START_X + 20,
        RoundConstants.WINDOW_HEIGHT
      )
      .setOrigin(0)
    this.bgRect.setStrokeStyle(1, 0x000000)
    this.setupRankings(config)
  }

  setupRankings(config: TeamRankingsConfig) {
    let yPos = 125
    const sortedByRanking = config.allTeams.sort((a, b) => {
      return Utilities.getWinLossRatio(b) - Utilities.getWinLossRatio(a)
    })

    sortedByRanking.forEach((team: TeamConfig) => {
      const teamName = this.scene.add.text(TeamRankings.START_X, yPos, team.name, {
        fontSize: '12px',
        color: 'black',
      })
      const record = this.scene.add.text(
        RoundConstants.WINDOW_WIDTH,
        yPos,
        `${team.wins}W - ${team.losses}L`,
        {
          fontSize: '12px',
          color: 'black',
        }
      )
      record.setPosition(RoundConstants.WINDOW_WIDTH - record.displayWidth - 10, yPos)
      this.group.add(teamName)
      this.group.add(record)
      yPos += teamName.displayHeight + 15
    })
  }

  updateRankings(allTeams: TeamConfig[]) {
    this.group.clear(true, true)
    this.setupRankings({ allTeams })
  }

  setVisible(isVisible: boolean) {
    this.group.setVisible(isVisible)
    this.titleText.setVisible(isVisible)
    this.bgRect.setVisible(isVisible)
  }
}
