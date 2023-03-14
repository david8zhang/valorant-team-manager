import Game from '~/scenes/Game'
import { Agent } from '../Agent'
import { State } from './StateMachine'

export interface JigglePeekConfig {
  start: { x: number; y: number }
  end: { x: number; y: number }
  peekLocation: { x: number; y: number }
}

export enum Direction {
  ToStart = 'ToStart',
  ToEnd = 'ToEnd',
}

export class JigglePeekState extends State {
  private start!: { x: number; y: number }
  private end!: { x: number; y: number }
  private arrivedAtDestination: boolean = false
  private moveTarget!: { x: number; y: number }
  private moveDirection!: Direction
  private peekLocation!: { x: number; y: number }

  enter(agent: Agent, config: JigglePeekConfig) {
    this.start = config.start
    this.end = config.end
    this.peekLocation = config.peekLocation
    const distToStart = Phaser.Math.Distance.Between(
      agent.sprite.x,
      agent.sprite.y,
      this.start.x,
      this.start.y
    )
    const distToEnd = Phaser.Math.Distance.Between(
      agent.sprite.x,
      agent.sprite.y,
      this.end.x,
      this.end.y
    )
    this.moveTarget = distToStart > distToEnd ? this.end : this.start
    this.moveDirection = distToStart > distToEnd ? Direction.ToEnd : Direction.ToStart
    this.arrivedAtDestination = false
  }

  exit(agent: Agent) {
    agent.clearPeekMarkers()
  }

  execute(agent: Agent) {
    if (this.moveTarget) {
      if (this.isAtMoveTarget(agent, this.moveTarget)) {
        this.arrivedAtDestination = true
      }
      this.moveTowardTarget(agent)
      this.updateVisionRay(agent)
    }
  }

  updateVisionRay(agent: Agent) {
    if (this.peekLocation) {
      const angle = Phaser.Math.Angle.Between(
        agent.sprite.x,
        agent.sprite.y,
        this.peekLocation.x,
        this.peekLocation.y
      )
      agent.visionRay.setAngle(angle)
      agent.crosshairRay.setAngle(angle)
    }
  }

  equals(point1: { x: number; y: number }, point2: { x: number; y: number }) {
    return point1.x === point2.x && point1.y === point2.y
  }

  public isAtMoveTarget(agent: Agent, moveTarget: { x: number; y: number } | null) {
    if (!moveTarget) {
      return false
    }
    const distanceToTarget = Phaser.Math.Distance.Between(
      moveTarget.x,
      moveTarget.y,
      agent.sprite.x,
      agent.sprite.y
    )
    return distanceToTarget < 1
  }

  private moveTowardTarget(agent: Agent) {
    if (Game.instance.isPaused) {
      agent.sprite.setVelocity(0, 0)
      return
    }
    if (this.arrivedAtDestination) {
      if (this.moveDirection === Direction.ToEnd && this.equals(this.moveTarget, this.end)) {
        this.arrivedAtDestination = false
        this.moveDirection = Direction.ToStart
        this.moveTarget = this.start
      } else if (
        this.moveDirection === Direction.ToStart &&
        this.equals(this.moveTarget, this.start)
      ) {
        this.arrivedAtDestination = false
        this.moveDirection = Direction.ToEnd
        this.moveTarget = this.end
      }
      return
    }
    if (this.moveTarget) {
      const angle = Phaser.Math.Angle.BetweenPoints(
        {
          x: agent.sprite.x,
          y: agent.sprite.y,
        },
        this.moveTarget
      )
      const velocityVector = new Phaser.Math.Vector2()
      Game.instance.physics.velocityFromRotation(angle, 100, velocityVector)
      agent.sprite.setVelocity(velocityVector.x, velocityVector.y)
    }
  }
}
