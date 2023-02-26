import Game from '~/scenes/Game'
import UI, { CommandState } from '~/scenes/UI'
import { Agent } from './Agent'
import { States } from './states/States'

export class Player {
  public game: Game
  public cursorRect!: Phaser.GameObjects.Rectangle
  public agents: Agent[] = []
  public selectedAgentIndex: number = 0

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
      // this.queueAgentMoveCommand(e.worldX, e.worldY)
    })
    this.game.input.on(Phaser.Input.Events.POINTER_MOVE, (e) => {
      this.updateCursor()
    })
    this.game.input.keyboard.on(Phaser.Input.Keyboard.Events.ANY_KEY_DOWN, (e) => {
      if (e.code.includes('Digit')) {
        this.handleDigit(e.key)
      }
      switch (e.code) {
        case 'Space': {
          if (this.game.isPaused) {
            this.game.unPause()
          } else {
            this.game.pause()
          }
          break
        }
      }
    })
  }

  handleClick(e: any) {
    if (UI.instance) {
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
    if (this.selectedAgentIndex !== newAgentIndex) {
      const oldAgent = this.agents[this.selectedAgentIndex]
      oldAgent.dehighlight()
    }
    const selectedAgent = this.agents[newAgentIndex]
    selectedAgent.highlight()
    this.selectedAgentIndex = newAgentIndex
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
    let startX = 320
    let startY = 20
    for (let i = 1; i <= 3; i++) {
      const newAgent = new Agent({
        position: {
          x: startX,
          y: startY,
        },
        texture: 'player-agent',
        sightAngleDeg: 90,
        raycaster: this.game.playerRaycaster,
      })
      this.agents.push(newAgent)
      startX += newAgent.sprite.displayWidth + 20
    }
  }

  updateCursor() {
    const mousePointer = this.game.input.mousePointer
    const tilePos = this.game.getTilePosForWorldPos(mousePointer.worldX, mousePointer.worldY)
    const tileCenter = this.game.getWorldPosForTilePos(tilePos.row, tilePos.col)
    const tile = this.game.getTileAt(mousePointer.worldX, mousePointer.worldY)

    this.cursorRect.setPosition(tileCenter.x, tileCenter.y)
    if (tile.index === 1) {
      this.cursorRect.setStrokeStyle(2, 0xff0000)
    } else {
      this.cursorRect.setStrokeStyle(2, 0x00ff00)
    }
  }

  setupCursor() {
    const mousePointer = this.game.input.mousePointer
    const tilePos = this.game.getTilePosForWorldPos(mousePointer.worldX, mousePointer.worldY)
    const tileCenter = this.game.getWorldPosForTilePos(tilePos.row, tilePos.col)
    this.cursorRect = this.game.add.rectangle(tileCenter.x, tileCenter.y, 16, 16)
    this.cursorRect.setStrokeStyle(2, 0x00ff00).setDepth(100)
  }

  update() {
    this.agents.forEach((agent) => {
      agent.update()
    })
  }
}
