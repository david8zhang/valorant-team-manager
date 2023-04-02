import { BehaviorStatus } from './BehaviorStatus'
import { BehaviorTreeNode } from './BehaviorTreeNode'
import { Blackboard } from './Blackboard'

export class AndSequenceNode extends BehaviorTreeNode {
  public nodes: BehaviorTreeNode[]
  constructor(name: string, blackboard: Blackboard, nodes: BehaviorTreeNode[]) {
    super(name, blackboard)
    this.nodes = nodes
  }

  public process(): BehaviorStatus {
    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i]
      const status = node.tick()
      if (status !== BehaviorStatus.SUCCESS) {
        return status
      }
    }
    return BehaviorStatus.SUCCESS
  }
}
