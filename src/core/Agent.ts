import Game from '~/scenes/Game'
import { Constants } from '~/utils/Constants'
import { Node } from './Pathfinding'

export interface AgentConfig {
  position: {
    x: number
    y: number
  }
  texture: string
  sightAngleDeg: number
  hideSightCones?: boolean
  raycaster: any
}

export class Agent {
  public visionRay: any
  public crosshairRay: any
  public game: Game
  public sprite: Phaser.Physics.Arcade.Sprite
  public currPath: Node[] = []
  public currNodeToMoveTo: Node | undefined
  public pathLines: Phaser.GameObjects.Line[] = []
  public moveTarget: { x: number; y: number } | null = null
  public shouldStop: boolean = false

  public highlightCircle: Phaser.Physics.Arcade.Sprite
  public isPaused: boolean = false
  public hideSightCones: boolean = false

  constructor(config: AgentConfig) {
    this.game = Game.instance
    if (config.hideSightCones) {
      this.hideSightCones = config.hideSightCones
    }
    this.visionRay = config.raycaster.createRay({
      origin: config.position,
    })
    this.visionRay.setAngle(Phaser.Math.DegToRad(config.sightAngleDeg))
    this.visionRay.setConeDeg(60)

    this.crosshairRay = config.raycaster.createRay({
      origin: config.position,
    })
    this.crosshairRay.setAngle(Phaser.Math.DegToRad(config.sightAngleDeg))

    this.sprite = this.game.physics.add
      .sprite(config.position.x, config.position.y, config.texture)
      .setDepth(50)
      .setName('agent')
    this.highlightCircle = this.game.physics.add
      .sprite(config.position.x, config.position.y, config.texture)
      .setTintFill(0xffff00)
      .setVisible(false)
      .setScale(1.5)
      .setDepth(this.sprite.depth - 1)
  }

  update() {
    this.tracePath()
    if (this.isAtMoveTarget() || !this.moveTarget) {
      const currNode = this.currPath.shift()
      if (currNode) {
        this.moveTarget = this.game.getWorldPosForTilePos(
          currNode.position.row,
          currNode.position.col
        )
      } else {
        this.shouldStop = true
      }
    }
    this.moveTowardTarget()

    // Update vision/crosshair raycast
    this.visionRay.setOrigin(this.sprite.x, this.sprite.y)
    this.crosshairRay.setOrigin(this.sprite.x, this.sprite.y)
    this.setRayDirection()
    const visionIntersections = this.visionRay.castCone()
    visionIntersections.push(this.visionRay.origin)
    visionIntersections.forEach((n) => {
      if (n.object && n.object.name === 'agent') {
        n.object.setVisible(true)
      }
    })
    const crosshairIntersection = this.crosshairRay.cast()
    if (!this.hideSightCones) {
      // hide sight cones (for CPU agents)
      this.game.draw(visionIntersections)
      this.game.drawCrosshair(this.crosshairRay.origin, crosshairIntersection)
    }
    this.highlightCircle.setVelocity(this.sprite.body.velocity.x, this.sprite.body.velocity.y)
  }

  setRayDirection() {
    if (this.moveTarget && !this.shouldStop && !this.isPaused) {
      const angle = Phaser.Math.Angle.Between(
        this.sprite.x,
        this.sprite.y,
        this.moveTarget.x,
        this.moveTarget.y
      )
      this.visionRay.setAngle(angle)
      this.crosshairRay.setAngle(angle)
    }
  }

  private isAtMoveTarget() {
    if (!this.moveTarget) {
      return false
    }
    const distanceToTarget = Phaser.Math.Distance.Between(
      this.moveTarget.x,
      this.moveTarget.y,
      this.sprite.x,
      this.sprite.y
    )
    return distanceToTarget < 1
  }

  private moveTowardTarget() {
    if (this.isPaused) {
      this.sprite.setVelocity(0, 0)
      return
    }
    if (this.shouldStop) {
      this.moveTarget = null
      this.sprite.setVelocity(0, 0)
      return
    }
    if (this.moveTarget) {
      const angle = Phaser.Math.Angle.BetweenPoints(
        {
          x: this.sprite.x,
          y: this.sprite.y,
        },
        this.moveTarget
      )
      const velocityVector = new Phaser.Math.Vector2()
      this.game.physics.velocityFromRotation(angle, 100, velocityVector)
      this.sprite.setVelocity(velocityVector.x, velocityVector.y)
    }
  }

  moveToLocation(worldX: number, worldY: number) {
    this.shouldStop = false
    this.moveTarget = null
    const endTilePos = this.game.getTilePosForWorldPos(worldX, worldY)
    const currTilePos = this.game.getTilePosForWorldPos(this.sprite.x, this.sprite.y)
    const path = this.game.pathfinding.getPath(currTilePos, endTilePos)
    this.currPath = path
    this.tracePath()
  }

  tracePath() {
    this.pathLines.forEach((line) => {
      line.destroy()
    })
    this.pathLines = []
    const tileAtMoveTarget = this.currPath[0]
    if (!tileAtMoveTarget) {
      return
    }

    const currNodeWorldPos = this.game.getWorldPosForTilePos(
      tileAtMoveTarget.position.row,
      tileAtMoveTarget.position.col
    )
    const initialLine = this.game.add
      .line(0, 0, this.sprite.x, this.sprite.y, currNodeWorldPos.x, currNodeWorldPos.y)
      .setStrokeStyle(0.5, 0x00ff00)
      .setDisplayOrigin(0.5)
      .setDepth(Constants.SORT_LAYERS.UI)

    this.pathLines.push(initialLine)
    for (let i = 1; i < this.currPath.length; i++) {
      const prevNode = this.currPath[i - 1]
      const currNode = this.currPath[i]
      const prevNodeWorldPos = this.game.getWorldPosForTilePos(
        prevNode.position.row,
        prevNode.position.col
      )
      const currNodeWorldPos = this.game.getWorldPosForTilePos(
        currNode.position.row,
        currNode.position.col
      )
      const line = this.game.add
        .line(0, 0, currNodeWorldPos.x, currNodeWorldPos.y, prevNodeWorldPos.x, prevNodeWorldPos.y)
        .setStrokeStyle(0.5, 0x00ff00)
        .setDisplayOrigin(0.5)
        .setDepth(Constants.SORT_LAYERS.UI)

      this.pathLines.push(line)
    }
  }

  highlight() {
    this.highlightCircle.setPosition(this.sprite.x, this.sprite.y).setVisible(true)
  }

  dehighlight() {
    this.highlightCircle.setVisible(false)
  }

  pause() {
    this.isPaused = true
  }

  unpause() {
    this.isPaused = false
  }
}
