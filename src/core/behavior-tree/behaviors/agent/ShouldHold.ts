import { Agent } from '~/core/Agent'
import Game from '~/scenes/Game'
import { BehaviorStatus } from '../../BehaviorStatus'
import { BehaviorTreeNode } from '../../BehaviorTreeNode'
import { Blackboard } from '../../Blackboard'
import { BlackboardKeys } from './BlackboardKeys'

export class ShouldHold extends BehaviorTreeNode {
  constructor(blackboard: Blackboard) {
    super('ShouldHold', blackboard)
  }

  public process(): BehaviorStatus {
    const agent = this.blackboard.getData(BlackboardKeys.CURR_AGENT) as Agent
    if (Game.instance.attackSide === agent.side) {
      const spike = Game.instance.spike
      return spike.isPlanted ? BehaviorStatus.SUCCESS : BehaviorStatus.FAILURE
    } else {
      return BehaviorStatus.SUCCESS
    }
  }
}
