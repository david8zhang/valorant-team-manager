import Round from '~/scenes/Round'
import { RoundState } from '~/utils/RoundConstants'
import { BehaviorStatus } from '../nodes/BehaviorStatus'
import { BehaviorTreeNode } from '../nodes/BehaviorTreeNode'
import { Blackboard } from '../nodes/Blackboard'

export class ShouldMoveToZone extends BehaviorTreeNode {
  constructor(blackboard: Blackboard) {
    super('ShouldMoveToZone', blackboard)
  }

  public process(trace?: boolean | undefined): BehaviorStatus {
    return Round.instance.roundState === RoundState.MID_ROUND ||
      Round.instance.roundState === RoundState.OVERTIME
      ? BehaviorStatus.SUCCESS
      : BehaviorStatus.FAILURE
  }
}
