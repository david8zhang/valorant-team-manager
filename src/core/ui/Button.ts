export interface ButtonConfig {
  scene: Phaser.Scene
  width: number
  height: number
  x: number
  y: number
  onClick: Function
  text: string
}

export class Button {
  private scene: Phaser.Scene
  private rectangle: Phaser.GameObjects.Rectangle
  private text: Phaser.GameObjects.Text

  constructor(config: ButtonConfig) {
    this.scene = config.scene
    this.rectangle = this.scene.add
      .rectangle(config.x, config.y, config.width, config.height, 0xffffff)
      .setAlpha(0.85)
    this.text = this.scene.add.text(config.x, config.y, config.text, {
      fontSize: '10px',
      color: 'black',
    })
    this.text.setPosition(
      this.text.x - this.text.displayWidth / 2,
      this.text.y - this.text.displayHeight / 2
    )
    this.rectangle.setInteractive().on('pointerdown', () => {
      this.scene.tweens.add({
        targets: [this.rectangle],
        alpha: {
          from: 0.85,
          to: 0.5,
        },
        yoyo: true,
        duration: 50,
      })
      config.onClick()
    })
  }

  setVisible(isVisible: boolean) {
    this.rectangle.setVisible(isVisible)
    this.text.setVisible(isVisible)
  }
}
