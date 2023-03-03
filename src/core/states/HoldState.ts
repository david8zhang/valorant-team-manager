import { Agent } from '../Agent'
import { State } from './StateMachine'

export class HoldState extends State {
  public hasExecutedCommand: boolean = false
  public target!: { x: number; y: number }

  enter(agent: Agent, target: { x: number; y: number }) {
    this.target = target
  }

  execute(agent: Agent) {
    if (!this.hasExecutedCommand && !agent.isPaused) {
      this.hasExecutedCommand = true
      const angle = Phaser.Math.Angle.Between(
        agent.sprite.x,
        agent.sprite.y,
        this.target.x,
        this.target.y
      )
      agent.sprite.setVelocity(0, 0)
      agent.visionRay.setAngle(angle)
      agent.crosshairRay.setAngle(angle)
    }
    agent.graphics.lineStyle(2, 0xff0000)
  }

  exit(agent: Agent) {
    this.hasExecutedCommand = false
    agent.graphics.lineStyle(2, 0x00ffff)
  }
}
