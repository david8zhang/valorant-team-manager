import { Agent } from '~/core/Agent'
import { States } from '~/core/states/States'
import Game from '~/scenes/Game'
import { Action, ActionStatus } from './Action'

export class PlantAction extends Action {
  private agent: Agent
  public isPlanting: boolean = false
  public plantLocation: { x: number; y: number }

  constructor(agent: Agent, plantLocation: { x: number; y: number }) {
    super()
    this.agent = agent
    this.plantLocation = plantLocation
  }

  getStatus(): ActionStatus {
    if (!this.isPlanting) {
      return ActionStatus.NOT_STARTED
    }
    return Game.instance.spike.isPlanted ? ActionStatus.COMPLETE : ActionStatus.RUNNING
  }

  enter(): void {
    this.isPlanting = true
    this.agent.setState(States.PLANT, this.plantLocation)
  }

  execute(): void {
    const currState = this.agent.getCurrState()
    if (currState !== States.SHOOT && currState !== States.PLANT) {
      this.agent.setState(States.PLANT, this.plantLocation)
    }
  }

  exit() {
    this.isPlanting = false
  }
}
