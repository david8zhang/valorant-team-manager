import Phaser from 'phaser'
import { Agent, Side } from '~/core/Agent'
import { CPU } from '~/core/CPU'
import { Map } from '~/core/Map'
import { Pathfinding } from '~/core/Pathfinding'
import { Player } from '~/core/Player'
import { Spike } from '~/core/Spike'
import { RoundConstants, RoundState } from '~/utils/RoundConstants'
import { GunTypes } from '~/utils/GunConstants'
import UI from './UI'
import { PlayerAgentConfig, TeamConfig } from './TeamMgmt/TeamMgmt'
import { Save, SaveKeys } from '~/utils/Save'
import { PostRoundConfig } from './PostRound/PostRound'

export default class Round extends Phaser.Scene {
  private static _instance: Round

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

  public cpuTeamConfig!: TeamConfig
  public playerTeamConfig!: TeamConfig
  public isPlayoffGame: boolean = false

  constructor() {
    super('round')
    if (!Round._instance) {
      Round._instance = this
    }
  }

  public init(data: {
    cpuTeamConfig: TeamConfig
    playerTeamConfig: TeamConfig
    isPlayoffGame: boolean
  }) {
    this.cpuTeamConfig = data.cpuTeamConfig
    this.playerTeamConfig = data.playerTeamConfig
    if (data.isPlayoffGame) {
      this.isPlayoffGame = data.isPlayoffGame
    }
  }

  public static get instance() {
    return Round._instance
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
    this.cameras.main.setScroll(0, -RoundConstants.TOP_BAR_HEIGHT)
    this.initMap()
    this.initRaycaster()
    this.createFOV()
    this.fow.setDepth(RoundConstants.SORT_LAYERS.BottomLayer + 1)
    this.map.layers.top.setDepth(RoundConstants.SORT_LAYERS.TopLayer)
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
    this.player = new Player(this, {
      teamRoster: this.playerTeamConfig.roster.filter(
        (agent: PlayerAgentConfig) => agent.isStarting
      ),
    })
    this.cpu = new CPU(this, {
      teamRoster: this.cpuTeamConfig.roster.filter((agent: PlayerAgentConfig) => agent.isStarting),
    })
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

  handleRoundFinished() {
    const postRoundConfig = this.generatePostRoundData()
    this.scene.bringToTop('team-mgmt')
    this.scene.bringToTop('post-round')
    this.scene.start('post-round', postRoundConfig)
  }

  getWinningSide() {
    return this.scoreMapping[Side.PLAYER] >= this.scoreMapping[Side.CPU] ? Side.PLAYER : Side.CPU
  }

  generatePostRoundData(): PostRoundConfig {
    const accumulateStat = (key: string) => {
      return (acc, curr) => {
        return acc + curr[key]
      }
    }
    const winningSide = this.getWinningSide()
    const player = this.player
    const cpu = this.cpu

    const totalPlayerKills = player.agents.reduce(accumulateStat('kills'), 0)
    const totalPlayerAssists = player.agents.reduce(accumulateStat('assists'), 0)
    const totalPlayerDeaths = player.agents.reduce(accumulateStat('deaths'), 0)
    const totalCPUKills = cpu.agents.reduce(accumulateStat('kills'), 0)
    const totalCPUAssists = cpu.agents.reduce(accumulateStat('assists'), 0)
    const totalCPUDeaths = cpu.agents.reduce(accumulateStat('deaths'), 0)

    const allTeams = Save.getData(SaveKeys.ALL_TEAM_CONFIGS) as { [key: string]: TeamConfig }
    const playerTeamConfig = allTeams[Save.getData(SaveKeys.PLAYER_TEAM_NAME)] as TeamConfig
    return {
      winningSide,
      teamStats: {
        [Side.PLAYER]: {
          totalKills: totalPlayerKills,
          totalAssists: totalPlayerAssists,
          totalDeaths: totalPlayerDeaths,
        },
        [Side.CPU]: {
          totalKills: totalCPUKills,
          totalAssists: totalCPUAssists,
          totalDeaths: totalCPUDeaths,
        },
      },
      playerStats: {
        [Side.PLAYER]: this.generateAgentStats(player.agents, winningSide === Side.PLAYER),
        [Side.CPU]: this.generateAgentStats(cpu.agents, winningSide === Side.CPU),
      },
      cpuTeamConfig: this.cpuTeamConfig,
      playerTeamConfig,
      isPlayoffGame: this.isPlayoffGame,
    }
  }

  generateAgentStats(agents: Agent[], didWin: boolean) {
    const statMapping = {}
    let mostPlayerKills = 0
    let nameOfAgentWithMostKills = agents[0].name

    agents.forEach((agent) => {
      if (agent.kills > mostPlayerKills) {
        mostPlayerKills = agent.kills
        nameOfAgentWithMostKills = agent.name
      }
      statMapping[agent.name] = {
        kills: agent.kills,
        assists: agent.assists,
        deaths: agent.deaths,
        teamMvp: false,
        matchMvp: false,
      }
    })
    if (didWin) {
      statMapping[nameOfAgentWithMostKills].matchMvp = true
    } else {
      statMapping[nameOfAgentWithMostKills].teamMvp = true
    }
    return statMapping
  }

  restartRound() {
    this.unPause()
    this.resetScores()
    this.resetAgentPositions()
    this.resetAgentStatsAndWeapons()
    this.onResetRoundHandlers.forEach((handler) => {
      handler()
    })
    this.raiseBarriers()
  }

  startOvertime() {
    this.unPause()
    this.resetAgentPositions()
    this.raiseBarriers()
    const resetFn = (agent) => {
      agent.credits = 0
      agent.currWeapon = GunTypes.PISTOL
    }
    this.player.agents.forEach(resetFn)
    this.cpu.agents.forEach(resetFn)
  }

  resetAgentStatsAndWeapons() {
    const resetFn = (agent) => {
      agent.kills = 0
      agent.deaths = 0
      agent.assists = 0
      agent.credits = 0
      agent.currWeapon = GunTypes.PISTOL
    }
    this.player.agents.forEach(resetFn)
    this.cpu.agents.forEach(resetFn)
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
    this.fow.fillRect(0, 0, RoundConstants.MAP_WIDTH, RoundConstants.MAP_HEIGHT)
  }

  update() {
    this.maskGraphics.clear()
    this.cpu.update()
    this.player.update()
  }

  pause() {
    this.isPaused = true
    this.player.pause()
    this.onPauseCallbacks.forEach((cb) => {
      cb(true)
    })
  }

  unPause() {
    this.isPaused = false
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
