import Game from '~/scenes/Game'
import { Constants } from '~/utils/Constants'
import { Side } from '../Agent'
import { Utility, UtilityConfig } from './Utility'

export class Smoke extends Utility {
  public static TOTAL_SMOKES = 2
  public static SMOKE_RADIUS = 32

  private currSmokeToPlaceIndex = 0
  private smokes: Phaser.GameObjects.Arc[] = []
  private didPlaceSmokes: boolean = false
  private isPlacingSmokes: boolean = false

  constructor(game: Game, config: UtilityConfig) {
    super(game, config)
    this.setupSmokeSprites()
    this.setupMouseListener()
  }

  setupMouseListener() {
    this.game.input.on(Phaser.Input.Events.POINTER_DOWN, (e) => {
      this.placeSmoke(e.worldX, e.worldY)
    })
    this.game.input.on(Phaser.Input.Events.POINTER_MOVE, (e) => {
      if (this.isPlacingSmokes) {
        this.updateSelectedSmokePos(e.worldX, e.worldY)
      }
    })
  }

  updateSelectedSmokePos(x: number, y: number) {
    if (this.currSmokeToPlaceIndex < this.smokes.length) {
      const smokeToPlace = this.smokes[this.currSmokeToPlaceIndex]
      smokeToPlace.setRadius(32)
      smokeToPlace.setVisible(true)
      smokeToPlace.setPosition(x, y)
    }
  }

  setupSmokeSprites() {
    for (let i = 0; i < Smoke.TOTAL_SMOKES; i++) {
      const smoke = this.game.add.circle(0, 0, 0, 0x00ffff, 0.25)
      smoke.setStrokeStyle(1, 0x00ffff, 1)
      smoke.setDepth(Constants.SORT_LAYERS.Player)
      smoke.setVisible(false)
      smoke.setRadius(0)
      this.smokes.push(smoke)
    }
  }

  placeSmoke(x: number, y: number) {
    if (this.currSmokeToPlaceIndex < this.smokes.length) {
      if (this.currSmokeToPlaceIndex == this.smokes.length - 1) {
        this.didPlaceSmokes = true
      }
      this.currSmokeToPlaceIndex++
    }
  }

  deselect() {}

  reset() {
    this.currSmokeToPlaceIndex = 0
    this.didPlaceSmokes = false
    this.isPlacingSmokes = false
  }

  confirmSmokes() {
    this.game.playerRaycaster.mapGameObjects(this.smokes)
    this.game.cpuRaycaster.mapGameObjects(this.smokes)
    this.smokes.forEach((smoke) => {
      smoke.setFillStyle(0x444444, 0.9)
      smoke.setStrokeStyle(1, 0x222222)
    })
  }

  use() {
    if (!this.didPlaceSmokes) {
      this.isPlacingSmokes = true
    } else {
      this.confirmSmokes()
    }
  }
}
