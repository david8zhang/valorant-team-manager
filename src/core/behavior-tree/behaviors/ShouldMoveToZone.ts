import Game from '~/scenes/Game'
import { RoundState } from '~/utils/Constants'
import { BehaviorStatus } from '../nodes/BehaviorStatus'
import { BehaviorTreeNode } from '../nodes/BehaviorTreeNode'
import { Blackboard } from '../nodes/Blackboard'

export class ShouldMoveToZone extends BehaviorTreeNode {
  constructor(blackboard: Blackboard) {
    super('ShouldMoveToZone', blackboard)
  }

  public process(trace?: boolean | undefined): BehaviorStatus {
    return Game.instance.roundState === RoundState.MID_ROUND
      ? BehaviorStatus.SUCCESS
      : BehaviorStatus.FAILURE
  }
}
