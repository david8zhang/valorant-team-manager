import { Agent } from '~/core/Agent'
import { CPU } from '~/core/CPU'
import { States } from '~/core/states/States'
import { Constants } from '~/utils/Constants'
import { BehaviorStatus } from '../../BehaviorStatus'
import { BehaviorTreeNode } from '../../BehaviorTreeNode'
import { Blackboard } from '../../Blackboard'
import { BlackboardKeys } from './BlackboardKeys'

export class MoveTowardSite extends BehaviorTreeNode {
  public isMoving: boolean = false

  constructor(blackboard: Blackboard) {
    super('MoveTowardSite', blackboard)
  }

  public process(): BehaviorStatus {
    const currAgent = this.blackboard.getData(BlackboardKeys.CURR_AGENT) as Agent
    const cpu = this.blackboard.getData(BlackboardKeys.CPU) as CPU
    currAgent.fireOnSight = true

    if (!this.isMoving) {
      const currDest = cpu.getCurrAgentMoveTarget(currAgent)
      if (currDest) {
        this.isMoving = true
        currAgent.setState(States.MOVE, currDest)
      }
      return BehaviorStatus.SUCCESS
    } else {
      if (currAgent.getCurrState() !== States.MOVE) {
        const currDest = cpu.getCurrAgentMoveTarget(currAgent)
        currAgent.setState(States.MOVE, currDest)
      }
      return BehaviorStatus.RUNNING
    }
  }
}
