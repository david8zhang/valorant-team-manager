import { Scene } from 'phaser'
import { PlayerAgentConfig } from '~/scenes/TeamMgmt/TeamMgmt'

export interface HomePlayerInfoConfig {
  name: string
  width: number
  height: number
  position: {
    x: number
    y: number
  }
  strokeColor?: number
  bgColor?: number
  ovrRank: string
}

export class HomePlayerInfo {
  private scene: Scene
  public rectangle: Phaser.GameObjects.Rectangle
  private playerNameText: Phaser.GameObjects.Text
  private playerOVRText: Phaser.GameObjects.Text

  constructor(scene: Scene, config: HomePlayerInfoConfig) {
    this.scene = scene
    this.rectangle = this.scene.add
      .rectangle(config.position.x, config.position.y, config.width, config.height)
      .setStrokeStyle(1, config.strokeColor != undefined ? config.strokeColor : 0x000000)
      .setFillStyle(config.bgColor != undefined ? config.bgColor : 0xffffff)
      .setOrigin(0)
    this.playerNameText = this.scene.add
      .text(this.rectangle.x, this.rectangle.y, config.name, {
        fontSize: '24px',
        color: 'black',
      })
      .setWordWrapWidth(this.rectangle.displayWidth - 30, true)
      .setAlign('center')
    this.playerNameText.setPosition(
      this.rectangle.x + this.rectangle.displayWidth / 2 - this.playerNameText.displayWidth / 2,
      this.rectangle.y + this.rectangle.displayHeight / 2 - this.playerNameText.displayHeight / 2
    )
    this.playerOVRText = this.scene.add
      .text(this.rectangle.x, this.rectangle.y, config.ovrRank, {
        fontSize: '20px',
        color: 'black',
      })
      .setAlign('center')
    this.playerOVRText.setPosition(
      this.rectangle.x + this.rectangle.displayWidth / 2 - this.playerOVRText.displayWidth / 2,
      this.rectangle.y +
        this.rectangle.displayHeight / 2 -
        this.playerOVRText.displayHeight / 2 +
        100
    )
  }

  destroy() {
    this.rectangle.destroy()
    this.playerNameText.destroy()
    this.playerOVRText.destroy()
  }

  setVisible(isVisible: boolean) {
    this.rectangle.setVisible(isVisible)
    this.playerNameText.setVisible(isVisible)
    this.playerOVRText.setVisible(isVisible)
  }

  updateInfo(config: PlayerAgentConfig) {
    this.playerNameText.setText(config.name)
    this.playerNameText.setPosition(
      this.rectangle.x + this.rectangle.displayWidth / 2 - this.playerNameText.displayWidth / 2,
      this.rectangle.y + this.rectangle.displayHeight / 2 - this.playerNameText.displayHeight / 2
    )
  }
}
