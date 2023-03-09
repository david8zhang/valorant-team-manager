import { Agent } from '~/core/Agent'
import { States } from '~/core/states/States'
import Game from '~/scenes/Game'
import { RoundState } from '~/utils/Constants'
import { BehaviorStatus } from '../../BehaviorStatus'
import { BehaviorTreeNode } from '../../BehaviorTreeNode'
import { Blackboard } from '../../Blackboard'
import { BlackboardKeys } from './BlackboardKeys'

export class ShouldPlantSpike extends BehaviorTreeNode {
  constructor(blackboard: Blackboard) {
    super('ShouldPlantSpike', blackboard)
  }

  public process(): BehaviorStatus {
    const currAgent = this.blackboard.getData(BlackboardKeys.CURR_AGENT) as Agent
    if (currAgent.getCurrState() === States.DIE || currAgent.getCurrState() === States.SHOOT) {
      return BehaviorStatus.FAILURE
    }
    if (Game.instance.roundState !== RoundState.PRE_PLANT_ROUND) {
      return BehaviorStatus.FAILURE
    }

    if (currAgent.hasSpike && Game.instance.attackSide === currAgent.side) {
      return BehaviorStatus.SUCCESS
    }
    return BehaviorStatus.FAILURE
  }
}
