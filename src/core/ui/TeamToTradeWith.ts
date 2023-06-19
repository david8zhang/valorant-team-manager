import TeamMgmt, { TeamConfig } from '~/scenes/TeamMgmt'
import { Button } from './Button'
import { RoundConstants } from '~/utils/RoundConstants'

export interface TeamToTradeWithConfig {
  position: {
    x: number
    y: number
  }
  teamConfig: TeamConfig
  onViewRoster: Function
}

export class TeamToTradeWith {
  private scene: TeamMgmt
  private teamImg: Phaser.GameObjects.Sprite
  private teamNameText: Phaser.GameObjects.Text
  private viewRosterButton: Button

  constructor(scene: TeamMgmt, config: TeamToTradeWithConfig) {
    this.scene = scene
    this.teamImg = this.scene.add.sprite(config.position.x, config.position.y, '')
    this.teamNameText = this.scene.add
      .text(
        config.position.x + this.teamImg.displayWidth,
        config.position.y,
        `${config.teamConfig.name}`,
        {
          fontSize: '20px',
          color: 'black',
        }
      )
      .setOrigin(0)

    this.teamNameText.setPosition(
      this.teamNameText.x,
      this.teamNameText.y - this.teamNameText.displayHeight / 2
    )

    this.viewRosterButton = new Button({
      scene: this.scene,
      onClick: () => {
        config.onViewRoster()
      },
      x: RoundConstants.WINDOW_WIDTH - 90,
      y: config.position.y,
      strokeWidth: 1,
      strokeColor: 0x000000,
      text: 'View Roster',
      width: 150,
      height: 40,
    })
  }

  setVisible(isVisible: boolean) {
    this.teamNameText.setVisible(isVisible)
    this.teamImg.setVisible(isVisible)
    this.viewRosterButton.setVisible(isVisible)
  }

  destroy() {
    this.teamNameText.destroy()
    this.teamImg.destroy()
    this.viewRosterButton.destroy()
  }
}
