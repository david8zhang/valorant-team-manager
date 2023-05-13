import { Scene } from 'phaser'
import { PlayerAgentConfig } from '~/scenes/TeamMgmt'

export interface HomePlayerInfoConfig {
  name: string
  width: number
  height: number
  position: {
    x: number
    y: number
  }
}

export class HomePlayerInfo {
  private scene: Scene
  public rectangle: Phaser.GameObjects.Rectangle
  private playerNameText: Phaser.GameObjects.Text

  constructor(scene: Scene, config: HomePlayerInfoConfig) {
    this.scene = scene
    this.rectangle = this.scene.add
      .rectangle(config.position.x, config.position.y, config.width, config.height)
      .setStrokeStyle(1, 0x000000)
      .setOrigin(0)
    this.playerNameText = this.scene.add.text(this.rectangle.x, this.rectangle.y, config.name, {
      fontSize: '24px',
      color: 'black',
    })
    this.playerNameText.setPosition(
      this.rectangle.x + this.rectangle.displayWidth / 2 - this.playerNameText.displayWidth / 2,
      this.rectangle.y + this.rectangle.displayHeight / 2 - this.playerNameText.displayHeight / 2
    )
  }

  setVisible(isVisible: boolean) {
    this.rectangle.setVisible(isVisible)
    this.playerNameText.setVisible(isVisible)
  }

  updateInfo(config: PlayerAgentConfig) {
    this.playerNameText.setText(config.name)
    this.playerNameText.setPosition(
      this.rectangle.x + this.rectangle.displayWidth / 2 - this.playerNameText.displayWidth / 2,
      this.rectangle.y + this.rectangle.displayHeight / 2 - this.playerNameText.displayHeight / 2
    )
  }
}
