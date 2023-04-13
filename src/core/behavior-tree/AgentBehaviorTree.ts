import { Agent } from '../Agent'
import { Idle } from './behaviors/Idle'
import { MoveToZone } from './behaviors/MoveToZone'
import { PopulateBlackboard } from './behaviors/PopulateBlackboard'
import { ShouldMoveToZone } from './behaviors/ShouldMoveToZone'
import { AndSequenceNode } from './nodes/AndSequenceNode'
import { Blackboard } from './nodes/Blackboard'
import { SelectorNode } from './nodes/SelectorNode'

export const createAgentBehaviorTree = (agent: Agent) => {
  const blackboard = new Blackboard()
  const rootNode = new AndSequenceNode('Root', blackboard, [
    new PopulateBlackboard(blackboard, agent),
    new SelectorNode(
      'ActionSelector',
      blackboard,
      new AndSequenceNode('MoveToZoneSeq', blackboard, [
        new ShouldMoveToZone(blackboard),
        new MoveToZone(blackboard),
      ]),
      new Idle(blackboard)
    ),
  ])
  return rootNode
}
