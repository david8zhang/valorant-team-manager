import { Button } from '~/core/ui/Button'
import TeamMgmt from '~/scenes/TeamMgmt/TeamMgmt'
import { RoundConstants } from '~/utils/RoundConstants'

export interface TradeProposalNotifModalConfig {
  title: string
  subtitle: string
  onContinue: Function
  depth: number
}

export class TradeProposalNotifModal {
  private scene: TeamMgmt
  private bgRect: Phaser.GameObjects.Rectangle
  private titleText: Phaser.GameObjects.Text
  private subtitleText: Phaser.GameObjects.Text
  private continueButton: Button
  private onContinue: Function = () => {}

  constructor(scene: TeamMgmt, config: TradeProposalNotifModalConfig) {
    this.scene = scene

    this.bgRect = this.scene.add.rectangle(
      (RoundConstants.TEAM_MGMT_SIDEBAR_WIDTH + RoundConstants.WINDOW_WIDTH) / 2,
      RoundConstants.WINDOW_HEIGHT / 2,
      500,
      300
    )
    this.bgRect.setStrokeStyle(1, 0x000000).setFillStyle(0xffffff).setDepth(config.depth)

    this.titleText = this.scene.add
      .text(this.bgRect.x, this.bgRect.y, config.title, {
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
      .text(this.bgRect.x, this.bgRect.y + this.titleText.displayHeight + 15, config.subtitle, {
        fontSize: '15px',
        color: 'black',
        align: 'center',
      })
      .setDepth(config.depth)
      .setWordWrapWidth(this.bgRect.displayWidth - 50, true)

    this.subtitleText.setPosition(
      this.bgRect.x - this.subtitleText.displayWidth / 2,
      this.titleText.y + this.titleText.displayHeight + 15
    )

    this.continueButton = new Button({
      scene: this.scene,
      onClick: () => {
        this.onContinueButtonClicked()
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

  display(config: { title: string; subtitle: string; onContinue: Function }) {
    this.onContinue = config.onContinue
    this.titleText.setText(config.title)
    this.subtitleText.setText(config.subtitle)
    this.titleText.setPosition(
      this.bgRect.x - this.titleText.displayWidth / 2,
      this.bgRect.y - this.titleText.displayHeight / 2 - 50
    )
    this.subtitleText.setPosition(
      this.bgRect.x - this.subtitleText.displayWidth / 2,
      this.titleText.y + this.titleText.displayHeight + 15
    )
    this.setVisible(true)
  }

  onContinueButtonClicked() {
    if (this.onContinue) {
      this.onContinue()
    }
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
