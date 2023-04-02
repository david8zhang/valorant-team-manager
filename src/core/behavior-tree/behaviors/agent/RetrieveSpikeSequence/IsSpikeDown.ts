import { Agent } from '~/core/Agent'
import Game from '~/scenes/Game'
import { BehaviorStatus } from '../../../BehaviorStatus'
import { BehaviorTreeNode } from '../../../BehaviorTreeNode'
import { Blackboard } from '../../../Blackboard'
import { BlackboardKeys } from '../BlackboardKeys'

export class IsSpikeDown extends BehaviorTreeNode {
  constructor(blackboard: Blackboard) {
    super('IsSpikeDown', blackboard)
  }

  public process(): BehaviorStatus {
    const spike = Game.instance.spike
    if (!spike.isPlanted) {
      const agents = this.blackboard.getData(BlackboardKeys.CPU_AGENTS) as Agent[]
      for (let i = 0; i < agents.length; i++) {
        const agent = agents[i]
        if (agent.hasSpike) {
          return BehaviorStatus.FAILURE
        }
      }
      return BehaviorStatus.SUCCESS
    }
    return BehaviorStatus.FAILURE
  }
}
