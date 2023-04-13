import { BehaviorStatus } from './BehaviorStatus'
import { BehaviorTreeNode } from './BehaviorTreeNode'
import { Blackboard } from './Blackboard'

export class OrSequenceNode extends BehaviorTreeNode {
  private children: BehaviorTreeNode[]
  constructor(name: string, blackboard: Blackboard, children: BehaviorTreeNode[]) {
    super(name, blackboard)
    this.children = children
  }

  public process(trace: boolean = false): BehaviorStatus {
    for (let i = 0; i < this.children.length; i++) {
      const currNode = this.children[i]
      const status = currNode.process(trace)
      if (trace) {
        console.log(currNode.name, status)
      }
      if (status !== BehaviorStatus.FAILURE) {
        return status
      }
    }
    return BehaviorStatus.FAILURE
  }
}
