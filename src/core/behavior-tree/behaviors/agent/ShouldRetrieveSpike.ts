import { Agent, Side } from '~/core/Agent'
import { CPU } from '~/core/CPU'
import { States } from '~/core/states/States'
import Game from '~/scenes/Game'
import { BehaviorStatus } from '../../BehaviorStatus'
import { BehaviorTreeNode } from '../../BehaviorTreeNode'
import { Blackboard } from '../../Blackboard'
import { TeamBlackboardKeys } from '../team/TeamBlackboardKeys'
import { BlackboardKeys } from './BlackboardKeys'

export class ShouldRetrieveSpike extends BehaviorTreeNode {
  constructor(blackboard: Blackboard) {
    super('ShouldRetrieveSpike', blackboard)
  }

  public process(): BehaviorStatus {
    const isAttacking = Game.instance.attackSide === Side.CPU
    const cpu = this.blackboard.getData(BlackboardKeys.CPU) as CPU
    const spikeCarrierName = cpu.teamBlackboard.getData(
      TeamBlackboardKeys.SPIKE_CARRIER_NAME
    ) as string
    const currAgent = this.blackboard.getData(BlackboardKeys.CURR_AGENT) as Agent

    // If the spike has already been planted
    if (Game.instance.spike.isPlanted) {
      return BehaviorStatus.FAILURE
    }

    // If the current agent is dead or is currently fighting
    if (currAgent.getCurrState() === States.DIE || currAgent.getCurrState() === States.SHOOT) {
      return BehaviorStatus.FAILURE
    }

    // If the current agent is not on the attacking side
    if (!isAttacking) {
      return BehaviorStatus.FAILURE
    }

    // If the current agent is not the currently designated spike carrier
    if (currAgent.name !== spikeCarrierName) {
      return BehaviorStatus.FAILURE
    }

    // If the current agent already has the spike
    if (currAgent.name === spikeCarrierName) {
      if (currAgent.hasSpike) {
        return BehaviorStatus.FAILURE
      }
    }
    return BehaviorStatus.SUCCESS
  }
}
