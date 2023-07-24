import Round from '~/scenes/Round'
import { RoundConstants } from '~/utils/RoundConstants'
import { MapConstants } from '~/utils/MapConstants'
import { Agent, Side } from './Agent'
import { AndSequenceNode } from './behavior-tree/nodes/AndSequenceNode'
import { PopulateBlackboard } from './behavior-tree/behaviors/PopulateBlackboard'
import { BehaviorTreeNode } from './behavior-tree/nodes/BehaviorTreeNode'
import { Blackboard } from './behavior-tree/nodes/Blackboard'
import { Intel } from './Intel'
import { States } from './states/States'
import { Team } from './Team'
import { UtilityKey } from './utility/UtilityKey'
import { UtilityName } from './utility/UtilityNames'
import { MoveToZone } from './behavior-tree/behaviors/MoveToZone'
import { createAgentBehaviorTree } from './behavior-tree/AgentBehaviorTree'
import { PlayerAgentConfig } from '~/scenes/TeamMgmt/TeamMgmt'

export interface CPUConfig {
  teamRoster: PlayerAgentConfig[]
}

export class CPU implements Team {
  public game: Round
  public agents: Agent[] = []
  public onAgentDeathHandlers: Function[] = []

  public static AGENT_START_X = 280
  public static AGENT_START_Y = 460

  public agentBehaviorTrees: {
    agent: Agent
    tree: BehaviorTreeNode
  }[] = []
  public teamBlackboard!: Blackboard
  public intel: Intel

  constructor(game: Round, config: CPUConfig) {
    this.game = game
    this.createAgents(config.teamRoster)
    this.setupDebugListener()
    this.intel = new Intel()
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

  createAgents(cpuAgentConfigs: PlayerAgentConfig[]) {
    let { startX, startY } = this.getStartPosition()
    for (let i = 0; i < 3; i++) {
      const config = cpuAgentConfigs[i]
      const newAgent = new Agent({
        position: {
          x: startX,
          y: startY,
        },
        name: config.name,
        scale: 0.3,
        tint: 0xff0000,
        texture: 'agent-pistol',
        sightAngleDeg: 270,
        hideSightCones: !this.game.isDebug,
        raycaster: this.game.cpuRaycaster,
        side: Side.CPU,
        team: this,
        attributes: config.attributes,
        utility: {
          [UtilityKey.Q]: UtilityName.SMOKE,
        },
        fireOnSight: true,
      })
      newAgent.sprite.setVisible(this.game.isDebug)
      newAgent.onDetectedEnemyHandlers.push((detectedEnemies: Agent[]) => {
        this.updateTeamIntel(detectedEnemies)
      })
      newAgent.onKillEnemyHandlers.push((killedEnemy: Agent) => {
        this.updateTeamIntel([killedEnemy])
      })
      newAgent.onWasKilledByEnemyHandlers.push((killer: Agent) => {
        this.updateTeamIntel([killer])
      })
      const newBehaviorTree = createAgentBehaviorTree(newAgent)
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

  getStartPosition() {
    const isAttacking = this.game.attackSide === Side.CPU
    let startX = isAttacking
      ? MapConstants.ATTACKER_POSITION_START.x
      : MapConstants.DEFENDER_POSITION_START.x
    let startY = isAttacking
      ? MapConstants.ATTACKER_POSITION_START.y
      : MapConstants.DEFENDER_POSITION_START.y
    return { startX, startY }
  }

  resetAgents() {
    let { startX, startY } = this.getStartPosition()
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
