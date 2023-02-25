import Game from '~/scenes/Game'
import { Node } from './Pathfinding'

export interface AgentConfig {
  position: {
    x: number
    y: number
  }
  texture: string
}

export class Agent {
  public ray: any
  public game: Game
  public sprite: Phaser.Physics.Arcade.Sprite
  public currPath: Node[] = []
  public moveTarget: { x: number; y: number } | null = null
  public shouldStop: boolean = false
  public endTile!: Phaser.Tilemaps.Tile

  constructor(config: AgentConfig) {
    this.game = Game.instance
    this.ray = this.game.raycaster.createRay({
      origin: config.position,
    })
    this.ray.setAngle(Phaser.Math.DegToRad(90))
    this.ray.setConeDeg(60)
    this.sprite = this.game.physics.add.sprite(config.position.x, config.position.y, config.texture)
  }

  update() {
    if (this.isAtMoveTarget() || !this.moveTarget) {
      const nextNode = this.currPath.shift()
      if (nextNode) {
        this.moveTarget = this.game.getWorldPosForTilePos(
          nextNode.position.row,
          nextNode.position.col
        )
      } else {
        this.shouldStop = true
      }
    }
    this.moveTowardTarget()
    this.ray.setOrigin(this.sprite.x, this.sprite.y)
    this.setRayDirection()

    const intersections = this.ray.castCone()
    intersections.push(this.ray.origin)
    this.game.draw(intersections)
  }

  setRayDirection() {
    if (this.moveTarget && !this.shouldStop) {
      const angle = Phaser.Math.Angle.Between(
        this.sprite.x,
        this.sprite.y,
        this.moveTarget.x,
        this.moveTarget.y
      )
      this.ray.setAngle(angle)
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
    if (this.shouldStop) {
      if (this.endTile) {
        this.endTile.setAlpha(1)
      }
      this.moveTarget = null
      this.sprite.setVelocity(0, 0)
    } else if (this.moveTarget) {
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
    if (this.shouldStop) {
      this.shouldStop = false
      this.endTile = this.game.getTileAt(worldX, worldY)
      this.endTile.setAlpha(0.5)
      const endTilePos = this.game.getTilePosForWorldPos(worldX, worldY)
      const currTilePos = this.game.getTilePosForWorldPos(this.sprite.x, this.sprite.y)
      const path = this.game.pathfinding.getPath(currTilePos, endTilePos)
      this.currPath = path
    }
  }
}
