import { BehaviorStatus } from '~/core/behavior-tree/BehaviorStatus'
import { BehaviorTreeNode } from '~/core/behavior-tree/BehaviorTreeNode'
import { Blackboard } from '~/core/behavior-tree/Blackboard'

export class IsBlinded extends BehaviorTreeNode {
  constructor(blackboard: Blackboard) {
    super('IsBlinded', blackboard)
  }

  public process(trace?: boolean | undefined): BehaviorStatus {
    return BehaviorStatus.FAILURE
  }
}
