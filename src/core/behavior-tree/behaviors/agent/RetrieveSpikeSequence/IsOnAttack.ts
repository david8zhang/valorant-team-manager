import { Side } from '~/core/Agent'
import Game from '~/scenes/Game'
import { BehaviorStatus } from '../../../BehaviorStatus'
import { BehaviorTreeNode } from '../../../BehaviorTreeNode'
import { Blackboard } from '../../../Blackboard'

export class IsOnAttack extends BehaviorTreeNode {
  constructor(blackboard: Blackboard) {
    super('IsOnAttack', blackboard)
  }

  public process(): BehaviorStatus {
    return Game.instance.attackSide === Side.CPU ? BehaviorStatus.SUCCESS : BehaviorStatus.FAILURE
  }
}
