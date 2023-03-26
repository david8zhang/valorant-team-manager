import { Agent } from '~/core/Agent'
import { States } from '~/core/states/States'
import { BehaviorStatus } from '../../BehaviorStatus'
import { BehaviorTreeNode } from '../../BehaviorTreeNode'
import { Blackboard } from '../../Blackboard'
import { BlackboardKeys } from './BlackboardKeys'

export class ShouldFightBack extends BehaviorTreeNode {
  constructor(blackboard: Blackboard) {
    super('ShouldFightBack', blackboard)
  }

  public process(): BehaviorStatus {
    const agent = this.blackboard.getData(BlackboardKeys.CURR_AGENT) as Agent
    return agent.isBeingShotAt || agent.getCurrState() === States.SHOOT
      ? BehaviorStatus.SUCCESS
      : BehaviorStatus.FAILURE
  }
}
