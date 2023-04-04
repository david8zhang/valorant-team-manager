import { Agent } from '~/core/Agent'
import { BehaviorStatus } from '~/core/behavior-tree/BehaviorStatus'
import { BehaviorTreeNode } from '~/core/behavior-tree/BehaviorTreeNode'
import { Blackboard } from '~/core/behavior-tree/Blackboard'
import Game from '~/scenes/Game'
import { BlackboardKeys } from '../BlackboardKeys'

export class IsSpikeUnguarded extends BehaviorTreeNode {
  constructor(blackboard: Blackboard) {
    super('IsSpikeUnguarded', blackboard)
  }

  public process(): BehaviorStatus {
    const enemyAgents = this.blackboard.getData(BlackboardKeys.PLAYER_AGENTS) as Agent[]
    const spike = Game.instance.spike
    for (let i = 0; i < enemyAgents.length; i++) {
      const enemyAgent = enemyAgents[i]
      if (enemyAgent.isPointWithinVision(spike.sprite.x, spike.sprite.y)) {
        return BehaviorStatus.FAILURE
      }
    }
    return BehaviorStatus.SUCCESS
  }
}
