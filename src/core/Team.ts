import Round from '~/scenes/Round'
import { Agent, AgentConfig } from './Agent'
import { PlayerAgentConfig } from '~/scenes/TeamMgmt'

export interface Team {
  onAgentDeathHandlers: Function[]
  game: Round
  agents: Agent[]

  createAgents(agentConfigs?: PlayerAgentConfig[]): void
}
