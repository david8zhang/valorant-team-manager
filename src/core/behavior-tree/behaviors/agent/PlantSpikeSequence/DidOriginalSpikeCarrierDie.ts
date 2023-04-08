import { Agent, Side } from '~/core/Agent'
import { BehaviorStatus } from '~/core/behavior-tree/BehaviorStatus'
import { BehaviorTreeNode } from '~/core/behavior-tree/BehaviorTreeNode'
import { Blackboard } from '~/core/behavior-tree/Blackboard'
import Game from '~/scenes/Game'

export class DidOriginalSpikeCarrierDie extends BehaviorTreeNode {
  public didOriginalSpikeCarrierDie: boolean = false

  constructor(blackboard: Blackboard) {
    super('DidOriginalSpikeCarrierDie', blackboard)
    Game.instance.onSpikeDropHandlers.push((agent: Agent) => {
      if (agent.side === Side.CPU) {
        this.didOriginalSpikeCarrierDie = true
      }
    })
    Game.instance.onResetRoundHandlers.push((agent: Agent) => {
      this.didOriginalSpikeCarrierDie = false
    })
  }

  public process(): BehaviorStatus {
    return this.didOriginalSpikeCarrierDie ? BehaviorStatus.SUCCESS : BehaviorStatus.FAILURE
  }
}
