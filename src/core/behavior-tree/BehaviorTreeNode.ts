import { Agent } from '../Agent'
import { BlackboardKeys } from './behaviors/agent/BlackboardKeys'
import { BehaviorStatus } from './BehaviorStatus'
import { Blackboard } from './Blackboard'

export abstract class BehaviorTreeNode {
  public name: string
  public blackboard: Blackboard

  constructor(name: string, blackboard: Blackboard) {
    this.name = name
    this.blackboard = blackboard
  }
  public abstract process(trace?: boolean): BehaviorStatus
}
