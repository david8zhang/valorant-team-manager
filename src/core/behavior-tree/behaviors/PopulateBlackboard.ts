import { Agent } from '~/core/Agent'
import Round from '~/scenes/Round'
import { BehaviorStatus } from '../nodes/BehaviorStatus'
import { BehaviorTreeNode } from '../nodes/BehaviorTreeNode'
import { Blackboard } from '../nodes/Blackboard'
import { BlackboardKeys } from './BlackboardKeys'

export class PopulateBlackboard extends BehaviorTreeNode {
  public agent: Agent

  constructor(blackboard: Blackboard, agent: Agent) {
    super('PopulateBlackboard', blackboard)
    this.agent = agent
  }

  public process(): BehaviorStatus {
    const playerAgents = Round.instance.player.agents
    const cpuAgents = Round.instance.cpu.agents
    this.blackboard.setData(BlackboardKeys.PLAYER_AGENTS, playerAgents)
    this.blackboard.setData(BlackboardKeys.CPU_AGENTS, cpuAgents)
    this.blackboard.setData(BlackboardKeys.CURR_AGENT, this.agent)
    this.blackboard.setData(BlackboardKeys.SPIKE, Round.instance.spike)
    return BehaviorStatus.SUCCESS
  }
}
