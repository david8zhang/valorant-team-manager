import Game from '~/scenes/Game'
import { Constants } from '~/utils/Constants'
import { Utility, UtilityConfig } from './Utility'

export class Smoke extends Utility {
  public static TOTAL_SMOKES = 2
  public static SMOKE_TIME_SECONDS = 5
  public static SMOKE_RADIUS = 32

  private smokeToPlaceIndex: number = 0
  private smokes: Phaser.GameObjects.Arc[] = []
  private smokesCursor!: Phaser.GameObjects.Arc

  private didPlaceSmokes: boolean = false
  private isPlacingSmokes: boolean = false

  constructor(game: Game, config: UtilityConfig) {
    super(game, config)
    this.setupMouseListener()
    this.setupSmokesSprites()
  }

  setupSmokesSprites() {
    this.smokesCursor = this.game.add
      .circle(0, 0, 0, 0x00ffff, 0.25)
      .setStrokeStyle(1, 0x00ffff, 1)
      .setDepth(Constants.SORT_LAYERS.Player)
      .setRadius(32)
      .setVisible(false)
    for (let i = 1; i <= 2; i++) {
      const smoke = this.game.add
        .circle(0, 0, 0, 0x00ffff, 0.25)
        .setStrokeStyle(1, 0x00ffff, 1)
        .setDepth(Constants.SORT_LAYERS.Player)
        .setRadius(0)
        .setVisible(false)
      this.smokes.push(smoke)
    }
    this.game.playerRaycaster.mapGameObjects(this.smokes)
    this.game.cpuRaycaster.mapGameObjects(this.smokes)
  }

  setupMouseListener() {
    this.game.input.on(Phaser.Input.Events.POINTER_DOWN, (e) => {
      if (this.isPlacingSmokes) {
        this.placeSmoke(e.worldX, e.worldY)
      }
    })
    this.game.input.on(Phaser.Input.Events.POINTER_MOVE, (e) => {
      if (this.isPlacingSmokes) {
        this.updateSelectedSmokePos(e.worldX, e.worldY)
      } else {
        this.smokesCursor.setVisible(false)
      }
    })
  }

  updateSelectedSmokePos(x: number, y: number) {
    this.smokesCursor.setVisible(true).setPosition(x, y)
  }

  placeSmoke(x: number, y: number) {
    if (this.smokeToPlaceIndex < Smoke.TOTAL_SMOKES) {
      const smoke = this.smokes[this.smokeToPlaceIndex]
      smoke.setRadius(32).setVisible(true).setPosition(x, y)
      this.smokeToPlaceIndex++
      if (this.smokeToPlaceIndex === Smoke.TOTAL_SMOKES) {
        this.didPlaceSmokes = true
      }
    }
  }

  deselect() {
    this.isPlacingSmokes = false
    this.smokesCursor.setVisible(false)
    this.preventOtherCommands = false
  }

  reset() {
    this.didPlaceSmokes = false
    this.isPlacingSmokes = false
    this.smokes.forEach((smoke) => {
      smoke.destroy()
    })
  }

  fadeSmokes() {
    this.smokes.forEach((smoke) => {
      if (smoke.active) {
        this.game.tweens.add({
          targets: [smoke],
          alpha: {
            from: 0.9,
            to: 0,
          },
          duration: 150,
          onComplete: () => {
            smoke.setRadius(0)
          },
        })
      }
    })
  }

  confirmSmokes() {
    this.deselect()
    this.isDepleted = true
    this.smokes.forEach((smoke) => {
      this.game.playerRaycaster.mapGameObjects(smoke, true)
      this.game.cpuRaycaster.mapGameObjects(smoke, true)
      smoke.setFillStyle(0x444444, 0.9)
      smoke.setStrokeStyle(1, 0x222222)
    })
    this.game.time.delayedCall(Smoke.SMOKE_TIME_SECONDS * 1000, () => {
      this.fadeSmokes()
    })
  }

  use() {
    if (!this.didPlaceSmokes) {
      this.isPlacingSmokes = true
      this.preventOtherCommands = true
    } else {
      this.confirmSmokes()
    }
  }
}
