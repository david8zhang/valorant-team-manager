import { Agent } from '~/core/Agent'
import { BehaviorStatus } from '~/core/behavior-tree/BehaviorStatus'
import { BehaviorTreeNode } from '~/core/behavior-tree/BehaviorTreeNode'
import { Blackboard } from '~/core/behavior-tree/Blackboard'
import { CPU } from '~/core/CPU'
import { Constants, Sites } from '~/utils/Constants'
import { MapConstants } from '~/utils/MapConstants'
import { BlackboardKeys } from '../BlackboardKeys'

export class SetSiteToPlantOn extends BehaviorTreeNode {
  constructor(blackboard: Blackboard) {
    super('IsSafeToPlant', blackboard)
  }

  public process(): BehaviorStatus {
    const cpu = this.blackboard.getData(BlackboardKeys.CPU) as CPU
    const enemyAgents = this.blackboard.getData(BlackboardKeys.PLAYER_AGENTS) as Agent[]
    const intelBoard = cpu.intel

    let numAgentsA = 0
    let numAgentsB = 0

    const aSiteCenterPos = MapConstants.A_SITE_CENTER_POS
    const bSiteCenterPos = MapConstants.B_SITE_CENTER_POS

    enemyAgents.forEach((agent: Agent) => {
      const intelForAgent = intelBoard.retrieveIntelForAgentName(agent.name)
      if (intelForAgent && intelForAgent.lastKnownPosition) {
        const estimatedPosition = intelForAgent.lastKnownPosition
        const distToA = Phaser.Math.Distance.Between(
          estimatedPosition.x,
          estimatedPosition.y,
          aSiteCenterPos.x,
          aSiteCenterPos.y
        )
        const distToB = Phaser.Math.Distance.Between(
          estimatedPosition.x,
          estimatedPosition.y,
          bSiteCenterPos.x,
          bSiteCenterPos.y
        )
        if (distToA > distToB) {
          numAgentsA++
        } else {
          numAgentsB++
        }
      } else {
        numAgentsB++
      }
    })
    const siteToPlantOn = numAgentsA > numAgentsB ? Sites.B : Sites.A
    this.blackboard.setData(BlackboardKeys.SITE_TO_PLANT_ON, siteToPlantOn)
    return BehaviorStatus.SUCCESS
  }
}
