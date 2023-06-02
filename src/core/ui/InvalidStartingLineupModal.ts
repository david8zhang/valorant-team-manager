import { Scene } from 'phaser'
import { RoundConstants } from '~/utils/RoundConstants'
import { Button } from './Button'

export class InvalidStartingLineupModal {
  private scene: Scene
  private modalRect: Phaser.GameObjects.Rectangle
  private invalidStartingLineupText: Phaser.GameObjects.Text
  private invalidStartingLineupSubtitle: Phaser.GameObjects.Text
  private continueButton: Button

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
    this.invalidStartingLineupText = this.scene.add
      .text(this.modalRect.x, this.modalRect.y, 'Invalid starting lineup!', {
        fontSize: '15px',
        color: 'black',
      })
      .setAlign('center')
      .setWordWrapWidth(this.modalRect.displayWidth - 50)
      .setDepth(RoundConstants.SORT_LAYERS.UI)
    this.invalidStartingLineupSubtitle = this.scene.add
      .text(
        this.modalRect.x,
        this.modalRect.y + this.invalidStartingLineupText.displayHeight + 15,
        'You might be missing players from your starting lineup',
        {
          fontSize: '13px',
          color: 'black',
        }
      )
      .setAlign('center')
      .setWordWrapWidth(this.modalRect.displayWidth - 50)
      .setDepth(RoundConstants.SORT_LAYERS.UI)
    this.invalidStartingLineupText.setPosition(
      this.modalRect.x - this.invalidStartingLineupText.displayWidth / 2,
      this.modalRect.y - this.invalidStartingLineupText.displayHeight / 2 - 50
    )
    this.invalidStartingLineupSubtitle.setPosition(
      this.invalidStartingLineupSubtitle.x - this.invalidStartingLineupSubtitle.displayWidth / 2,
      this.invalidStartingLineupText.y + this.invalidStartingLineupText.displayHeight + 15
    )
    this.continueButton = new Button({
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
      y:
        this.invalidStartingLineupSubtitle.y +
        this.invalidStartingLineupSubtitle.displayHeight +
        40,
      depth: RoundConstants.SORT_LAYERS.UI,
    })
    this.hide()
  }

  display() {
    this.invalidStartingLineupSubtitle.setVisible(true)
    this.invalidStartingLineupText.setVisible(true)
    this.modalRect.setVisible(true)
    this.continueButton.setVisible(true)
  }

  hide() {
    this.invalidStartingLineupSubtitle.setVisible(false)
    this.invalidStartingLineupText.setVisible(false)
    this.modalRect.setVisible(false)
    this.continueButton.setVisible(false)
  }
}
