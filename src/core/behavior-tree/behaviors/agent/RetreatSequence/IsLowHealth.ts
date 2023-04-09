import { BehaviorStatus } from '~/core/behavior-tree/BehaviorStatus'
import { BehaviorTreeNode } from '~/core/behavior-tree/BehaviorTreeNode'
import { Blackboard } from '~/core/behavior-tree/Blackboard'

export class IsLowHealth extends BehaviorTreeNode {
  constructor(blackboard: Blackboard) {
    super('IsLowHealth', blackboard)
  }

  public process(trace?: boolean | undefined): BehaviorStatus {
    return BehaviorStatus.SUCCESS
  }
}
