import Game from '~/scenes/Game'
import { Agent, Side } from '../Agent'
import { State } from './StateMachine'

export class DeathState extends State {
  enter(agent: Agent) {
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

  exit(agent: Agent) {
    agent.sprite.setScale(1)
  }
}
