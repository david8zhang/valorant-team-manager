import Game from '~/scenes/Game'
import UI, { CommandState } from '~/scenes/UI'
import { Agent, Side } from './Agent'
import { States } from './states/States'

export class Player {
  public game: Game
  public cursorRect!: Phaser.GameObjects.Rectangle
  public agents: Agent[] = []
  public selectedAgentIndex: number = 0

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
    agent.setState(States.MOVE, {
      x: worldX,
      y: worldY,
    })
  }

  queueAgentHoldCommand(worldX: number, worldY: number) {
    const agent = this.agents[this.selectedAgentIndex]
    agent.setState(States.HOLD, {
      x: worldX,
      y: worldY,
    })
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
        this.cursorRect.setStrokeStyle(2, 0x00ff00)
      }
    }
  }

  resetAgents() {
    let startX = Player.AGENT_START_X
    let startY = Player.AGENT_START_Y
    this.agents.forEach((agent) => {
      agent.setState(States.IDLE)
      agent.sprite.setPosition(startX, startY)
      agent.setHealth(Agent.FULL_HEALTH)
      agent.sprite.setVisible(true)
      agent.healthBar.setVisible(true)

      agent.visionRay.setAngle(Phaser.Math.DegToRad(90))
      agent.crosshairRay.setAngle(Phaser.Math.DegToRad(90))

      agent.hideSightCones = false

      startX += agent.sprite.displayWidth + 20
      if (agent.getCurrState() === States.DIE) {
        const enemyRayCaster = this.game.cpuRaycaster
        enemyRayCaster.mapGameObjects(agent.sprite)
      }
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
