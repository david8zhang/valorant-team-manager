import Game from '~/scenes/Game'
import { Constants } from '~/utils/Constants'
import { Agent } from '../Agent'
import { Node } from '../Pathfinding'
import { State } from './StateMachine'
import { States } from './States'

export class MoveState extends State {
  public currPath: Node[] = []
  public currNodeToMoveTo: Node | undefined
  public pathLines: Phaser.GameObjects.Line[] = []
  public shouldStop: boolean = false
  public moveTarget: { x: number; y: number } | null = null

  enter(agent: Agent, pointToMoveTo: { x: number; y: number }) {
    this.shouldStop = false
    this.moveTarget = null
    const endTilePos = Game.instance.getTilePosForWorldPos(pointToMoveTo.x, pointToMoveTo.y)
    const currTilePos = Game.instance.getTilePosForWorldPos(agent.sprite.x, agent.sprite.y)
    const path = Game.instance.pathfinding.getPath(currTilePos, endTilePos)
    this.currPath = path
    this.tracePath(agent)
  }

  execute(agent: Agent) {
    this.tracePath(agent)
    if (this.isAtMoveTarget(agent) || !this.moveTarget) {
      const currNode = this.currPath.shift()
      if (currNode) {
        this.moveTarget = Game.instance.getWorldPosForTilePos(
          currNode.position.row,
          currNode.position.col
        )
      } else {
        this.shouldStop = true
      }
    }
    this.moveTowardTarget(agent)
    this.setRayDirection(agent)
  }

  private tracePath(agent: Agent) {
    this.pathLines.forEach((line) => {
      line.destroy()
    })
    this.pathLines = []
    const tileAtMoveTarget = this.currPath[0]
    if (!tileAtMoveTarget) {
      return
    }

    const currNodeWorldPos = Game.instance.getWorldPosForTilePos(
      tileAtMoveTarget.position.row,
      tileAtMoveTarget.position.col
    )
    const initialLine = Game.instance.add
      .line(0, 0, agent.sprite.x, agent.sprite.y, currNodeWorldPos.x, currNodeWorldPos.y)
      .setStrokeStyle(0.5, 0x00ff00)
      .setDisplayOrigin(0.5)
      .setDepth(Constants.SORT_LAYERS.UI)
    this.pathLines.push(initialLine)
    for (let i = 1; i < this.currPath.length; i++) {
      const prevNode = this.currPath[i - 1]
      const currNode = this.currPath[i]
      const prevNodeWorldPos = Game.instance.getWorldPosForTilePos(
        prevNode.position.row,
        prevNode.position.col
      )
      const currNodeWorldPos = Game.instance.getWorldPosForTilePos(
        currNode.position.row,
        currNode.position.col
      )
      const line = Game.instance.add
        .line(0, 0, currNodeWorldPos.x, currNodeWorldPos.y, prevNodeWorldPos.x, prevNodeWorldPos.y)
        .setStrokeStyle(0.5, 0x00ff00)
        .setDisplayOrigin(0.5)
        .setDepth(Constants.SORT_LAYERS.UI)
      this.pathLines.push(line)
    }
  }

  private isAtMoveTarget(agent: Agent) {
    if (!this.moveTarget) {
      return false
    }
    const distanceToTarget = Phaser.Math.Distance.Between(
      this.moveTarget.x,
      this.moveTarget.y,
      agent.sprite.x,
      agent.sprite.y
    )
    return distanceToTarget < 1
  }

  private setRayDirection(agent: Agent) {
    if (this.moveTarget && !this.shouldStop && !agent.isPaused) {
      const angle = Phaser.Math.Angle.Between(
        agent.sprite.x,
        agent.sprite.y,
        this.moveTarget.x,
        this.moveTarget.y
      )
      agent.visionRay.setAngle(angle)
      agent.crosshairRay.setAngle(angle)
    }
  }

  private moveTowardTarget(agent: Agent) {
    if (agent.isPaused) {
      agent.sprite.setVelocity(0, 0)
      return
    }
    if (this.shouldStop) {
      this.moveTarget = null
      agent.setState(States.IDLE)
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
