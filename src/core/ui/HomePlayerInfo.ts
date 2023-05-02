import { Scene } from 'phaser'

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
  private rectangle: Phaser.GameObjects.Rectangle
  private playerNameText: Phaser.GameObjects.Text

  constructor(scene: Scene, config: HomePlayerInfoConfig) {
    console.log(config)
    this.scene = scene
    this.rectangle = this.scene.add
      .rectangle(config.position.x, config.position.y, config.width, config.height)
      .setStrokeStyle(1, 0x000000)
      .setOrigin(0)
    this.playerNameText = this.scene.add.text(this.rectangle.x, this.rectangle.y, config.name, {
      fontSize: '12px',
      color: 'black',
    })
  }

  setVisible(isVisible: boolean) {
    this.rectangle.setVisible(isVisible)
    this.playerNameText.setVisible(isVisible)
  }
}
