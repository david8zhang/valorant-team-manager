import { Scene } from 'phaser'
import { Constants } from '~/utils/Constants'

export interface SidebarConfig {
  options: {
    text: string
    onClick: Function
  }[]
}

export class Sidebar {
  private scene: Scene
  private rectangle: Phaser.GameObjects.Rectangle
  private highlightRect: Phaser.GameObjects.Rectangle

  constructor(scene: Scene, config: SidebarConfig) {
    this.scene = scene
    this.rectangle = this.scene.add
      .rectangle(0, 0, 200, Constants.WINDOW_HEIGHT, 0xdddddd)
      .setOrigin(0)
    this.highlightRect = this.scene.add
      .rectangle(0, 0, 200, 25, 0x555555)
      .setOrigin(0)
      .setVisible(false)

    let yPos = 25
    config.options.forEach((option) => {
      const text = this.scene.add
        .text(this.rectangle.x + 15, yPos, option.text, {
          fontSize: '16px',
          color: 'black',
        })
        .setInteractive({
          useHandCursor: true,
        })
        .on(Phaser.Input.Events.POINTER_DOWN, () => {
          option.onClick()
        })
        .on(Phaser.Input.Events.POINTER_OVER, () => {
          this.highlightRect
            .setPosition(this.rectangle.x, text.y - text.displayHeight / 4)
            .setVisible(true)
          text.setStyle({
            color: 'white',
          })
        })
        .on(Phaser.Input.Events.POINTER_OUT, () => {
          this.highlightRect.setVisible(false)
          text.setStyle({
            color: 'black',
          })
        })
      yPos += text.displayHeight + 20
    })
  }
}
