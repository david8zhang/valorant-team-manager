import { Agent } from '~/core/Agent'
import { BehaviorStatus } from '~/core/behavior-tree/BehaviorStatus'
import { BehaviorTreeNode } from '~/core/behavior-tree/BehaviorTreeNode'
import { Blackboard } from '~/core/behavior-tree/Blackboard'
import { BlackboardKeys } from '../BlackboardKeys'

export class HasSpike extends BehaviorTreeNode {
  constructor(blackboard: Blackboard) {
    super('HasSpike', blackboard)
  }

  public process(): BehaviorStatus {
    const currAgent = this.blackboard.getData(BlackboardKeys.CURR_AGENT) as Agent
    return currAgent.hasSpike ? BehaviorStatus.SUCCESS : BehaviorStatus.FAILURE
  }
}
