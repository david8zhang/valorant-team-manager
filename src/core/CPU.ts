import Game from '~/scenes/Game'
import { Agent, Side } from './Agent'
import { Idle } from './behavior-tree/behaviors/Idle'
import { MoveTowardSite } from './behavior-tree/behaviors/MoveTowardSite'
import { PopulateBlackboard } from './behavior-tree/behaviors/PopulateBlackboard'
import { ShouldMoveTowardSite } from './behavior-tree/behaviors/ShouldMoveTowardSite'
import { BehaviorTreeNode } from './behavior-tree/BehaviorTreeNode'
import { Blackboard } from './behavior-tree/Blackboard'
import { SelectorNode } from './behavior-tree/SelectorNode'
import { SequenceNode } from './behavior-tree/SequenceNode'
import { States } from './states/States'

export class CPU {
  public game: Game
  public agents: Agent[] = []

  public static AGENT_START_X = 280
  public static AGENT_START_Y = 460

  private agentMoveTargetMapping: {
    [key: string]: {
      x: number
      y: number
    } | null
  } = {}

  private behaviorTrees: BehaviorTreeNode[] = []

  constructor() {
    this.game = Game.instance
    this.createAgents()
    this.setupDebugListener()
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
    this.agentMoveTargetMapping[agent.name] = moveTarget
  }

  clearAgentMoveTarget(agent: Agent) {
    this.agentMoveTargetMapping[agent.name] = null
  }

  getCurrAgentMoveTarget(agent: Agent) {
    return this.agentMoveTargetMapping[agent.name]
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
      })
      newAgent.sprite.setVisible(this.game.isDebug)
      const newBehaviorTree = this.setupBehaviorTreeForAgent(newAgent)
      this.behaviorTrees.push(newBehaviorTree)
      this.agents.push(newAgent)
      startX += newAgent.sprite.displayWidth + 20
    }
  }

  setupBehaviorTreeForAgent(agent: Agent) {
    const blackboard = new Blackboard()
    const rootNode = new SequenceNode('Root', blackboard, [
      new PopulateBlackboard(blackboard, agent, this),
      new SelectorNode(
        'MoveTowardSiteOrIdle',
        blackboard,
        new SequenceNode('MoveTowardSiteSeq', blackboard, [
          new ShouldMoveTowardSite(blackboard),
          new MoveTowardSite(blackboard),
        ]),
        new Idle(blackboard)
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
    this.behaviorTrees.forEach((tree) => {
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
