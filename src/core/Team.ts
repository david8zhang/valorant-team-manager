import Round from '~/scenes/Round'
import { Agent } from './Agent'

export interface Team {
  onAgentDeathHandlers: Function[]
  game: Round
  agents: Agent[]

  createAgents(): void
}
