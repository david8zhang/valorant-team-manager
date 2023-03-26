import { BehaviorStatus } from '../../BehaviorStatus'
import { BehaviorTreeNode } from '../../BehaviorTreeNode'
import { Blackboard } from '../../Blackboard'

export class FightBack extends BehaviorTreeNode {
  constructor(blackboard: Blackboard) {
    super('FightBack', blackboard)
  }

  public process(): BehaviorStatus {
    // No op, since the agent will just handle the fight back behavior on its own
    return BehaviorStatus.SUCCESS
  }
}
