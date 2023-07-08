import Round from '~/scenes/Round'
import UI, { CommandState } from '~/scenes/UI'
import { MapConstants } from '~/utils/MapConstants'
import { Agent, Side } from './Agent'
import { BehaviorTreeNode } from './behavior-tree/nodes/BehaviorTreeNode'
import { States } from './states/States'
import { Team } from './Team'
import { UtilityKey } from './utility/UtilityKey'
import { UtilityName } from './utility/UtilityNames'
import { createAgentBehaviorTree } from './behavior-tree/AgentBehaviorTree'
import { PlayerAgentConfig } from '~/scenes/TeamMgmt/TeamMgmt'
import { RoundConstants } from '~/utils/RoundConstants'
import { Utilities } from '~/utils/Utilities'

export interface PlayerConfig {
  teamRoster: PlayerAgentConfig[]
}

export class Player implements Team {
  public game: Round
  public cursorRect!: Phaser.GameObjects.Rectangle
  public agents: Agent[] = []
  public selectedAgentIndex: number = 0
  public onAgentDeathHandlers: Function[] = []
  public currUtilityKey: UtilityKey | null = null

  public agentBehaviorTrees: {
    agent: Agent
    tree: BehaviorTreeNode
  }[] = []

  constructor(game: Round, config: PlayerConfig) {
    this.game = game
    this.createAgents(config.teamRoster)
  }

  setupInputListeners() {
    this.game.input.on(Phaser.Input.Events.POINTER_DOWN, (e) => {
      this.handleClick(e)
    })
    this.game.input.on(Phaser.Input.Events.POINTER_MOVE, (e) => {
      this.updateCursor()
    })
    this.game.input.keyboard.on(Phaser.Input.Keyboard.Events.ANY_KEY_DOWN, (e) => {
      if (e.code.includes('Digit')) {
        this.handleDigit(e.key)
      }
      switch (e.key) {
        case 'd': {
          this.queueAgentStopHold()
          break
        }
        case 'Escape': {
          this.handleEscapeKey()
          break
        }
      }
    })
  }

  handleEscapeKey() {
    if (this.selectedAgent) {
      this.deselectUtility()
    }
  }

  handleUtilityPress(code: string) {
    const codeKey = code as UtilityKey
    this.currUtilityKey = codeKey
    this.selectedAgent.triggerUtility(codeKey)
  }

  canProcessClickCommand() {
    if (this.currUtilityKey) {
      const currUtility = this.selectedAgent.utilityMapping[this.currUtilityKey]
      if (currUtility) {
        return !currUtility.preventOtherCommands
      }
    }
    return true
  }

  handleClick(e: any) {
    if (this.game.isDebug) {
      const tile = this.game.getTileAt(e.worldX, e.worldY)
      if (tile) {
        console.info('[Cursor Row/Col]: ', tile.y, tile.x)
        console.info('[Cursor]: ', tile.getCenterX(), tile.getCenterY())
        console.info('------------------------')
      }
    }
    if (UI.instance && !this.areAllAgentsDead() && this.canProcessClickCommand()) {
      const uiInstance = UI.instance
      switch (uiInstance.currCommandState) {
        case CommandState.HOLD: {
          this.queueAgentHoldCommand(e.worldX, e.worldY)
          break
        }
        case CommandState.MOVE: {
          this.queueAgentMoveCommand(e.worldX, e.worldY)
          break
        }
      }
    }
  }

  areAllAgentsDead() {
    for (let i = 0; i < this.agents.length; i++) {
      if (this.agents[i].getCurrState() !== States.DIE) {
        return false
      }
    }
    return true
  }

  handleDigit(digit: string) {
    const indexToSelect = parseInt(digit) - 1
    if (indexToSelect >= 0 && indexToSelect < this.agents.length) {
      this.selectAgent(indexToSelect)
    }
  }

  pause() {
    this.agents.forEach((agent) => {
      agent.pause()
    })
  }

  unpause() {
    this.agents.forEach((agent) => {
      agent.unpause()
    })
  }

  deselectUtility() {
    if (this.currUtilityKey) {
      const utility = this.selectedAgent.utilityMapping[this.currUtilityKey]
      if (utility) {
        utility.deselect()
      }
      this.currUtilityKey = null
    }
  }

  selectAgent(newAgentIndex: number) {
    this.deselectUtility()
    const selectedAgent = this.agents[newAgentIndex]
    if (selectedAgent.getCurrState() !== States.DIE) {
      UI.instance.selectNewCommand(CommandState.MOVE)
      if (this.selectedAgentIndex !== newAgentIndex) {
        const oldAgent = this.agents[this.selectedAgentIndex]
        oldAgent.dehighlight()
      }
      selectedAgent.highlight()
      this.selectedAgentIndex = newAgentIndex
    }
  }

  queueAgentMoveCommand(worldX: number, worldY: number) {
    const agent = this.agents[this.selectedAgentIndex]
    if (this.isValidMoveDestination(worldX, worldY)) {
      agent.setState(States.MOVE, {
        x: worldX,
        y: worldY,
      })
    }
  }

  isValidMoveDestination(worldX: number, worldY: number) {
    const tile = this.game.getTileAt(worldX, worldY)
    return (
      worldX >= 0 &&
      worldX <= RoundConstants.MAP_WIDTH &&
      worldY >= 0 &&
      RoundConstants.MAP_HEIGHT &&
      tile &&
      tile.index !== 1
    )
  }

