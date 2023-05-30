export interface ButtonConfig {
  scene: Phaser.Scene
  width: number
  height: number
  x: number
  y: number
  onClick: Function
  text: string
  backgroundColor?: number
  textColor?: string
  fontSize?: string
  strokeWidth?: number
  strokeColor?: number
  depth?: number
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
      .setFillStyle(config.backgroundColor)
    if (config.strokeWidth && config.strokeColor != undefined) {
      this.rectangle.setStrokeStyle(config.strokeWidth, config.strokeColor)
    }

    this.text = this.scene.add.text(config.x, config.y, config.text, {
      fontSize: config.fontSize ? config.fontSize : '10px',
      color: config.textColor ? config.textColor : 'black',
    })
    this.text.setPosition(
      this.text.x - this.text.displayWidth / 2,
      this.text.y - this.text.displayHeight / 2
    )
    this.rectangle
      .setInteractive()
      .on(Phaser.Input.Events.POINTER_DOWN, () => {
        this.rectangle.setAlpha(0.5)
        this.text.setAlpha(0.5)
      })
      .on(Phaser.Input.Events.POINTER_DOWN_OUTSIDE, () => {
        config.onClick()
        this.rectangle.setAlpha(0.85)
        this.text.setAlpha(1)
      })
      .on(Phaser.Input.Events.POINTER_UP, () => {
        config.onClick()
        this.rectangle.setAlpha(0.85)
        this.text.setAlpha(1)
      })
      .on(Phaser.Input.Events.POINTER_UP_OUTSIDE, () => {
        config.onClick()
        this.rectangle.setAlpha(0.85)
        this.text.setAlpha(1)
      })

    if (config.depth) {
      this.rectangle.setDepth(config.depth)
      this.text.setDepth(config.depth)
    }
  }

  setText(text: string) {
    this.text.setText(text)
    this.text.setPosition(
      this.rectangle.x - this.text.displayWidth / 2,
      this.rectangle.y - this.text.displayHeight / 2
    )
  }

  setPosition(x: number, y: number) {
    this.rectangle.setPosition(x, y)
    this.text.setPosition(x, y)
    this.text.setPosition(x - this.text.displayWidth / 2, y - this.text.displayHeight / 2)
  }

  public get x() {
    return this.rectangle.x
  }

  public get y() {
    return this.rectangle.y
  }

  destroy() {
    this.rectangle.destroy()
    this.text.destroy()
  }

  setVisible(isVisible: boolean) {
    this.rectangle.setVisible(isVisible)
    this.text.setVisible(isVisible)
  }
}
