import Game from '~/scenes/Game'
import { Constants } from '~/utils/Constants'
import { Agent, Side } from './Agent'
import { Idle } from './behavior-tree/behaviors/agent/Idle'
import { MoveTowardSite } from './behavior-tree/behaviors/agent/MoveTowardSite'
import { PlantSpike } from './behavior-tree/behaviors/agent/PlantSpike'
import { PopulateBlackboard } from './behavior-tree/behaviors/agent/PopulateBlackboard'
import { RetrieveSpike } from './behavior-tree/behaviors/agent/RetrieveSpike'
import { ShouldMoveTowardSite } from './behavior-tree/behaviors/agent/ShouldMoveTowardSite'
import { ShouldPlantSpike } from './behavior-tree/behaviors/agent/ShouldPlantSpike'
import { ShouldRetrieveSpike } from './behavior-tree/behaviors/agent/ShouldRetrieveSpike'
import { TeamBlackboardKeys } from './behavior-tree/behaviors/team/TeamBlackboardKeys'
import { BehaviorTreeNode } from './behavior-tree/BehaviorTreeNode'
import { Blackboard } from './behavior-tree/Blackboard'
import { SelectorNode } from './behavior-tree/SelectorNode'
import { SequenceNode } from './behavior-tree/SequenceNode'
import { Intel } from './Intel'
import { States } from './states/States'
import { Team } from './Team'
import { UtilityKey } from './utility/UtilityKey'
import { UtilityName } from './utility/UtilityNames'

export class CPU implements Team {
  public game: Game
  public agents: Agent[] = []
  public onAgentDeathHandlers: Function[] = []

  public static AGENT_START_X = 280
  public static AGENT_START_Y = 460

  private agentBehaviorTrees: {
    agent: Agent
    tree: BehaviorTreeNode
  }[] = []
  private cpuBehaviorTree!: BehaviorTreeNode
  public teamBlackboard!: Blackboard
  public intel: Intel

  constructor() {
    this.game = Game.instance
    this.createAgents()
    this.setupDebugListener()
    this.setupCPUBehaviorTree()
    this.intel = new Intel()
  }

  setupCPUBehaviorTree() {
    this.teamBlackboard = new Blackboard()
    this.teamBlackboard.setData(TeamBlackboardKeys.AGENT_MOVE_TARGETS, null)
    this.teamBlackboard.setData(TeamBlackboardKeys.SPIKE_CARRIER_NAME, '')
    this.teamBlackboard.setData(TeamBlackboardKeys.AGENTS, this.agents)
    this.cpuBehaviorTree = new SequenceNode('TeamStrategyRoot', this.teamBlackboard, [])
  }

  setupDebugListener() {
    this.game.debugHandlers.push((isDebug) => {
      this.agents.forEach((agent) => {
        if (isDebug) {
          agent.sprite.setVisible(true)
          agent.healthBar.setVisible(true)
          agent.hideSightCones = false
        } else {
          agent.sprite.setVisible(false)
          agent.healthBar.setVisible(false)
          agent.hideSightCones = true
        }
      })
    })
  }

  getAgentByName(name: string): Agent | undefined {
    return this.agents.find((agent) => {
      return agent.name === name
    })
  }

  setAgentMoveTarget(agent: Agent, moveTarget: { x: number; y: number } | null) {
    const agentMoveTargets = this.teamBlackboard.getData(TeamBlackboardKeys.AGENT_MOVE_TARGETS)
    agentMoveTargets[agent.name] = moveTarget
    this.teamBlackboard.setData(TeamBlackboardKeys.AGENT_MOVE_TARGETS, agentMoveTargets)
  }

  clearAgentMoveTarget(agent: Agent) {
    const agentMoveTargets = this.teamBlackboard.getData(TeamBlackboardKeys.AGENT_MOVE_TARGETS)
    agentMoveTargets[agent.name] = null
    this.teamBlackboard.setData(TeamBlackboardKeys.AGENT_MOVE_TARGETS, agentMoveTargets)
  }

  getCurrAgentMoveTarget(agent: Agent) {
    const agentMoveTargets = this.teamBlackboard.getData(TeamBlackboardKeys.AGENT_MOVE_TARGETS)
    return agentMoveTargets[agent.name]
  }

  createAgents() {
    let startX = 280
    let startY = 470
    for (let i = 0; i < 3; i++) {
      const config = Constants.CPU_AGENT_CONFIGS[i]
      const newAgent = new Agent({
        position: {
          x: startX,
          y: startY,
        },
        name: config.name,
        texture: config.texture,
        sightAngleDeg: 270,
        hideSightCones: !this.game.isDebug,
        raycaster: this.game.cpuRaycaster,
        side: Side.CPU,
        team: this,
        stats: config.stats,
        utility: {
          [UtilityKey.Q]: UtilityName.SMOKE,
        },
        // fireOnSight: true,
      })
      newAgent.sprite.setVisible(this.game.isDebug)
      newAgent.onDetectedEnemyHandlers.push((detectedEnemies: Agent[]) => {
        this.updateTeamIntel(detectedEnemies)
      })
      newAgent.onKillEnemyHandlers.push((killedEnemy: Agent) => {
        console.log('Went here!')
        this.updateTeamIntel([killedEnemy])
      })
      const newBehaviorTree = this.setupBehaviorTreeForAgent(newAgent)
      this.agentBehaviorTrees.push({
        agent: newAgent,
        tree: newBehaviorTree,
      })
      this.agents.push(newAgent)
      startX += newAgent.sprite.displayWidth + 20
    }
  }

  updateTeamIntel(detectedEnemies: Agent[]) {
    this.intel.updateIntel(detectedEnemies)
  }

  setupBehaviorTreeForAgent(agent: Agent) {
    const blackboard = new Blackboard()
    const rootNode = new SequenceNode('Root', blackboard, [
      new PopulateBlackboard(blackboard, agent, this),
    ])
    return rootNode
  }

  resetAgents() {
    let startX = CPU.AGENT_START_X
    let startY = CPU.AGENT_START_Y
    this.agents.forEach((agent) => {
      agent.reset({
        x: startX,
        y: startY,
        sightAngle: 270,
        showOnMap: this.game.isDebug,
      })
      startX += agent.sprite.displayWidth + 20
    })
  }

  update() {
    this.cpuBehaviorTree.process()
    this.agentBehaviorTrees.forEach((obj) => {
      const { tree, agent } = obj
      if (agent.getCurrState() !== States.DIE) {
        tree.process()
      }
    })
    this.agents.forEach((agent) => {
      if (!this.game.isDebug) {
        agent.sprite.setVisible(false)
        agent.healthBar.setVisible(false)
      }
      agent.update()
    })
  }
}
