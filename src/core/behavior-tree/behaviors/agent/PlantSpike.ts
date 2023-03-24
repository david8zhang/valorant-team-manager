import { Agent } from '~/core/Agent'
import { CPU } from '~/core/CPU'
import { States } from '~/core/states/States'
import { BehaviorStatus } from '../../BehaviorStatus'
import { BehaviorTreeNode } from '../../BehaviorTreeNode'
import { Blackboard } from '../../Blackboard'
import { BlackboardKeys } from './BlackboardKeys'

export class PlantSpike extends BehaviorTreeNode {
  constructor(blackboard: Blackboard) {
    super('PlantSpike', blackboard)
  }

  public process(): BehaviorStatus {
    const cpu = this.blackboard.getData(BlackboardKeys.CPU) as CPU
    const currAgent = this.blackboard.getData(BlackboardKeys.CURR_AGENT) as Agent
    const plantLocation = cpu.getCurrAgentMoveTarget(currAgent)
    currAgent.fireOnSight = true

    if (plantLocation) {
      const currAgent = this.blackboard.getData(BlackboardKeys.CURR_AGENT) as Agent
      if (currAgent.getCurrState() !== States.PLANT) {
        currAgent.setState(States.PLANT, plantLocation)
      }
    }
    return BehaviorStatus.SUCCESS
  }
}
