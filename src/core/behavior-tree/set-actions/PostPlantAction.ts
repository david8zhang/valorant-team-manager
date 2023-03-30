import { Agent } from '~/core/Agent'
import { MoveState } from '~/core/states/MoveState'
import { States } from '~/core/states/States'
import Game from '~/scenes/Game'
import { ALL_POST_PLANT_POSITIONS } from '~/utils/CPUConstants'
import { Action, ActionStatus } from './Action'

export class PostPlantAction implements Action {
  public agent: Agent
  public postPlantPosition: {
    holdPosition: { x: number; y: number }
    position: { x: number; y: number }
  }
  public isMovingToPostPlantPosition: boolean = false

  constructor(agent: Agent, postPlantPositionName: string) {
    this.agent = agent
    this.postPlantPosition = this.getPostPlantPositionFromName(postPlantPositionName)
  }

  getPostPlantPositionFromName(name: string) {
    const postPlantPosition = ALL_POST_PLANT_POSITIONS.find((p) => p.name === name)
    if (!postPlantPosition) {
      throw new Error('Could not find post plant location with name: ' + name)
    }
    return postPlantPosition
  }

  getStatus(): ActionStatus {
    if (!this.isMovingToPostPlantPosition) {
      return ActionStatus.NOT_STARTED
    }
    const isCompleted =
      MoveState.isAtMoveTarget(this.agent, this.postPlantPosition.position) &&
      this.positionEquals(this.agent.holdLocation, this.postPlantPosition.holdPosition)
    return isCompleted ? ActionStatus.COMPLETE : ActionStatus.RUNNING
  }

  positionEquals(locA: { x: number; y: number } | null, locB: { x: number; y: number } | null) {
    if (!locA || !locB) {
      return false
    }
    return locA.x === locB.x && locA.y === locB.y
  }

  enter() {}

  execute(): void {
    if (Game.instance.spike.isPlanted) {
      this.isMovingToPostPlantPosition = true
      if (!MoveState.isAtMoveTarget(this.agent, this.postPlantPosition.position)) {
        if (this.agent.getCurrState() !== States.MOVE) {
          this.agent.setState(States.MOVE, this.postPlantPosition.position)
        }
      } else {
        this.agent.setState(States.IDLE)
        const holdPosition = this.postPlantPosition.holdPosition
        this.agent.setHoldLocation(holdPosition.x, holdPosition.y)
      }
    }
  }

  exit(): void {
    this.isMovingToPostPlantPosition = false
  }
}
