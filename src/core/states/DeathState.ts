import Game from '~/scenes/Game'
import { Agent, Side } from '../Agent'
import { State } from './StateMachine'
import { States } from './States'

export class DeathState extends State {
  private diedTimestamp: number = -1
  private static RESPAWN_TIME = 5000

  enter(agent: Agent) {
    agent.killStreak = 0
    this.diedTimestamp = Date.now()
    agent.sprite.setVelocity(0, 0)
    if (agent.hasSpike) {
      Game.instance.spike.drop(agent.sprite.x, agent.sprite.y, agent)
    }
    agent.hasSpike = false
    agent.team.onAgentDeathHandlers.forEach((handler) => {
      handler(agent)
    })
    agent.sprite.setScale(0)
    agent.healthBar.setVisible(false)
    agent.hideSightCones = true
  }

  execute(agent: Agent) {
    const currTimestamp = Date.now()
    if (currTimestamp - this.diedTimestamp >= DeathState.RESPAWN_TIME) {
      agent.setState(States.RESPAWN)
    }
  }

  exit(agent: Agent) {
    agent.sprite.setScale(1)
  }
}
