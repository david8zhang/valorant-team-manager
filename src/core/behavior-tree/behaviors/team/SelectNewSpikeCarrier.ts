import { Agent } from '~/core/Agent'
import { States } from '~/core/states/States'
import { BehaviorStatus } from '../../BehaviorStatus'
import { BehaviorTreeNode } from '../../BehaviorTreeNode'
import { Blackboard } from '../../Blackboard'
import { TeamBlackboardKeys } from './TeamBlackboardKeys'

export class SelectNewSpikeCarrier extends BehaviorTreeNode {
  constructor(blackboard: Blackboard) {
    super('SelectNewSpikeCarrier', blackboard)
  }

  public process(): BehaviorStatus {
    if (this.shouldSelectNewSpikeCarrier()) {
      const agents = this.blackboard.getData(TeamBlackboardKeys.AGENTS) as Agent[]
      const livingAgents = agents.filter((agent) => {
        return agent.getCurrState() !== States.DIE
      })
      const randomAgent = livingAgents[Phaser.Math.Between(0, livingAgents.length - 1)]
      this.blackboard.setData(TeamBlackboardKeys.SPIKE_CARRIER_NAME, randomAgent.name)
    }
    return BehaviorStatus.SUCCESS
  }

  private shouldSelectNewSpikeCarrier() {
    const agents = this.blackboard.getData(TeamBlackboardKeys.AGENTS) as Agent[]
    const livingAgents = agents.filter((agent) => agent.getCurrState() !== States.DIE)
    if (livingAgents.length === 0) {
      return false
    }

    const spikeCarrierName = this.blackboard.getData(TeamBlackboardKeys.SPIKE_CARRIER_NAME)
    const currSpikeCarrier = agents.find((agent) => agent.name == spikeCarrierName)
    if (currSpikeCarrier) {
      return currSpikeCarrier.getCurrState() === States.DIE
    }
    return true
  }
}
