import { Agent } from '~/core/Agent'
import { States } from '~/core/states/States'
import { BehaviorStatus } from '../nodes/BehaviorStatus'
import { BehaviorTreeNode } from '../nodes/BehaviorTreeNode'
import { Blackboard } from '../nodes/Blackboard'
import { BlackboardKeys } from './BlackboardKeys'

export class Idle extends BehaviorTreeNode {
  constructor(blackboard: Blackboard) {
    super('Idle', blackboard)
  }

  public process(trace?: boolean | undefined): BehaviorStatus {
    const currAgent = this.blackboard.getData(BlackboardKeys.CURR_AGENT) as Agent
    currAgent.fireOnSight = false
    if (currAgent.getCurrState() !== States.SHOOT) {
      currAgent.setState(States.IDLE)
    }
    return BehaviorStatus.SUCCESS
  }
}
