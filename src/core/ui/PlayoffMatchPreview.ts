import { RoundConstants } from '~/utils/RoundConstants'
import { UpcomingMatchTeam } from './UpcomingMatchTeam'
import TeamMgmt from '~/scenes/TeamMgmt/TeamMgmt'
import { Button } from './Button'
import { LinkText } from './LinkText'
import { PlayoffMatchup, PlayoffMatchupTeam } from '~/scenes/TeamMgmt/Playoffs/PlayoffsScreen'

export interface PlayoffMatchPreviewConfig {
  width: number
  height: number
  x: number
  y: number
  matchup: PlayoffMatchup
  onStartMatch: Function
  onViewLineups: Function
}

export class PlayoffMatchPreview {
  private scene: TeamMgmt
  private team1!: UpcomingMatchTeam
  private team2!: UpcomingMatchTeam
  private rectangle: Phaser.GameObjects.Rectangle
  private startMatchButton!: Button
  private viewStartingLineupsLink!: LinkText

  constructor(scene: TeamMgmt, config: PlayoffMatchPreviewConfig) {
    this.scene = scene
    this.rectangle = this.scene.add.rectangle(
      config.x,
      config.y,
      config.width,
      config.height,
      0xffffff
    )

    const playoffMatchup = config.matchup
    this.rectangle.setStrokeStyle(1, 0x000000).setDepth(RoundConstants.SORT_LAYERS.UI)
    this.team1 = new UpcomingMatchTeam(this.scene, {
      teamConfig: {
        name: playoffMatchup.team1.fullTeamName,
        wins: playoffMatchup.team1.score,
        losses: playoffMatchup.team2.score,
      },
      position: {
        x: this.rectangle.x - this.rectangle.displayWidth / 2 + 150,
        y: this.rectangle.y - 50,
      },
    })
    this.team2 = new UpcomingMatchTeam(this.scene, {
      teamConfig: {
        name: playoffMatchup.team2.fullTeamName,
        wins: playoffMatchup.team2.score,
        losses: playoffMatchup.team1.score,
      },
      position: {
        x: this.rectangle.x + this.rectangle.displayWidth / 2 - 150,
        y: this.rectangle.y - 50,
      },
    })
    this.setupMatchButton(config)
    this.setupViewStartingLineupsLink(config)
  }

  setupViewStartingLineupsLink(config: PlayoffMatchPreviewConfig) {
    this.viewStartingLineupsLink = new LinkText(this.scene, {
      text: 'View Starting Lineups',
      onClick: () => {
        config.onViewLineups()
      },
      position: {
        x: this.startMatchButton.x,
        y: this.startMatchButton.y + 50,
      },
      depth: RoundConstants.SORT_LAYERS.UI,
    })
  }

  setupMatchButton(config: PlayoffMatchPreviewConfig) {
    this.startMatchButton = new Button({
      scene: this.scene,
      x: this.rectangle.x,
      y: this.rectangle.y + 150,
      width: 200,
      height: 50,
      text: 'Start Match',
      backgroundColor: 0x444444,
      onClick: () => {
        config.onStartMatch()
      },
      fontSize: '20px',
      textColor: 'white',
      strokeColor: 0x000000,
      strokeWidth: 1,
      depth: RoundConstants.SORT_LAYERS.UI,
    })
  }

  destroy() {
    this.team1.destroy()
    this.team2.destroy()
    this.rectangle.destroy()
    this.startMatchButton.destroy()
    this.viewStartingLineupsLink.destroy()
  }

  setVisible(isVisible: boolean) {
    this.team1.setVisible(isVisible)
    this.team2.setVisible(isVisible)
    this.rectangle.setVisible(isVisible)
    this.startMatchButton.setVisible(isVisible)
    this.viewStartingLineupsLink.setVisible(isVisible)
  }

  updatePlayerMatchup(team1: PlayoffMatchupTeam, team2: PlayoffMatchupTeam) {
    if (this.team1) {
      this.team1.destroy()
    }
    if (this.team2) {
      this.team2.destroy()
    }
    this.team1 = new UpcomingMatchTeam(this.scene, {
      teamConfig: {
        name: team1.fullTeamName,
        wins: team1.score,
        losses: team2.score,
      },
      position: {
        x: this.rectangle.x - this.rectangle.displayWidth / 2 + 150,
        y: this.rectangle.y - 50,
      },
    })
    this.team2 = new UpcomingMatchTeam(this.scene, {
      teamConfig: {
        name: team2.fullTeamName,
        wins: team2.score,
        losses: team1.score,
      },
      position: {
        x: this.rectangle.x + this.rectangle.displayWidth / 2 - 150,
        y: this.rectangle.y - 50,
      },
    })
  }
}
