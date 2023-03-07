import { Agent } from '~/core/Agent'
import { Spike } from '~/core/Spike'
import { States } from '~/core/states/States'
import { BehaviorStatus } from '../../BehaviorStatus'
import { BehaviorTreeNode } from '../../BehaviorTreeNode'
import { Blackboard } from '../../Blackboard'
import { BlackboardKeys } from './BlackboardKeys'

export class RetrieveSpike extends BehaviorTreeNode {
  constructor(blackboard: Blackboard) {
    super('RetrieveSpike', blackboard)
  }

  public process(): BehaviorStatus {
    const spike = this.blackboard.getData(BlackboardKeys.SPIKE) as Spike
    const currAgent = this.blackboard.getData(BlackboardKeys.CURR_AGENT) as Agent
    currAgent.setState(States.MOVE, {
      x: spike.sprite.x,
      y: spike.sprite.y,
    })
    return BehaviorStatus.SUCCESS
  }
}
