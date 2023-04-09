import Phaser, { BlendModes } from 'phaser'
import { Agent, Side } from '~/core/Agent'
import { CPU } from '~/core/CPU'
import { Map } from '~/core/Map'
import { Pathfinding } from '~/core/Pathfinding'
import { Player } from '~/core/Player'
import { Spike } from '~/core/Spike'
import { States } from '~/core/states/States'
import { Constants, RoundState } from '~/utils/Constants'
import { MapConstants } from '~/utils/MapConstants'
import UI, { CommandState } from './UI'

export default class Game extends Phaser.Scene {
  private static _instance: Game

  public maskGraphics!: Phaser.GameObjects.Graphics
  public graphics!: Phaser.GameObjects.Graphics
  public mask!: Phaser.Display.Masks.GeometryMask
  public fow!: Phaser.GameObjects.Graphics
  public raycasterPlugin: any
  public playerRaycaster: any
  public cpuRaycaster: any

  public player!: Player
  public playerAgentsGroup!: Phaser.GameObjects.Group
  public cpu!: CPU
  public cpuAgentsGroup!: Phaser.GameObjects.Group

  public pathfinding!: Pathfinding
  public isPaused: boolean = false
  public pausedStateText!: Phaser.GameObjects.Text

  public isDebug: boolean = true
  public debugHandlers: Function[] = []

  public onResetRoundHandlers: Function[] = []
  public onSpikeDropHandlers: Function[] = []

  public roundState: RoundState = RoundState.PREROUND
  public attackSide: Side = Side.CPU
  public scoreMapping: {
    [key in Side]: number
  } = {
    [Side.PLAYER]: 0,
    [Side.CPU]: 0,
  }
  public spike!: Spike
  public onPauseCallbacks: Function[] = []

  public map!: Map

  constructor() {
    super('game')
    if (!Game._instance) {
      Game._instance = this
    }
  }

  public static get instance() {
    return Game._instance
  }

  getTileAt(worldX: number, worldY: number) {
    return this.map.getTileAt(worldX, worldY)
  }

  getWorldPosForTilePos(row: number, col: number) {
    return this.map.getWorldPosForTilePos(row, col)
  }

  getTilePosForWorldPos(worldX: number, worldY: number) {
    return {
      col: Math.floor(worldX / 16),
      row: Math.floor(worldY / 16),
    }
  }

  addScore(side: Side) {
    this.scoreMapping[side]++
    UI.instance.updateScores()
  }

  setupDebugKeyListener() {
    this.input.keyboard.on(Phaser.Input.Keyboard.Events.ANY_KEY_DOWN, (e) => {
      if (e.code === 'Backquote') {
        this.isDebug = !this.isDebug
        this.debugHandlers.forEach((handler) => {
          handler(this.isDebug)
        })
      }
    })
  }

  create() {
    this.playerAgentsGroup = this.add.group()
    this.cpuAgentsGroup = this.add.group()
    this.setupDebugKeyListener()
    this.cameras.main.setScroll(0, -Constants.TOP_BAR_HEIGHT)
    this.pausedStateText = this.add
      .text(Constants.MAP_WIDTH, 10, 'Playing')
      .setDepth(100)
      .setFontSize(12)
    this.pausedStateText.setPosition(
      Constants.MAP_WIDTH - this.pausedStateText.displayWidth - 20,
      10
    )
    this.initMap()
    this.initRaycaster()
    this.createFOV()
    this.fow.setDepth(Constants.SORT_LAYERS.BottomLayer + 1)
    this.map.layers.top.setDepth(Constants.SORT_LAYERS.TopLayer)
    this.pathfinding = new Pathfinding({
      tilemap: this.map.tilemap,
      unwalkableTiles: [1],
    })
    this.initPlayerAndCPU()
  }

  initRaycaster() {
    const baseLayer = this.map.layers.base
    this.playerRaycaster = this.raycasterPlugin.createRaycaster()
    this.playerRaycaster.mapGameObjects(baseLayer, false, {
      collisionTiles: [1],
    })
    this.cpuRaycaster = this.raycasterPlugin.createRaycaster()
    this.cpuRaycaster.mapGameObjects(baseLayer, false, {
      collisionTiles: [1],
    })
  }

  initPlayerAndCPU() {
    this.player = new Player()
    this.cpu = new CPU()
    this.cpu.agents.forEach((agent) => {
      this.playerAgentsGroup.add(agent.sprite)
      this.playerRaycaster.mapGameObjects(agent.sprite, true)
    })
    this.player.agents.forEach((agent) => {
      this.cpuAgentsGroup.add(agent.sprite)
      this.cpuRaycaster.mapGameObjects(agent.sprite, true)
    })
  }

  initMap() {
    this.map = new Map(this)
  }

  dropBarriers() {
    this.map.dropBarriers()
  }

  resetScores() {
    this.scoreMapping[Side.PLAYER] = 0
    this.scoreMapping[Side.CPU] = 0
    UI.instance.updateScores()
  }

  restartRound() {
    this.resetScores()
    this.resetAgentPositions()
    this.onResetRoundHandlers.forEach((handler) => {
      handler()
    })
    this.raiseBarriers()
  }

  resetAgentPositions() {
    this.player.resetAgents()
    this.cpu.resetAgents()
  }

  raiseBarriers() {
    this.map.raiseBarriers()
  }

  createFOV() {
    this.maskGraphics = this.add.graphics({
      fillStyle: { color: 0xffffff, alpha: 0 },
    })
    this.mask = new Phaser.Display.Masks.GeometryMask(this, this.maskGraphics)
    this.mask.setInvertAlpha()
    this.fow = this.add.graphics({ fillStyle: { color: 0x000000, alpha: 0.2 } }).setDepth(100)
    this.fow.setMask(this.mask)
    this.fow.fillRect(0, 0, Constants.MAP_WIDTH, Constants.MAP_HEIGHT)
  }

  update() {
    this.maskGraphics.clear()
    this.cpu.update()
    this.player.update()
  }

  pause() {
    this.isPaused = true
    this.pausedStateText
      .setText('Paused')
      .setPosition(Constants.MAP_WIDTH - this.pausedStateText.displayWidth - 20, 10)
    this.player.pause()
    this.onPauseCallbacks.forEach((cb) => {
      cb(true)
    })
  }

  unPause() {
    this.isPaused = false
    this.pausedStateText
      .setText('Playing')
      .setPosition(Constants.MAP_WIDTH - this.pausedStateText.displayWidth - 20, 10)
    this.player.unpause()
    this.onPauseCallbacks.forEach((cb) => {
      cb(false)
    })
  }

  getAgentByName(name: string) {
    const playerAgent = this.player.agents.find((agent) => agent.name === name)
    if (playerAgent) {
      return playerAgent
    }
    const cpuAgent = this.cpu.agents.find((agent) => agent.name === name)
    return cpuAgent
  }

  public draw(intersections: any[]) {
    this.maskGraphics.fillPoints(intersections, true)
  }
}
