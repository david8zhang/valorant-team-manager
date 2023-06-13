import { Scene } from 'phaser'
import { RoundConstants } from '~/utils/RoundConstants'
import { UpcomingMatchTeam } from './UpcomingMatchTeam'
import TeamMgmt, { MatchConfig, TeamConfig } from '~/scenes/TeamMgmt'
import { Button } from './Button'
import { LinkText } from './LinkText'
import { ScreenKeys } from '~/scenes/screens/ScreenKeys'
import { Save, SaveKeys } from '~/utils/Save'

export interface PlayoffMatchPreviewConfig {
  width: number
  height: number
  x: number
  y: number
  homeTeam: TeamConfig
  awayTeam: TeamConfig
}

export class PlayoffMatchPreview {
  private scene: TeamMgmt
  private homeTeam!: UpcomingMatchTeam
  private awayTeam!: UpcomingMatchTeam
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
    this.rectangle.setStrokeStyle(1, 0x000000).setDepth(RoundConstants.SORT_LAYERS.UI)
    this.awayTeam = new UpcomingMatchTeam(this.scene, {
      teamConfig: config.awayTeam,
      position: {
        x: this.rectangle.x - this.rectangle.displayWidth / 2 + 150,
        y: this.rectangle.y - 50,
      },
    })
    this.homeTeam = new UpcomingMatchTeam(this.scene, {
      teamConfig: config.homeTeam,
      position: {
        x: this.rectangle.x + this.rectangle.displayWidth / 2 - 150,
        y: this.rectangle.y - 50,
      },
    })
    this.setupMatchButton()
    this.setupViewStartingLineupsLink(config)
  }

  setupViewStartingLineupsLink(config: PlayoffMatchPreviewConfig) {
    this.viewStartingLineupsLink = new LinkText(this.scene, {
      text: 'View Starting Lineups',
      onClick: () => {
        const playerTeamName = Save.getData(SaveKeys.PLAYER_TEAM_NAME)
        const opponentTeamConfig =
          config.awayTeam.name === playerTeamName ? config.homeTeam : config.awayTeam
        this.setVisible(false)
        this.scene.renderActiveScreen(ScreenKeys.VIEW_LINEUPS, {
          opponentTeam: opponentTeamConfig,
        })
      },
      position: {
        x: this.startMatchButton.x,
        y: this.startMatchButton.y + 50,
      },
      depth: RoundConstants.SORT_LAYERS.UI,
    })
  }

  setupMatchButton() {
    this.startMatchButton = new Button({
      scene: this.scene,
      x: this.rectangle.x,
      y: this.rectangle.y + 150,
      width: 200,
      height: 50,
      text: 'Start Match',
      backgroundColor: 0x444444,
      onClick: () => {
        // this.scene.startGame()
      },
      fontSize: '20px',
      textColor: 'white',
      strokeColor: 0x000000,
      strokeWidth: 1,
      depth: RoundConstants.SORT_LAYERS.UI,
    })
  }

  destroy() {
    this.awayTeam.destroy()
    this.homeTeam.destroy()
    this.rectangle.destroy()
    this.startMatchButton.destroy()
    this.viewStartingLineupsLink.destroy()
  }

  setVisible(isVisible: boolean) {
    this.awayTeam.setVisible(isVisible)
    this.homeTeam.setVisible(isVisible)
    this.rectangle.setVisible(isVisible)
    this.startMatchButton.setVisible(isVisible)
    this.viewStartingLineupsLink.setVisible(isVisible)
  }

  updatePlayerMatchup(homeTeam: TeamConfig, awayTeam: TeamConfig) {
    if (this.awayTeam) {
      this.awayTeam.destroy()
    }
    if (this.homeTeam) {
      this.homeTeam.destroy()
    }
    this.awayTeam = new UpcomingMatchTeam(this.scene, {
      teamConfig: awayTeam,
      position: {
        x: this.rectangle.x - this.rectangle.displayWidth / 2 + 15,
        y: this.rectangle.y - this.rectangle.displayHeight / 2,
      },
    })
    this.homeTeam = new UpcomingMatchTeam(this.scene, {
      teamConfig: homeTeam,
      position: {
        x: this.rectangle.x + this.rectangle.displayWidth / 2 - 15,
        y: this.rectangle.y - this.rectangle.displayHeight / 2,
      },
    })
  }
}
