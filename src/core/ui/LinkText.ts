import { Scene } from 'phaser'

export interface LinkTextConfig {
  position: {
    x: number
    y: number
  }
  text: string
  fontSize?: string
  textColor?: string
  onClick: Function
}

export class LinkText {
  private scene: Scene
  private linkText: Phaser.GameObjects.Text

  constructor(scene: Scene, config: LinkTextConfig) {
    this.scene = scene
    this.linkText = this.scene.add
      .text(config.position.x, config.position.y, config.text, {
        fontSize: config.fontSize ? config.fontSize : '14px',
        color: config.textColor !== undefined ? config.textColor : 'blue',
      })
      .setOrigin(0)
      .setInteractive()
      .on(Phaser.Input.Events.POINTER_DOWN, () => {
        this.linkText.setAlpha(0.5)
      })
      .on(Phaser.Input.Events.POINTER_UP, () => {
        this.linkText.setAlpha(1)
        config.onClick()
      })
    this.linkText.setPosition(config.position.x - this.linkText.displayWidth / 2, this.linkText.y)
  }

  setVisible(isVisible: boolean) {
    this.linkText.setVisible(isVisible)
  }
}
