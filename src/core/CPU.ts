import Game from '~/scenes/Game'
import { Constants } from '~/utils/Constants'
import { MapConstants } from '~/utils/MapConstants'
import { Agent, Side } from './Agent'
import { AndSequenceNode } from './behavior-tree/AndSequenceNode'
import { ExecuteActions } from './behavior-tree/behaviors/agent/ExecuteActions'
import { PopulateBlackboard } from './behavior-tree/behaviors/agent/PopulateBlackboard'
import { IsClosestToSpike } from './behavior-tree/behaviors/agent/RetrieveSpikeSequence/IsClosestToSpike'
import { IsNotPreRound } from './behavior-tree/behaviors/agent/RetrieveSpikeSequence/IsNotPreRound'
import { IsOnAttack } from './behavior-tree/behaviors/agent/RetrieveSpikeSequence/IsOnAttack'
import { IsSpikeDown } from './behavior-tree/behaviors/agent/RetrieveSpikeSequence/IsSpikeDown'
import { IsSpikeUnguarded } from './behavior-tree/behaviors/agent/RetrieveSpikeSequence/IsSpikeUnguarded'
import { RetrieveSpike } from './behavior-tree/behaviors/agent/RetrieveSpikeSequence/RetrieveSpike'
import { AssignActions } from './behavior-tree/behaviors/team/AssignActions'
import { TeamBlackboardKeys } from './behavior-tree/behaviors/team/TeamBlackboardKeys'
import { BehaviorTreeNode } from './behavior-tree/BehaviorTreeNode'
import { Blackboard } from './behavior-tree/Blackboard'
import { SelectorNode } from './behavior-tree/SelectorNode'
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
    this.teamBlackboard.setData(TeamBlackboardKeys.SPIKE_CARRIER_NAME, '')
    this.teamBlackboard.setData(TeamBlackboardKeys.AGENTS, this.agents)
    this.cpuBehaviorTree = new AndSequenceNode('TeamStrategyRoot', this.teamBlackboard, [
      new AssignActions(this.teamBlackboard),
    ])
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

  createAgents() {
    let { startX, startY } = this.getStartPosition()
    for (let i = 0; i < 3; i++) {
      const config = Constants.CPU_AGENT_CONFIGS[i]
      const newAgent = new Agent({
        position: {
          x: startX,
          y: startY,
        },
        role: config.role,
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
    const rootNode = new AndSequenceNode('Root', blackboard, [
      new PopulateBlackboard(blackboard, agent, this),
      new SelectorNode(
        'ActionSelector',
        blackboard,
        new AndSequenceNode('RetrieveSpikeSequence', blackboard, [
          new IsNotPreRound(blackboard),
          new IsClosestToSpike(blackboard),
          new IsOnAttack(blackboard),
          new IsSpikeDown(blackboard),
          new IsSpikeUnguarded(blackboard),
          new RetrieveSpike(blackboard),
        ]),
        new ExecuteActions(blackboard)
      ),
    ])
    return rootNode
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
