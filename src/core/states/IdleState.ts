import { Agent } from '../Agent'
import { State } from './StateMachine'

export class IdleState extends State {
  enter(agent: Agent) {
    agent.sprite.setVelocity(0, 0)
  }
}
