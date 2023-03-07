import { Agent } from '~/core/Agent'
import { States } from '~/core/states/States'
import { BehaviorStatus } from '../../BehaviorStatus'
import { BehaviorTreeNode } from '../../BehaviorTreeNode'
import { Blackboard } from '../../Blackboard'
import { BlackboardKeys } from './BlackboardKeys'

export class Idle extends BehaviorTreeNode {
  constructor(blackboard: Blackboard) {
    super('Idle', blackboard)
  }

  public process(): BehaviorStatus {
    const currAgent = this.blackboard.getData(BlackboardKeys.CURR_AGENT) as Agent
    if (currAgent.getCurrState() !== States.DIE && currAgent.getCurrState() !== States.SHOOT) {
      currAgent.setState(States.IDLE)
    }
    return BehaviorStatus.SUCCESS
  }
}
