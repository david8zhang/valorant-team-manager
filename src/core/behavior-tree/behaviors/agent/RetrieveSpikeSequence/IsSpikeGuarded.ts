import { Agent } from '~/core/Agent'
import { BehaviorStatus } from '~/core/behavior-tree/BehaviorStatus'
import { BehaviorTreeNode } from '~/core/behavior-tree/BehaviorTreeNode'
import { Blackboard } from '~/core/behavior-tree/Blackboard'
import { BlackboardKeys } from '../BlackboardKeys'

export class IsSpikeGuarded extends BehaviorTreeNode {
  constructor(blackboard: Blackboard) {
    super('IsSpikeGuarded', blackboard)
  }

  public process(): BehaviorStatus {
    const enemyAgents = this.blackboard.getData(BlackboardKeys.PLAYER_AGENTS) as Agent[]
    return BehaviorStatus.FAILURE
  }
}
