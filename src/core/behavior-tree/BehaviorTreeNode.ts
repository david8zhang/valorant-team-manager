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

  public preprocess() {
    // console.log('Processing node: ' + this.name)
  }

  public tick(): BehaviorStatus {
    this.preprocess()
    const status = this.process()
    return this.emitStatus(status)
  }

  public abstract process(): BehaviorStatus

  public emitStatus(status: BehaviorStatus): BehaviorStatus {
    // console.log('Returned status: ' + status)
    return status
  }
}
