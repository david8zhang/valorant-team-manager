import { Agent } from '~/core/Agent'
import { States } from '~/core/states/States'
import Game from '~/scenes/Game'
import { MapConstants } from '~/utils/MapConstants'
import { BehaviorStatus } from '../nodes/BehaviorStatus'
import { BehaviorTreeNode } from '../nodes/BehaviorTreeNode'
import { Blackboard } from '../nodes/Blackboard'
import { BlackboardKeys } from './BlackboardKeys'

export class MoveToZone extends BehaviorTreeNode {
  private currMoveLocation: { x: number; y: number } | null = null

  constructor(blackboard: Blackboard) {
    super('MoveToZone', blackboard)
  }

  public process(trace?: boolean | undefined): BehaviorStatus {
    if (!this.currMoveLocation) {
      const allRegions = MapConstants.MAP_CALLOUT_LOCATIONS
      const randomRegion = allRegions[Phaser.Math.Between(0, allRegions.length - 1)]

      const topLeftTile = Game.instance.getTileAt(randomRegion.topLeft.x, randomRegion.topLeft.y)
      const bottomRightTile = Game.instance.getTileAt(
        randomRegion.bottomRight.x,
        randomRegion.bottomRight.y
      )
      if (topLeftTile && bottomRightTile) {
        const row = Phaser.Math.Between(topLeftTile.y, bottomRightTile.y)
        const col = Phaser.Math.Between(topLeftTile.x, bottomRightTile.x)
        this.currMoveLocation = Game.instance.getWorldPosForTilePos(row, col)
      }
    }
    const currAgent = this.blackboard.getData(BlackboardKeys.CURR_AGENT) as Agent
    currAgent.fireOnSight = true
    if (currAgent.getCurrState() !== States.SHOOT && currAgent.getCurrState() !== States.MOVE) {
      currAgent.setState(States.MOVE, this.currMoveLocation, () => {
        this.currMoveLocation = null
      })
    }
    return BehaviorStatus.SUCCESS
  }
}
