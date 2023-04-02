import { Agent } from '~/core/Agent'
import { States } from '~/core/states/States'
import Game from '~/scenes/Game'
import { Action, ActionStatus } from './Action'

export class RetrieveSpikeAction extends Action {
  private agent: Agent
  private isMovingTowardSpike: boolean = false
  constructor(agent: Agent) {
    super()
    this.agent = agent
  }

  exit() {
    this.isMovingTowardSpike = false
  }

  enter(): void {
    this.isMovingTowardSpike = true
    const spike = Game.instance.spike
    this.agent.setState(States.MOVE, {
      x: spike.sprite.x,
      y: spike.sprite.y,
    })
  }

  getStatus(): ActionStatus {
    if (!this.isMovingTowardSpike) {
      return ActionStatus.NOT_STARTED
    }

    if (this.agent.hasSpike) {
      return ActionStatus.COMPLETE
    }
    return ActionStatus.RUNNING
  }
}
