import TeamMgmt from '~/scenes/TeamMgmt/TeamMgmt'
import { RoundConstants } from '~/utils/RoundConstants'
import { Button } from './Button'
import { Save, SaveKeys } from '~/utils/Save'

export interface PlayerEliminationModalConfig {
  depth: number
  onContinue: Function
}

export class PlayerEliminationModal {
  private scene: TeamMgmt
  private titleText: Phaser.GameObjects.Text
  private subtitleText: Phaser.GameObjects.Text
  private continueButton: Button
  private bgRect: Phaser.GameObjects.Rectangle

  constructor(scene: TeamMgmt, config: PlayerEliminationModalConfig) {
    this.scene = scene

    this.bgRect = this.scene.add.rectangle(
      (RoundConstants.TEAM_MGMT_SIDEBAR_WIDTH + RoundConstants.WINDOW_WIDTH) / 2,
      RoundConstants.WINDOW_HEIGHT / 2,
      500,
      300
    )
    this.bgRect.setStrokeStyle(1, 0x000000).setFillStyle(0xffffff).setDepth(config.depth)

    const playerTeamName = Save.getData(SaveKeys.PLAYER_TEAM_NAME) as string
    this.titleText = this.scene.add
      .text(this.bgRect.x, this.bgRect.y, `Better luck next season!`, {
        fontSize: '25px',
        color: 'black',
        align: 'center',
      })
      .setDepth(config.depth)
      .setWordWrapWidth(this.bgRect.displayWidth - 50, true)

    this.titleText.setPosition(
      this.bgRect.x - this.titleText.displayWidth / 2,
      this.bgRect.y - this.titleText.displayHeight / 2 - 50
    )

    this.subtitleText = this.scene.add
      .text(
        this.bgRect.x,
        this.bgRect.y + this.titleText.displayHeight + 15,
        `The ${playerTeamName} have been eliminated from the playoffs!`,
        {
          fontSize: '15px',
          color: 'black',
          align: 'center',
        }
      )
      .setDepth(config.depth)
      .setWordWrapWidth(this.bgRect.displayWidth - 50, true)

    this.subtitleText.setPosition(
      this.bgRect.x - this.subtitleText.displayWidth / 2,
      this.titleText.y + this.titleText.displayHeight + 15
    )

    this.continueButton = new Button({
      scene: this.scene,
      onClick: () => {
        config.onContinue()
      },
      fontSize: '15px',
      textColor: 'black',
      width: 200,
      height: 50,
      strokeColor: 0x000000,
      strokeWidth: 1,
      x: this.bgRect.x,
      y: this.bgRect.y + 100,
      text: 'Continue',
      depth: config.depth,
    })
  }

  setVisible(isVisible: boolean) {
    this.continueButton.setVisible(isVisible)
    this.subtitleText.setVisible(isVisible)
    this.titleText.setVisible(isVisible)
    this.bgRect.setVisible(isVisible)
  }

  destroy() {
    this.subtitleText.destroy()
    this.titleText.destroy()
    this.bgRect.destroy()
    this.continueButton.destroy()
  }
}
