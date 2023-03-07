import Game from '~/scenes/Game'
import { Agent, Side } from './Agent'
import { Idle } from './behavior-tree/behaviors/agent/Idle'
import { MoveTowardSite } from './behavior-tree/behaviors/agent/MoveTowardSite'
import { PopulateBlackboard } from './behavior-tree/behaviors/agent/PopulateBlackboard'
import { RetrieveSpike } from './behavior-tree/behaviors/agent/RetrieveSpike'
import { ShouldMoveTowardSite } from './behavior-tree/behaviors/agent/ShouldMoveTowardSite'
import { ShouldRetrieveSpike } from './behavior-tree/behaviors/agent/ShouldRetrieveSpike'
import { SelectNewSpikeCarrier } from './behavior-tree/behaviors/team/SelectNewSpikeCarrier'
import { ShouldSelectNewSpikeCarrier } from './behavior-tree/behaviors/team/ShouldSelectNewSpikeCarrier'
import { TeamBlackboardKeys } from './behavior-tree/behaviors/team/TeamBlackboardKeys'
import { BehaviorTreeNode } from './behavior-tree/BehaviorTreeNode'
import { Blackboard } from './behavior-tree/Blackboard'
import { SelectorNode } from './behavior-tree/SelectorNode'
import { SequenceNode } from './behavior-tree/SequenceNode'
import { States } from './states/States'
import { Team } from './Team'

export class CPU implements Team {
  public game: Game
  public agents: Agent[] = []
  public onAgentDeathHandlers: Function[] = []

  public static AGENT_START_X = 280
  public static AGENT_START_Y = 460

  private agentBehaviorTrees: BehaviorTreeNode[] = []
  private cpuBehaviorTree!: BehaviorTreeNode
  public globalBlackboard!: Blackboard

  constructor() {
    this.game = Game.instance
    this.createAgents()
    this.setupDebugListener()
    this.setupCPUBehaviorTree()
  }

  setupCPUBehaviorTree() {
    this.globalBlackboard = new Blackboard()
    this.globalBlackboard.setData(TeamBlackboardKeys.AGENT_MOVE_TARGETS, {})
    this.globalBlackboard.setData(TeamBlackboardKeys.SPIKE_CARRIER_NAME, '')
    this.globalBlackboard.setData(TeamBlackboardKeys.AGENTS, this.agents)
    this.cpuBehaviorTree = new SequenceNode('SelectNewSpikeCarrierSeq', this.globalBlackboard, [
      new ShouldSelectNewSpikeCarrier(this.globalBlackboard),
      new SelectNewSpikeCarrier(this.globalBlackboard),
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

  setAgentMoveTarget(agent: Agent, moveTarget: { x: number; y: number } | null) {
    const agentMoveTargets = this.globalBlackboard.getData(TeamBlackboardKeys.AGENT_MOVE_TARGETS)
    agentMoveTargets[agent.name] = moveTarget
    this.globalBlackboard.setData(TeamBlackboardKeys.AGENT_MOVE_TARGETS, agentMoveTargets)
  }

  clearAgentMoveTarget(agent: Agent) {
    const agentMoveTargets = this.globalBlackboard.getData(TeamBlackboardKeys.AGENT_MOVE_TARGETS)
    agentMoveTargets[agent.name] = null
    this.globalBlackboard.setData(TeamBlackboardKeys.AGENT_MOVE_TARGETS, agentMoveTargets)
  }

  getCurrAgentMoveTarget(agent: Agent) {
    const agentMoveTargets = this.globalBlackboard.getData(TeamBlackboardKeys.AGENT_MOVE_TARGETS)
    return agentMoveTargets[agent.name]
  }

  createAgents() {
    let startX = 280
    let startY = 460
    for (let i = 1; i <= 3; i++) {
      const newAgent = new Agent({
        position: {
          x: startX,
          y: startY,
        },
        name: `cpu-${i}`,
        texture: 'cpu-agent',
        sightAngleDeg: 270,
        hideSightCones: !this.game.isDebug,
        raycaster: this.game.cpuRaycaster,
        side: Side.CPU,
        team: this,
      })
      newAgent.sprite.setVisible(this.game.isDebug)
      const newBehaviorTree = this.setupBehaviorTreeForAgent(newAgent)
      this.agentBehaviorTrees.push(newBehaviorTree)
      this.agents.push(newAgent)
      startX += newAgent.sprite.displayWidth + 20
    }
  }

  setupBehaviorTreeForAgent(agent: Agent) {
    const blackboard = new Blackboard()
    const rootNode = new SequenceNode('Root', blackboard, [
      new PopulateBlackboard(blackboard, agent, this),
      new SelectorNode(
        'RetrieveSpikeSelector',
        blackboard,
        new SequenceNode('RetrieveSpikeSequence', blackboard, [
          new ShouldRetrieveSpike(blackboard),
          new RetrieveSpike(blackboard),
        ]),
        new SelectorNode(
          'MoveTowardSiteOrIdle',
          blackboard,
          new SequenceNode('MoveTowardSiteSeq', blackboard, [
            new ShouldMoveTowardSite(blackboard),
            new MoveTowardSite(blackboard),
          ]),
          new Idle(blackboard)
        )
      ),
    ])
    return rootNode
  }

  resetAgents() {
    let startX = CPU.AGENT_START_X
    let startY = CPU.AGENT_START_Y
    this.agents.forEach((agent) => {
      agent.setState(States.IDLE)
      agent.sprite.setPosition(startX, startY)
      agent.setHealth(Agent.FULL_HEALTH)
      agent.visionRay.setAngle(Phaser.Math.DegToRad(270))
      agent.crosshairRay.setAngle(Phaser.Math.DegToRad(270))
      if (this.game.isDebug) {
        agent.sprite.setVisible(true)
        agent.healthBar.setVisible(true)
        agent.hideSightCones = false
      }

      startX += agent.sprite.displayWidth + 20
      if (agent.getCurrState() === States.DIE) {
        const enemyRayCaster = this.game.cpuRaycaster
        enemyRayCaster.mapGameObjects(agent.sprite)
      }
    })
  }

  update() {
    this.cpuBehaviorTree.process()
    this.agentBehaviorTrees.forEach((tree) => {
      tree.process()
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
