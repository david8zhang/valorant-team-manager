import { Scene } from 'phaser'
import { RoundConstants } from '~/utils/RoundConstants'
import { Button } from './Button'

export class ExpiringContractsModal {
  private scene: Scene
  private modalRect: Phaser.GameObjects.Rectangle
  private contractsExpiringText: Phaser.GameObjects.Text
  private contractsExpiringSubtext: Phaser.GameObjects.Text
  private goToContractsButton: Button

  constructor(scene: Scene, onContinue: Function) {
    this.scene = scene
    this.modalRect = this.scene.add.rectangle(
      (RoundConstants.TEAM_MGMT_SIDEBAR_WIDTH + RoundConstants.WINDOW_WIDTH) / 2,
      RoundConstants.WINDOW_HEIGHT / 2,
      400,
      200
    )
    this.modalRect
      .setStrokeStyle(1, 0x000000)
      .setFillStyle(0xffffff)
      .setDepth(RoundConstants.SORT_LAYERS.UI)
    this.contractsExpiringText = this.scene.add
      .text(this.modalRect.x, this.modalRect.y, 'You have expiring contracts!', {
        fontSize: '15px',
        color: 'black',
      })
      .setAlign('center')
      .setWordWrapWidth(this.modalRect.displayWidth - 50)
      .setDepth(RoundConstants.SORT_LAYERS.UI)
    this.contractsExpiringSubtext = this.scene.add
      .text(
        this.modalRect.x,
        this.modalRect.y + this.contractsExpiringText.displayHeight + 15,
        'You will have to extend or release them before the season can start',
        {
          fontSize: '13px',
          color: 'black',
        }
      )
      .setAlign('center')
      .setWordWrapWidth(this.modalRect.displayWidth - 50)
      .setDepth(RoundConstants.SORT_LAYERS.UI)
    this.contractsExpiringText.setPosition(
      this.modalRect.x - this.contractsExpiringText.displayWidth / 2,
      this.modalRect.y - this.contractsExpiringText.displayHeight / 2 - 50
    )
    this.contractsExpiringSubtext.setPosition(
      this.contractsExpiringSubtext.x - this.contractsExpiringSubtext.displayWidth / 2,
      this.contractsExpiringText.y + this.contractsExpiringText.displayHeight + 15
    )
    this.goToContractsButton = new Button({
      scene: this.scene,
      onClick: () => {
        onContinue()
      },
      text: 'Continue',
      fontSize: '15px',
      strokeColor: 0x000000,
      strokeWidth: 1,
      width: 150,
      height: 40,
      x: this.modalRect.x,
      y: this.contractsExpiringSubtext.y + this.contractsExpiringSubtext.displayHeight + 40,
      depth: RoundConstants.SORT_LAYERS.UI,
    })
    this.hide()
  }

  display() {
    this.contractsExpiringSubtext.setVisible(true)
    this.contractsExpiringText.setVisible(true)
    this.modalRect.setVisible(true)
    this.goToContractsButton.setVisible(true)
  }

  hide() {
    this.contractsExpiringSubtext.setVisible(false)
    this.contractsExpiringText.setVisible(false)
    this.modalRect.setVisible(false)
    this.goToContractsButton.setVisible(false)
  }
}
