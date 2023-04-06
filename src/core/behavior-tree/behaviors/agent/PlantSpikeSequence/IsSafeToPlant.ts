import { Agent } from '~/core/Agent'
import { BehaviorStatus } from '~/core/behavior-tree/BehaviorStatus'
import { BehaviorTreeNode } from '~/core/behavior-tree/BehaviorTreeNode'
import { Blackboard } from '~/core/behavior-tree/Blackboard'
import { Constants } from '~/utils/Constants'
import { MapConstants } from '~/utils/MapConstants'
import { BlackboardKeys } from '../BlackboardKeys'

export class IsSafeToPlant extends BehaviorTreeNode {
  constructor(blackboard: Blackboard) {
    super('IsSafeToPlant', blackboard)
  }

  public process(): BehaviorStatus {
    const unguardedPctA = this.getNumUnwatchedPositions(MapConstants.A_SITE_POSITIONS)
    const unguardedPctB = this.getNumUnwatchedPositions(MapConstants.B_SITE_POSITIONS)
    return unguardedPctA >= 0.5 || unguardedPctB >= 0.5
      ? BehaviorStatus.SUCCESS
      : BehaviorStatus.FAILURE
  }

  getNumUnwatchedPositions(positions: { x: number; y: number }[]) {
    let numPositions = 0
    const enemyAgents = this.blackboard.getData(BlackboardKeys.PLAYER_AGENTS) as Agent[]
    for (let i = 0; i < positions.length; i++) {
      const position = positions[i]
      for (let j = 0; j < enemyAgents.length; j++) {
        const agent = enemyAgents[j]
        if (!agent.isPointWithinVision(position.x, position.y)) {
          numPositions++
        }
      }
    }
    return numPositions / positions.length
  }
}
