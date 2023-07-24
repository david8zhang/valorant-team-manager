import Round from '~/scenes/Round'
import { GunTypes } from '~/utils/GunConstants'
import { Agent, Side } from '../Agent'
import { State } from './StateMachine'
import { States } from './States'

export class DeathState extends State {
  private diedTimestamp: number = -1
  private static RESPAWN_TIME = 5000

  enter(agent: Agent) {
    agent.currWeapon = GunTypes.PISTOL
    agent.healTimerEvent.paused = true
    this.diedTimestamp = Date.now()
    agent.sprite.setVelocity(0, 0)
    agent.sprite.setTexture('agent-death')
    agent.team.onAgentDeathHandlers.forEach((handler) => {
      handler(agent)
    })
    agent.healthBar.setVisible(false)
    agent.hideSightCones = true
  }

  execute(agent: Agent) {
    const currTimestamp = Date.now()
    agent.sprite.setRotation(Phaser.Math.DegToRad(0))
    if (currTimestamp - this.diedTimestamp >= DeathState.RESPAWN_TIME) {
      agent.setState(States.RESPAWN)
    }
  }
}
