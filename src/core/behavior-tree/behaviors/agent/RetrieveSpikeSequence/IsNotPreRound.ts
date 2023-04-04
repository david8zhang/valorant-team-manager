import { BehaviorStatus } from '~/core/behavior-tree/BehaviorStatus'
import { BehaviorTreeNode } from '~/core/behavior-tree/BehaviorTreeNode'
import { Blackboard } from '~/core/behavior-tree/Blackboard'
import Game from '~/scenes/Game'
import { RoundState } from '~/utils/Constants'

export class IsNotPreRound extends BehaviorTreeNode {
  constructor(blackboard: Blackboard) {
    super('IsNotPreRound', blackboard)
  }

  public process(): BehaviorStatus {
    return Game.instance.roundState !== RoundState.PREROUND
      ? BehaviorStatus.SUCCESS
      : BehaviorStatus.FAILURE
  }
}
