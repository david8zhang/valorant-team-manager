import { Scene } from 'phaser'

export interface FrontOfficeCardConfig {
  position: {
    x: number
    y: number
  }
  width: number
  height: number
  text: string
  onClick: Function
}

export class FrontOfficeCard {
  private scene: Scene
  private text: Phaser.GameObjects.Text
  private rectangle: Phaser.GameObjects.Rectangle

  constructor(scene: Scene, config: FrontOfficeCardConfig) {
    this.scene = scene
    this.rectangle = this.scene.add
      .rectangle(config.position.x, config.position.y, config.width, config.height)
      .setOrigin(0)
      .setStrokeStyle(1, 0x000000)
      .setInteractive()
      .on(Phaser.Input.Events.POINTER_DOWN, () => {
        this.text.setAlpha(0.5)
        this.rectangle.setAlpha(0.5)
      })
      .on(Phaser.Input.Events.POINTER_UP, () => {
        this.text.setAlpha(1)
        this.rectangle.setAlpha(1)
        config.onClick()
      })
    this.text = this.scene.add.text(this.rectangle.x, this.rectangle.y, config.text, {
      fontSize: '24px',
      color: 'black',
    })
    this.text.setPosition(
      this.rectangle.x + this.rectangle.displayWidth / 2 - this.text.displayWidth / 2,
      this.rectangle.y + this.rectangle.displayHeight / 2 - this.text.displayHeight / 2
    )
  }

  setVisible(isVisible: boolean) {
    this.text.setVisible(isVisible)
    this.rectangle.setVisible(isVisible)
  }
}
