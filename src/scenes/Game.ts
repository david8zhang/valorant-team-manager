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

  public roundState: RoundState = RoundState.PREROUND
  public attackSide: Side = Side.CPU
  public roundScoreMapping: {
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
    this.setupSpike()
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

  setupSpike() {
    this.spike = new Spike({
      position: MapConstants.INITIAL_SPIKE_POSITION,
    })
  }

  initMap() {
    this.map = new Map(this)
  }

  dropBarriers() {
    this.map.dropBarriers()
  }

  restartRound() {
    this.resetAgentPositions()
    this.spike.reset()
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
    this.checkRoundOver()
  }

  checkRoundOver() {
    if (this.roundState !== RoundState.POSTROUND) {
      const defenderAgents = this.attackSide === Side.CPU ? this.player.agents : this.cpu.agents
      const attackerAgents = this.attackSide === Side.CPU ? this.cpu.agents : this.player.agents

      const areAllDefDead =
        defenderAgents.filter((a) => a.getCurrState() !== States.DIE).length === 0
      const areAllAtkDead =
        attackerAgents.filter((a) => a.getCurrState() !== States.DIE).length === 0
      if (areAllDefDead) {
        this.roundScoreMapping[this.attackSide]++
        UI.instance.updateScores()
        UI.instance.endRoundPrematurely()
        this.roundState = RoundState.POSTROUND
      } else if (areAllAtkDead && !this.spike.isPlanted) {
        const defSide = this.attackSide === Side.CPU ? Side.PLAYER : Side.CPU
        this.roundScoreMapping[defSide]++
        UI.instance.updateScores()
        UI.instance.endRoundPrematurely()
        this.roundState = RoundState.POSTROUND
      }
    }
  }

  plantSpike(agent: Agent, x: number, y: number) {
    this.spike.plant(x, y)
    if (this.roundState === RoundState.PRE_PLANT_ROUND) {
      UI.instance.plantSpike()
      Game.instance.roundState = RoundState.POST_PLANT_ROUND
    }
    UI.instance.selectNewCommand(CommandState.MOVE)
    agent.hasSpike = false
  }

  defuseSpike() {
    this.spike.defuse()
    const defenseSide = this.attackSide === Side.CPU ? Side.PLAYER : Side.CPU
    this.roundScoreMapping[defenseSide]++
    UI.instance.updateScores()
    UI.instance.endRoundPrematurely()
    Game.instance.roundState = RoundState.POSTROUND
    UI.instance.selectNewCommand(CommandState.MOVE)
  }

  plantTimeExpire() {
    const defenseSide = this.attackSide === Side.PLAYER ? Side.CPU : Side.PLAYER
    this.roundScoreMapping[defenseSide]++
    UI.instance.updateScores()
  }

  detonateSpike() {
    this.roundScoreMapping[this.attackSide]++
    this.spike.detonate()
    UI.instance.updateScores()
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
