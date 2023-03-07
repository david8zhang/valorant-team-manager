import { Agent } from '~/core/Agent'
import { States } from '~/core/states/States'
import { BehaviorStatus } from '../../BehaviorStatus'
import { BehaviorTreeNode } from '../../BehaviorTreeNode'
import { Blackboard } from '../../Blackboard'
import { TeamBlackboardKeys } from './TeamBlackboardKeys'

export class ShouldSelectNewSpikeCarrier extends BehaviorTreeNode {
  constructor(blackboard: Blackboard) {
    super('ShouldSelectNewSpikeCarrier', blackboard)
  }

  public process(): BehaviorStatus {
    const agents = this.blackboard.getData(TeamBlackboardKeys.AGENTS) as Agent[]
    const livingAgents = agents.filter((agent) => agent.getCurrState() !== States.DIE)
    if (livingAgents.length === 0) {
      return BehaviorStatus.FAILURE
    }

    const spikeCarrierName = this.blackboard.getData(TeamBlackboardKeys.SPIKE_CARRIER_NAME)
    const currSpikeCarrier = agents.find((agent) => agent.name == spikeCarrierName)
    if (currSpikeCarrier) {
      return currSpikeCarrier.getCurrState() === States.DIE
        ? BehaviorStatus.SUCCESS
        : BehaviorStatus.FAILURE
    }
    return BehaviorStatus.SUCCESS
  }
}
