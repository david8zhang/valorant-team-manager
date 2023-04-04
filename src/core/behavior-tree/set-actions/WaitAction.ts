import { Agent } from '~/core/Agent'
import { States } from '~/core/states/States'
import Game from '~/scenes/Game'
import { Action, ActionStatus } from './Action'

export class WaitAction extends Action {
  private waitTimeSec: number = 0
  private agent: Agent

  private hasStartedCountdownTimer: boolean = false
  private hasFinishedWaiting: boolean = false
  private countdownTimer!: Phaser.Time.TimerEvent

  constructor(agent: Agent, waitTimeSec: number) {
    super()
    this.agent = agent
    this.waitTimeSec = waitTimeSec
  }

  enter(): void {
    this.agent.setState(States.IDLE)
    this.hasStartedCountdownTimer = true
    this.countdownTimer = Game.instance.time.delayedCall(this.waitTimeSec * 1000, () => {
      this.hasFinishedWaiting = true
    })
  }

  exit() {
    this.hasStartedCountdownTimer = false
    this.hasFinishedWaiting = false
  }

  execute() {
    if (this.countdownTimer) {
      this.countdownTimer.paused = Game.instance.isPaused
    }
    this.agent.setState(States.IDLE)
  }

  getStatus(): ActionStatus {
    if (!this.hasStartedCountdownTimer) {
      return ActionStatus.NOT_STARTED
    }
    if (this.hasFinishedWaiting) {
      return ActionStatus.COMPLETE
    }
    return ActionStatus.RUNNING
  }
}
