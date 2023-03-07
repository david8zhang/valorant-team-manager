import { Agent } from '~/core/Agent'
import { CPU } from '~/core/CPU'
import { MoveState } from '~/core/states/MoveState'
import { States } from '~/core/states/States'
import Game from '~/scenes/Game'
import { RoundState } from '~/utils/Constants'
import { BehaviorStatus } from '../../BehaviorStatus'
import { BehaviorTreeNode } from '../../BehaviorTreeNode'
import { Blackboard } from '../../Blackboard'
import { BlackboardKeys } from './BlackboardKeys'

export class ShouldMoveTowardSite extends BehaviorTreeNode {
  constructor(blackboard: Blackboard) {
    super('ShouldMoveTowardSite', blackboard)
  }

  public process(): BehaviorStatus {
    const currAgent = this.blackboard.getData(BlackboardKeys.CURR_AGENT) as Agent
    const cpu = this.blackboard.getData(BlackboardKeys.CPU) as CPU
    const currAgentDest = cpu.getCurrAgentMoveTarget(currAgent)
    if (
      MoveState.isAtMoveTarget(currAgent, currAgentDest) ||
      !this.canMoveTowardTarget(currAgent)
    ) {
      return BehaviorStatus.FAILURE
    }
    return BehaviorStatus.SUCCESS
  }

  canMoveTowardTarget(currAgent: Agent) {
    return (
      currAgent.getCurrState() !== States.SHOOT &&
      currAgent.getCurrState() !== States.DIE &&
      Game.instance.roundState !== RoundState.PREROUND
    )
  }
}
