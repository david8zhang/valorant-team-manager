import { Agent } from '~/core/Agent'
import { BehaviorStatus } from '~/core/behavior-tree/BehaviorStatus'
import { BehaviorTreeNode } from '~/core/behavior-tree/BehaviorTreeNode'
import { Blackboard } from '~/core/behavior-tree/Blackboard'
import { CPU } from '~/core/CPU'
import { BlackboardKeys } from '../BlackboardKeys'

export class IsOutnumbered extends BehaviorTreeNode {
  private static DISTANCE_THRESHOLD = 100

  constructor(blackboard: Blackboard) {
    super('IsOutnumbered', blackboard)
  }

  public process(trace?: boolean | undefined): BehaviorStatus {
    const cpu = this.blackboard.getData(BlackboardKeys.CPU) as CPU
    const enemyAgents = this.blackboard.getData(BlackboardKeys.PLAYER_AGENTS) as Agent[]
    const allyAgents = this.blackboard.getData(BlackboardKeys.CPU_AGENTS) as Agent[]
    const intelBoard = cpu.intel
    const currAgent = this.blackboard.getData(BlackboardKeys.CURR_AGENT) as Agent
    let numNearbyEnemies = 0
    enemyAgents.forEach((agent) => {
      const intelForAgent = intelBoard.retrieveIntelForAgentName(agent.name)
      if (intelForAgent && intelForAgent.lastKnownPosition && !intelForAgent.isDead) {
        const distance = Phaser.Math.Distance.Between(
          agent.sprite.x,
          agent.sprite.y,
          currAgent.sprite.x,
          currAgent.sprite.y
        )
        // TODO: Use shortest path distance to account for walls, rather than distance as the crow flies
        if (distance <= IsOutnumbered.DISTANCE_THRESHOLD) {
          numNearbyEnemies++
        }
      }
    })

    let numNearbyAllies = 0
    allyAgents.forEach((agent) => {
      const distance = Phaser.Math.Distance.Between(
        agent.sprite.x,
        agent.sprite.y,
        currAgent.sprite.x,
        currAgent.sprite.y
      )
      if (distance <= IsOutnumbered.DISTANCE_THRESHOLD) {
        numNearbyAllies++
      }
    })

    return numNearbyEnemies > numNearbyAllies ? BehaviorStatus.SUCCESS : BehaviorStatus.FAILURE
  }
}
