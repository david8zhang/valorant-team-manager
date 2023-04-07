import Game from '~/scenes/Game'
import { Constants } from '~/utils/Constants'
import { Utility, UtilityConfig } from './Utility'

export class Smoke extends Utility {
  private static SMOKE_TIME_SECONDS = 5
  private static SMOKE_RADIUS = 24

  private smokeFadeEvent!: Phaser.Time.TimerEvent
  private smokeToPlaceIndex: number = 0
  private smokes: Phaser.GameObjects.Arc[] = []
  private smokesCursor!: Phaser.GameObjects.Arc

  private didPlaceSmokes: boolean = false
  private isPlacingSmokes: boolean = false

  constructor(game: Game, config: UtilityConfig) {
    super(game, config)
    this.setupMouseListener()
    this.setupSmokesSprites()
    this.totalCharges = 2
    this.numCharges = this.totalCharges
  }

  setupSmokesSprites() {
    this.smokesCursor = this.game.add
      .circle(0, 0, 0, 0x00ffff, 0.25)
      .setStrokeStyle(1, 0x00ffff, 1)
      .setDepth(Constants.SORT_LAYERS.Player)
      .setRadius(Smoke.SMOKE_RADIUS)
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
    if (this.smokeToPlaceIndex < this.totalCharges) {
      const smoke = this.smokes[this.smokeToPlaceIndex]
      smoke.setRadius(Smoke.SMOKE_RADIUS).setVisible(true).setPosition(x, y)

      console.log('Smoke to place', smoke)
      this.smokeToPlaceIndex++
      this.numCharges--
      if (this.smokeToPlaceIndex === this.totalCharges) {
        this.isPlacingSmokes = false
        this.didPlaceSmokes = true
      }
    }
  }

  deselect() {
    if (!this.isDepleted) {
      this.smokes.forEach((smoke) => {
        console.log('Deselected smokes')
        smoke.setVisible(false)
        smoke.setRadius(0)
      })
      this.smokeToPlaceIndex = 0
      this.numCharges = this.totalCharges
      this.didPlaceSmokes = false
    }
    this.isPlacingSmokes = false
    this.smokesCursor.setVisible(false)
    this.preventOtherCommands = false
  }

  reset() {
    this.smokeToPlaceIndex = 0
    this.numCharges = this.totalCharges
    this.isDepleted = false
    this.didPlaceSmokes = false
    this.isPlacingSmokes = false
    this.preventOtherCommands = false

    if (this.smokeFadeEvent) {
      this.smokeFadeEvent.paused = true
      this.smokeFadeEvent.destroy()
    }

    this.smokes.forEach((smoke) => {
      smoke.setRadius(0).setStrokeStyle(1, 0x00ffff, 1).setFillStyle(0x00ffff, 0.25).setAlpha(1)
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
            console.log('Smokes faded!')
            smoke.setRadius(0)
          },
        })
      }
    })
  }

  confirmSmokes() {
    this.isDepleted = true
    this.deselect()
    this.smokes.forEach((smoke) => {
      smoke.setFillStyle(0x444444, 0.9)
      smoke.setStrokeStyle(1, 0x222222)
    })
    this.smokeFadeEvent = this.game.time.delayedCall(Smoke.SMOKE_TIME_SECONDS * 1000, () => {
      this.fadeSmokes()
    })
    if (this.game.isPaused) {
      this.smokeFadeEvent.paused = true
    }
    this.game.onPauseCallbacks.push((isPaused: boolean) => {
      this.smokeFadeEvent.paused = isPaused
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
