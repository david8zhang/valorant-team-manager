import { Agent } from '~/core/Agent'
import { CPU } from '~/core/CPU'
import Game from '~/scenes/Game'
import { BehaviorStatus } from '../../BehaviorStatus'
import { BehaviorTreeNode } from '../../BehaviorTreeNode'
import { Blackboard } from '../../Blackboard'
import { BlackboardKeys } from './BlackboardKeys'

export class PopulateBlackboard extends BehaviorTreeNode {
  public agent: Agent
  public cpu: CPU

  constructor(blackboard: Blackboard, agent: Agent, cpu: CPU) {
    super('PopulateBlackboard', blackboard)
    this.agent = agent
    this.cpu = cpu
  }

  public process(): BehaviorStatus {
    const playerAgents = Game.instance.player.agents
    const cpuAgents = Game.instance.cpu.agents
    this.blackboard.setData(BlackboardKeys.PLAYER_AGENTS, playerAgents)
    this.blackboard.setData(BlackboardKeys.CPU_AGENTS, cpuAgents)
    this.blackboard.setData(BlackboardKeys.CURR_AGENT, this.agent)
    this.blackboard.setData(BlackboardKeys.CPU, this.cpu)
    this.blackboard.setData(BlackboardKeys.SPIKE, Game.instance.spike)
    return BehaviorStatus.SUCCESS
  }
}
