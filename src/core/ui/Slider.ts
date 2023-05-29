import { Scene } from 'phaser'

export interface SliderConfig {
  position: {
    x: number
    y: number
  }
  width: number
  height: number
  maxValue: number
  onStepChanged: Function
  stepSize: number
}

export class Slider {
  private scene: Scene
  private sliderButton: Phaser.GameObjects.Arc
  private sliderRail: Phaser.GameObjects.Rectangle
  private sliderPoints: { x: number; y: number }[] = []
  private sliderHighlightRail: Phaser.GameObjects.Rectangle

  constructor(scene: Scene, config: SliderConfig) {
    this.scene = scene
    this.sliderRail = this.scene.add.rectangle(
      config.position.x,
      config.position.y,
      config.width,
      config.height,
      0x555555
    )
    this.sliderHighlightRail = this.scene.add.rectangle(
      config.position.x - this.sliderRail.displayWidth / 2,
      config.position.y,
      0,
      config.height,
      0x40e0d0
    )
    this.sliderButton = this.scene.add
      .circle(config.position.x - this.sliderRail.displayWidth / 2, config.position.y - 7.5, 10)
      .setStrokeStyle(1, 0x40e0d0)
      .setFillStyle(0x40e0d0)
      .setOrigin(0)
      .setInteractive()
      .on(Phaser.Input.Events.DRAG_START, (e) => {
        this.sliderButton.setFillStyle(0x33feff)
      })
      .on(Phaser.Input.Events.DRAG_END, (e) => {
        this.sliderButton.setFillStyle(0x40e0d0)
      })
      .on(Phaser.Input.Events.DRAG, (e) => {
        let closestPoint = this.sliderPoints[0]
        let distance = Number.MAX_SAFE_INTEGER
        let pointIndex = 0
        this.sliderPoints.forEach((point, index) => {
          const distToMouse = Math.abs(point.x - e.worldX)
          if (distToMouse < distance) {
            distance = distToMouse
            closestPoint = point
            pointIndex = index
          }
        })
        if (distance < 30) {
          this.sliderHighlightRail.width =
            closestPoint.x - (config.position.x - this.sliderRail.displayWidth / 2)
          this.sliderButton.setPosition(closestPoint.x, closestPoint.y - 7.5)
          config.onStepChanged(pointIndex)
        }
      })
    this.setupSliderPoints(config)
    this.scene.input.setDraggable(this.sliderButton)
  }

  destroy() {
    this.sliderButton.destroy()
    this.sliderRail.destroy()
    this.sliderHighlightRail.destroy()
  }

  setVisible(isVisible: boolean) {
    this.sliderButton.setVisible(isVisible)
    this.sliderRail.setVisible(isVisible)
    this.sliderHighlightRail.setVisible(isVisible)
  }

  setupSliderPoints(config: SliderConfig) {
    const numSteps = config.maxValue / config.stepSize
    const stepWidth = config.width / numSteps
    let xPos = this.sliderButton.x
    for (let i = 0; i <= numSteps; i++) {
      if (i == numSteps) {
        this.sliderPoints.push({
          x: xPos - 10,
          y: this.sliderRail.y,
        })
      } else {
        this.sliderPoints.push({
          x: xPos,
          y: this.sliderRail.y,
        })
      }
      xPos += stepWidth
    }
  }
}
