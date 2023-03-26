import { Agent } from '~/core/Agent'
import { CPU } from '~/core/CPU'
import { BehaviorStatus } from '../../BehaviorStatus'
import { BehaviorTreeNode } from '../../BehaviorTreeNode'
import { Blackboard } from '../../Blackboard'
import { BlackboardKeys } from './BlackboardKeys'

export class IdentifyBestHoldAngle extends BehaviorTreeNode {
  constructor(blackboard: Blackboard) {
    super('IdentifyBestHoldAngle', blackboard)
  }

  public process(): BehaviorStatus {
    const currAgent = this.blackboard.getData(BlackboardKeys.CURR_AGENT) as Agent
    const cpu = this.blackboard.getData(BlackboardKeys.CPU) as CPU

    // Identify angles that the enemy could be at and select the best one based on estimated enemy positions
    const intelMapping = cpu.intel.retrieveIntel()

    return BehaviorStatus.SUCCESS
  }
}
