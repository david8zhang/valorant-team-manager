import { Agent } from '~/core/Agent'
import { BehaviorStatus } from '~/core/behavior-tree/BehaviorStatus'
import { BehaviorTreeNode } from '~/core/behavior-tree/BehaviorTreeNode'
import { Blackboard } from '~/core/behavior-tree/Blackboard'
import { BlackboardKeys } from '../BlackboardKeys'

export class IsBeingShotAt extends BehaviorTreeNode {
  constructor(blackboard: Blackboard) {
    super('IsBeingShotAt', blackboard)
  }

  public process(trace?: boolean | undefined): BehaviorStatus {
    const currAgent = this.blackboard.getData(BlackboardKeys.CURR_AGENT) as Agent
    if (currAgent.isBeingShotAt) {
      return BehaviorStatus.SUCCESS
    }
    return BehaviorStatus.FAILURE
  }
}
