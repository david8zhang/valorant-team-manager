import { Agent } from '~/core/Agent'
import { CPU } from '~/core/CPU'
import { States } from '~/core/states/States'
import { Constants } from '~/utils/Constants'
import { BehaviorStatus } from '../../BehaviorStatus'
import { BehaviorTreeNode } from '../../BehaviorTreeNode'
import { Blackboard } from '../../Blackboard'
import { BlackboardKeys } from './BlackboardKeys'

export class MoveTowardSite extends BehaviorTreeNode {
  public currDest: { x: number; y: number } | null = null

  constructor(blackboard: Blackboard) {
    super('MoveTowardSite', blackboard)
  }

  public process(): BehaviorStatus {
    const currAgent = this.blackboard.getData(BlackboardKeys.CURR_AGENT) as Agent
    const cpu = this.blackboard.getData(BlackboardKeys.CPU) as CPU

    if (!this.currDest) {
      this.currDest = this.getSiteToAttackLocation()
      cpu.setAgentMoveTarget(currAgent, this.currDest)
      currAgent.setState(States.MOVE, this.currDest)
      return BehaviorStatus.SUCCESS
    } else {
      if (currAgent.getCurrState() !== States.MOVE) {
        currAgent.setState(States.MOVE, this.currDest)
      }
      return BehaviorStatus.RUNNING
    }
  }

  getSiteToAttackLocation() {
    const randSitePositions =
      Phaser.Math.Between(0, 1) === 0 ? Constants.A_SITE_POSITIONS : Constants.B_SITE_POSITIONS
    return randSitePositions[Phaser.Math.Between(0, randSitePositions.length - 1)]
  }
}
