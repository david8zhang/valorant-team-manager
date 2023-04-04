import { Agent } from '~/core/Agent'
import { BehaviorStatus } from '~/core/behavior-tree/BehaviorStatus'
import { BehaviorTreeNode } from '~/core/behavior-tree/BehaviorTreeNode'
import { Blackboard } from '~/core/behavior-tree/Blackboard'
import { States } from '~/core/states/States'
import Game from '~/scenes/Game'
import { BlackboardKeys } from '../BlackboardKeys'

export class IsClosestToSpike extends BehaviorTreeNode {
  constructor(blackboard: Blackboard) {
    super('IsClosestToSpike', blackboard)
  }

  public process(): BehaviorStatus {
    const agents = this.blackboard.getData(BlackboardKeys.CPU_AGENTS) as Agent[]

    let minDistance = Number.MAX_SAFE_INTEGER
    let closestAgent = agents[0]

    for (let i = 0; i < agents.length; i++) {
      const agent = agents[i]
      if (agent.getCurrState() !== States.DIE) {
        const distToSpike = Phaser.Math.Distance.Between(
          agent.sprite.x,
          agent.sprite.y,
          Game.instance.spike.sprite.x,
          Game.instance.spike.sprite.y
        )
        if (distToSpike <= minDistance) {
          minDistance = distToSpike
          closestAgent = agent
        }
      }
    }
    const currAgent = this.blackboard.getData(BlackboardKeys.CURR_AGENT) as Agent
    return currAgent.name === closestAgent.name ? BehaviorStatus.SUCCESS : BehaviorStatus.FAILURE
  }
}
