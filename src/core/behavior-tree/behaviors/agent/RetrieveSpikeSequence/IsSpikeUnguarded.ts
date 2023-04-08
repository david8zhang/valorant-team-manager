import { Agent } from '~/core/Agent'
import { BehaviorStatus } from '~/core/behavior-tree/BehaviorStatus'
import { BehaviorTreeNode } from '~/core/behavior-tree/BehaviorTreeNode'
import { Blackboard } from '~/core/behavior-tree/Blackboard'
import { CPU } from '~/core/CPU'
import Game from '~/scenes/Game'
import { BlackboardKeys } from '../BlackboardKeys'

export class IsSpikeUnguarded extends BehaviorTreeNode {
  private static DISTANCE_THRESHOLD = 150

  constructor(blackboard: Blackboard) {
    super('IsSpikeUnguarded', blackboard)
  }

  public process(): BehaviorStatus {
    // Utilize intel to determine if spike is guarded or not
    const cpu = this.blackboard.getData(BlackboardKeys.CPU) as CPU
    const enemyAgents = this.blackboard.getData(BlackboardKeys.PLAYER_AGENTS) as Agent[]
    const intelBoard = cpu.intel

    let numAgentsWithinDistThreshold = 0
    const spike = Game.instance.spike

    enemyAgents.forEach((agent: Agent) => {
      const intelForAgent = intelBoard.retrieveIntelForAgentName(agent.name)
      if (intelForAgent && intelForAgent.lastKnownPosition) {
        const estimatedPosition = intelForAgent.lastKnownPosition
        const distToSpike = Phaser.Math.Distance.Between(
          estimatedPosition.x,
          estimatedPosition.y,
          spike.sprite.x,
          spike.sprite.y
        )
        if (distToSpike <= IsSpikeUnguarded.DISTANCE_THRESHOLD) {
          numAgentsWithinDistThreshold++
        }
      }
    })
    return numAgentsWithinDistThreshold === 0 ? BehaviorStatus.SUCCESS : BehaviorStatus.FAILURE
  }
}
