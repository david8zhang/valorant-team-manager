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

  public process(trace: boolean = false): BehaviorStatus {
    const statusA = this.optionA.process(trace)
    if (statusA === BehaviorStatus.FAILURE) {
      const statusB = this.optionB.process(trace)
      if (trace) {
        console.log(this.optionB.name, statusB)
      }
      return statusB
    }
    if (trace) {
      console.log(this.optionA.name, statusA)
    }
    return statusA
  }
}
