import { Scene } from 'phaser'
import { Button } from '~/core/ui/Button'
import { PlayerAgentConfig } from '~/scenes/TeamMgmt'
import { RoundConstants } from '~/utils/RoundConstants'

export interface ConfirmReleaseModalConfig {
  playerAgent: PlayerAgentConfig
  position: {
    x: number
    y: number
  }
  onAccept: Function
  onDeny: Function
}

export class ConfirmReleaseModal {
  private scene: Scene
  private rectangle: Phaser.GameObjects.Rectangle
  private confirmText: Phaser.GameObjects.Text
  private acceptButton: Button
  private denyButton: Button
  public shouldShow: boolean = false

  constructor(scene: Scene, config: ConfirmReleaseModalConfig) {
    this.scene = scene
    this.rectangle = this.scene.add
      .rectangle(config.position.x, config.position.y, 400, 200, 0xffffff)
      .setStrokeStyle(1, 0x000000)
      .setDepth(RoundConstants.SORT_LAYERS.UI)
    this.confirmText = this.scene.add.text(
      config.position.x,
      config.position.y - 50,
      `Release ${config.playerAgent.name} into free agency?`,
      {
        fontSize: '18px',
        color: 'black',
      }
    )
    this.confirmText
      .setPosition(config.position.x - this.confirmText.displayWidth / 2, config.position.y - 50)
      .setDepth(RoundConstants.SORT_LAYERS.UI)
    this.acceptButton = new Button({
      scene: this.scene,
      onClick: () => {
        config.onAccept()
      },
      width: 150,
      height: 30,
      text: 'Accept',
      x: this.rectangle.x + 80,
      y: this.rectangle.y + 25,
      strokeColor: 0x000000,
      strokeWidth: 1,
      depth: RoundConstants.SORT_LAYERS.UI,
    })
    this.denyButton = new Button({
      scene: this.scene,
      onClick: () => {
        config.onDeny()
      },
      width: 150,
      height: 30,
      text: 'Deny',
      x: this.rectangle.x - 80,
      y: this.rectangle.y + 25,
      strokeColor: 0x000000,
      strokeWidth: 1,
      depth: RoundConstants.SORT_LAYERS.UI,
    })
    this.hide()
  }

  display() {
    this.shouldShow = true
    this.setVisible(this.shouldShow)
  }

  hide() {
    this.shouldShow = false
    this.setVisible(this.shouldShow)
  }

  destroy() {
    this.rectangle.destroy()
    this.confirmText.destroy()
    this.acceptButton.destroy()
    this.denyButton.destroy()
  }

  setVisible(isVisible: boolean) {
    this.rectangle.setVisible(isVisible)
    this.confirmText.setVisible(isVisible)
    this.acceptButton.setVisible(isVisible)
    this.denyButton.setVisible(isVisible)
  }
}
