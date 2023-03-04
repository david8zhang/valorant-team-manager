import { BehaviorStatus } from './BehaviorStatus'
import { BehaviorTreeNode } from './BehaviorTreeNode'
import { Blackboard } from './Blackboard'

export class SelectorNode extends BehaviorTreeNode {
  public optionA: BehaviorTreeNode
  public optionB: BehaviorTreeNode
  constructor(
    name: string,
    blackboard: Blackboard,
    optionA: BehaviorTreeNode,
    optionB: BehaviorTreeNode
  ) {
    super(name, blackboard)
    this.optionA = optionA
    this.optionB = optionB
  }

  public process(): BehaviorStatus {
    const status = this.optionA.tick()
    if (status === BehaviorStatus.FAILURE) {
      return this.optionB.tick()
    }
    return status
  }
}
