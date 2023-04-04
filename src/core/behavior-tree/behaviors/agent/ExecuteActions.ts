import { Agent } from '~/core/Agent'
import { CPU } from '~/core/CPU'
import { States } from '~/core/states/States'
import { BehaviorStatus } from '../../BehaviorStatus'
import { BehaviorTreeNode } from '../../BehaviorTreeNode'
import { Blackboard } from '../../Blackboard'
import { Action, ActionStatus } from '../../set-actions/Action'
import { TeamBlackboardKeys } from '../team/TeamBlackboardKeys'
import { BlackboardKeys } from './BlackboardKeys'

export class ExecuteActions extends BehaviorTreeNode {
  private actionSequence: Action[] | null = null

  constructor(blackboard: Blackboard) {
    super('ExecuteActions', blackboard)
  }

  public process(): BehaviorStatus {
    const agent = this.blackboard.getData(BlackboardKeys.CURR_AGENT) as Agent
    const cpu = this.blackboard.getData(BlackboardKeys.CPU) as CPU
    const teamBlackboard = cpu.teamBlackboard

    if (!this.actionSequence) {
      const actionSeqMap = teamBlackboard.getData(TeamBlackboardKeys.AGENT_ACTION_SEQUENCE_MAPPING)
      if (actionSeqMap) {
        this.actionSequence = actionSeqMap[agent.name]
      }
    } else {
      let actionToExecute = this.actionSequence[0] as Action
      if (actionToExecute) {
        if (actionToExecute.getStatus() === ActionStatus.COMPLETE) {
          this.actionSequence = this.actionSequence.slice(1)
          actionToExecute = this.actionSequence[0]
        } else {
          if (actionToExecute.getStatus() === ActionStatus.NOT_STARTED) {
            actionToExecute.enter()
          }
          actionToExecute.execute()
        }
      }
    }
    return BehaviorStatus.SUCCESS
  }
}
