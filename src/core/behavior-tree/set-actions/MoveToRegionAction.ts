import { Agent } from '~/core/Agent'
import { MoveState } from '~/core/states/MoveState'
import { State } from '~/core/states/StateMachine'
import { States } from '~/core/states/States'
import Game from '~/scenes/Game'
import { MapConstants } from '~/utils/MapConstants'
import { Action, ActionStatus } from './Action'

export class MoveToRegionAction implements Action {
  public agent: Agent
  public moveLocation!: { x: number; y: number }
  public regionName: string
  public isMovingToTarget: boolean = false

  constructor(agent: Agent, regionName: string) {
    this.agent = agent
    this.regionName = regionName
  }

  assignMoveLocation(regionName: string) {
    const region = MapConstants.MAP_CALLOUT_LOCATIONS.find((region) => {
      return region.name === regionName
    })
    if (region) {
      const topLeftTile = Game.instance.getTileAt(region.topLeft.x, region.topLeft.y)
      const bottomRightTile = Game.instance.getTileAt(region.bottomRight.x, region.bottomRight.y)
      if (topLeftTile && bottomRightTile) {
        const row = Phaser.Math.Between(topLeftTile.y, bottomRightTile.y)
        const col = Phaser.Math.Between(topLeftTile.x, bottomRightTile.x)
        this.moveLocation = Game.instance.getWorldPosForTilePos(row, col)
      }
    }
  }

  getStatus(): ActionStatus {
    if (!this.isMovingToTarget) {
      return ActionStatus.NOT_STARTED
    }
    return MoveState.isAtMoveTarget(this.agent, this.moveLocation)
      ? ActionStatus.COMPLETE
      : ActionStatus.RUNNING
  }

  enter() {
    this.isMovingToTarget = true
    this.assignMoveLocation(this.regionName)
    this.agent.setState(States.MOVE, this.moveLocation)
  }

  exit() {
    this.isMovingToTarget = false
  }

  execute(...args: any): void {
    if (MoveState.isAtMoveTarget(this.agent, this.moveLocation)) {
      this.agent.setState(States.IDLE)
    }
  }
}
