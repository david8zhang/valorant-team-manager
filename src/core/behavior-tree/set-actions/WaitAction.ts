import { Agent } from '~/core/Agent'
import { States } from '~/core/states/States'
import { Action, ActionStatus } from './Action'

export class WaitAction implements Action {
  private waitTimeSec: number = 0
  private agent: Agent
  private startTimestamp: number = -1

  constructor(agent: Agent, waitTimeSec: number) {
    this.agent = agent
    this.waitTimeSec = waitTimeSec
  }

  enter(): void {
    this.startTimestamp = Date.now()
    this.agent.setState(States.IDLE)
  }

  exit() {}

  getStatus(): ActionStatus {
    const timestamp = Date.now()
    if (this.startTimestamp === -1) {
      return ActionStatus.NOT_STARTED
    }
    if (timestamp - this.startTimestamp >= this.waitTimeSec * 1000) {
      return ActionStatus.COMPLETE
    }
    return ActionStatus.RUNNING
  }

  execute() {}
}
