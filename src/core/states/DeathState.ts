import Game from '~/scenes/Game'
import { Agent, Side } from '../Agent'
import { State } from './StateMachine'

export class DeathState extends State {
  enter(agent: Agent) {
    agent.sprite.setVisible(false)
    agent.highlightCircle.setVisible(false)
    agent.healthBar.setVisible(false)
    agent.hideSightCones = true

    const enemyRaycaster =
      agent.side === Side.PLAYER ? Game.instance.cpuRaycaster : Game.instance.playerRaycaster
    try {
      enemyRaycaster.removeMappedObjects(agent.sprite)
    } catch (e) {
      console.info(e)
    }
  }
}
