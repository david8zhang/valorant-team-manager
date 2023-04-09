import { Agent } from '~/core/Agent'
import { BehaviorStatus } from '~/core/behavior-tree/BehaviorStatus'
import { BehaviorTreeNode } from '~/core/behavior-tree/BehaviorTreeNode'
import { Blackboard } from '~/core/behavior-tree/Blackboard'
import { States } from '~/core/states/States'
import { BlackboardKeys } from '../BlackboardKeys'

export class TakeCover extends BehaviorTreeNode {
  constructor(blackboard: Blackboard) {
    super('TakeCover', blackboard)
  }
  public process(trace?: boolean | undefined): BehaviorStatus {
    const locationToRetreatTo = this.blackboard.getData(BlackboardKeys.SPOT_TO_RETREAT_TO)
    if (!locationToRetreatTo) {
      return BehaviorStatus.FAILURE
    }

    const currAgent = this.blackboard.getData(BlackboardKeys.CURR_AGENT) as Agent
    currAgent.fireOnSight = false
    currAgent.shouldFireBack = false
    currAgent.setState(States.MOVE, locationToRetreatTo)
    return BehaviorStatus.SUCCESS
  }
}