  queueAgentHoldCommand(worldX: number, worldY: number) {
    const agent = this.agents[this.selectedAgentIndex]
    agent.setHoldLocation(worldX, worldY)
  }

  queueAgentStopHold() {
    const agent = this.agents[this.selectedAgentIndex]
    agent.holdLocation = null
  }

  private isWithinSitePositions(
    positions: { x: number; y: number }[],
    worldX: number,
    worldY: number
  ) {
    const tile = this.game.getTileAt(worldX, worldY)
    const firstSitePos = positions[0]
    const lastSitePos = positions[positions.length - 1]
    const adjustedLastSitePos = {
      x: lastSitePos.x + 8,
      y: lastSitePos.y + 8,
    }

    if (tile) {
      const tileX = tile.getCenterX()
      const tileY = tile.getCenterY()
      return (
        firstSitePos.x <= tileX &&
        tileX <= adjustedLastSitePos.x &&
        firstSitePos.y <= tileY &&
        tileY <= adjustedLastSitePos.y
      )
    }
    return false
  }

  isWithinSite(worldX: number, worldY: number) {
    return (
      this.isWithinSitePositions(MapConstants.A_SITE_POSITIONS, worldX, worldY) ||
      this.isWithinSitePositions(MapConstants.B_SITE_POSITIONS, worldX, worldY)
    )
  }

  getStartPosition() {
    const isAttacking = this.game.attackSide === Side.PLAYER
    let startX = isAttacking
      ? MapConstants.ATTACKER_POSITION_START.x
      : MapConstants.DEFENDER_POSITION_START.x
    let startY = isAttacking
      ? MapConstants.ATTACKER_POSITION_START.y
      : MapConstants.DEFENDER_POSITION_START.y
    return { startX, startY }
  }

  createAgents(teamRoster: PlayerAgentConfig[]) {
    let { startX, startY } = this.getStartPosition()
    for (let i = 0; i < 3; i++) {
      const config = teamRoster[i] as PlayerAgentConfig
      const newAgent = new Agent({
        position: {
          x: startX,
          y: startY,
        },
        name: config.name,
        texture: 'player-agent',
        sightAngleDeg: 90,
        raycaster: this.game.playerRaycaster,
        side: Side.PLAYER,
        team: this,
        attributes: config.attributes,
        utility: {
          [UtilityKey.Q]: UtilityName.SMOKE,
        },
      })
      this.agents.push(newAgent)
      startX += newAgent.sprite.displayWidth + 20

      const newBehaviorTree = createAgentBehaviorTree(newAgent)
      this.agentBehaviorTrees.push({
        agent: newAgent,
        tree: newBehaviorTree,
      })
    }
  }

  updateCursor() {
    const mousePointer = this.game.input.mousePointer
    const tilePos = this.game.getTilePosForWorldPos(mousePointer.worldX, mousePointer.worldY)
    const layer = this.game.map.tilemap.getLayer('Base')
    if (
      tilePos.row >= 0 &&
      tilePos.row < layer.data.length &&
      tilePos.col >= 0 &&
      tilePos.col < layer.data[0].length
    ) {
      const tileCenter = this.game.getWorldPosForTilePos(tilePos.row, tilePos.col)
      const tile = this.game.getTileAt(mousePointer.worldX, mousePointer.worldY)
      this.cursorRect.setPosition(tileCenter.x, tileCenter.y)
      if (tile && tile.index === 1) {
        this.cursorRect.setStrokeStyle(2, 0xff0000)
      } else {
        if (
          UI.instance.currCommandState === CommandState.PLANT &&
          !this.isWithinSite(mousePointer.worldX, mousePointer.worldY)
        ) {
          this.cursorRect.setStrokeStyle(2, 0xff0000)
        } else {
          this.cursorRect.setStrokeStyle(2, 0x00ff00)
        }
      }
    }
  }

  resetAgents() {
    let { startX, startY } = this.getStartPosition()
    this.agents.forEach((agent) => {
      agent.reset({
        x: startX,
        y: startY,
        sightAngle: 90,
        showOnMap: true,
      })
      startX += agent.sprite.displayWidth + 20
    })
  }

  setupCursor() {
    const tilePos = this.game.getTilePosForWorldPos(0, 0)
    const tileCenter = this.game.getWorldPosForTilePos(tilePos.row, tilePos.col)
    this.cursorRect = this.game.add.rectangle(tileCenter.x, tileCenter.y, 16, 16)
    this.cursorRect.setStrokeStyle(2, 0x00ff00).setDepth(100)
  }

  get selectedAgent() {
    return this.agents[this.selectedAgentIndex]
  }

  selectNextLivingAgent() {
    for (let i = 0; i < this.agents.length; i++) {
      if (this.agents[i].getCurrState() !== States.DIE) {
        this.selectAgent(i)
      }
    }
  }

  update() {
    this.agentBehaviorTrees.forEach((obj) => {
      const { tree, agent } = obj
      if (agent.getCurrState() !== States.DIE) {
        tree.process()
      }
    })
    this.agents.forEach((agent) => {
      agent.update()
    })
  }
}
