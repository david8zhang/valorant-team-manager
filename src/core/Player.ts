import Game from '~/scenes/Game'
import UI, { CommandState } from '~/scenes/UI'
import { Constants } from '~/utils/Constants'
import { Agent, Side } from './Agent'
import { States } from './states/States'
import { Team } from './Team'

export class Player implements Team {
  public game: Game
  public cursorRect!: Phaser.GameObjects.Rectangle
  public agents: Agent[] = []
  public selectedAgentIndex: number = 0
  public onAgentDeathHandlers: Function[] = []

  public static AGENT_START_X = 320
  public static AGENT_START_Y = 20

  constructor() {
    this.game = Game.instance
    this.setupCursor()
    this.setupInputListeners()
    this.createAgents()
    this.selectAgent(this.selectedAgentIndex)
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
      }
    })
  }

  handleClick(e: any) {
    if (UI.instance && !this.areAllAgentsDead()) {
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
        case CommandState.PLANT: {
          this.queueAgentPlantCommand(e.worldX, e.worldY)
          break
        }
        case CommandState.DEFUSE: {
          this.queueAgentDefuseCommand(e.worldX, e.worldY)
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

  selectAgent(newAgentIndex: number) {
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
    return (
      worldX >= 0 &&
      worldX <= Constants.MAP_WIDTH &&
      worldY >= 0 &&
      Constants.MAP_HEIGHT &&
      this.game.getTileAt(worldX, worldY).index !== 1
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

  queueAgentPlantCommand(worldX: number, worldY: number) {
    const agent = this.agents[this.selectedAgentIndex]
    if (this.isWithinSite(worldX, worldY)) {
      agent.setState(States.PLANT, {
        x: worldX,
        y: worldY,
      })
    }
  }

  queueAgentDefuseCommand(worldX: number, worldY: number) {
    const agent = this.agents[this.selectedAgentIndex]
    const spike = this.game.spike
    if (spike.defuseCircleDetector.contains(worldX, worldY) && !spike.isDefused) {
      agent.setState(States.DEFUSE, {
        x: worldX,
        y: worldY,
      })
    }
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
    const tileX = tile.getCenterX()
    const tileY = tile.getCenterY()
    return (
      firstSitePos.x <= tileX &&
      tileX <= adjustedLastSitePos.x &&
      firstSitePos.y <= tileY &&
      tileY <= adjustedLastSitePos.y
    )
  }

  isWithinSite(worldX: number, worldY: number) {
    return (
      this.isWithinSitePositions(Constants.A_SITE_POSITIONS, worldX, worldY) ||
      this.isWithinSitePositions(Constants.B_SITE_POSITIONS, worldX, worldY)
    )
  }

  createAgents() {
    let startX = Player.AGENT_START_X
    let startY = Player.AGENT_START_Y
    for (let i = 1; i <= 3; i++) {
      const newAgent = new Agent({
        position: {
          x: startX,
          y: startY,
        },
        name: `player-${i}`,
        texture: 'player-agent',
        sightAngleDeg: 90,
        raycaster: this.game.playerRaycaster,
        side: Side.PLAYER,
        team: this,
      })
      this.agents.push(newAgent)
      startX += newAgent.sprite.displayWidth + 20
    }
  }

  updateCursor() {
    const mousePointer = this.game.input.mousePointer
    const tilePos = this.game.getTilePosForWorldPos(mousePointer.worldX, mousePointer.worldY)
    const layer = this.game.tilemap.getLayer('Base')
    if (
      tilePos.row >= 0 &&
      tilePos.row < layer.data.length &&
      tilePos.col >= 0 &&
      tilePos.col < layer.data[0].length
    ) {
      const tileCenter = this.game.getWorldPosForTilePos(tilePos.row, tilePos.col)
      const tile = this.game.getTileAt(mousePointer.worldX, mousePointer.worldY)
      if (this.game.isDebug) {
        console.info('[Cursor]: ', tileCenter.x, tileCenter.y)
      }

      this.cursorRect.setPosition(tileCenter.x, tileCenter.y)
      if (tile.index === 1) {
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
    let startX = Player.AGENT_START_X
    let startY = Player.AGENT_START_Y
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
    const mousePointer = this.game.input.mousePointer
    const tilePos = this.game.getTilePosForWorldPos(mousePointer.worldX, mousePointer.worldY)
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
    if (this.selectedAgent.getCurrState() === States.DIE) {
      this.selectNextLivingAgent()
    }

    this.agents.forEach((agent) => {
      agent.update()
    })
  }
}
