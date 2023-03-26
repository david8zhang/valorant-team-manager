import { Agent } from '~/core/Agent'
import { MapConstants } from '~/utils/MapConstants'
import { BehaviorStatus } from '../../BehaviorStatus'
import { BehaviorTreeNode } from '../../BehaviorTreeNode'
import { Blackboard } from '../../Blackboard'
import { TeamBlackboardKeys } from './TeamBlackboardKeys'

export class AssignMoveTargets extends BehaviorTreeNode {
  constructor(blackboard: Blackboard) {
    super('AssignMoveTargets', blackboard)
  }

  public process(): BehaviorStatus {
    const moveTargets = this.blackboard.getData(TeamBlackboardKeys.AGENT_MOVE_TARGETS)
    if (!moveTargets) {
      const newMoveTargets = {}
      const shouldAttackASite = Phaser.Math.Between(0, 1) == 0
      let positions = shouldAttackASite
        ? [...MapConstants.A_SITE_POSITIONS]
        : [...MapConstants.B_SITE_POSITIONS]
      this.shuffle(positions)
      const agents = this.blackboard.getData(TeamBlackboardKeys.AGENTS) as Agent[]
      agents.forEach((agent, index) => {
        newMoveTargets[agent.name] = positions[index]
      })
      this.blackboard.setData(TeamBlackboardKeys.AGENT_MOVE_TARGETS, newMoveTargets)
    }
    return BehaviorStatus.SUCCESS
  }

  private shuffle(array: any[]) {
    let currentIndex = array.length,
      randomIndex

    // While there remain elements to shuffle.
    while (currentIndex != 0) {
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex)
      currentIndex--

      // And swap it with the current element.
      ;[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]]
    }

    return array
  }
}
