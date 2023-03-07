import Game from '~/scenes/Game'
import { Agent } from './Agent'

export interface Team {
  onAgentDeathHandlers: Function[]
  game: Game
  agents: Agent[]

  createAgents(): void
}
