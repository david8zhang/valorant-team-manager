import Phaser from 'phaser'
import { CPU } from '~/core/CPU'
import { Pathfinding } from '~/core/Pathfinding'
import { Player } from '~/core/Player'
import { Constants } from '~/utils/Constants'

export default class Game extends Phaser.Scene {
  private static _instance: Game
  public tilemap!: Phaser.Tilemaps.Tilemap

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

  public layers: any = {}
  public walls: Phaser.GameObjects.Group | any

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
    const layer = this.tilemap.getLayer('Base')
    const x = Math.floor(worldX / 16)
    const y = Math.floor(worldY / 16)
    return layer.data[y][x]
  }

  getWorldPosForTilePos(row: number, col: number) {
    const layer = this.tilemap.getLayer('Base')
    const tile = layer.data[row][col]
    return {
      x: tile.pixelX + tile.width / 2,
      y: tile.pixelY + tile.height / 2,
    }
  }

  getTilePosForWorldPos(worldX: number, worldY: number) {
    return {
      col: Math.floor(worldX / 16),
      row: Math.floor(worldY / 16),
    }
  }

  create() {
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
    this.layers.top.setDepth(Constants.SORT_LAYERS.TopLayer)
    this.pathfinding = new Pathfinding({
      tilemap: this.tilemap,
      unwalkableTiles: [1],
    })
    this.initPlayerAndCPU()
    this.initColliders()
  }

  initColliders() {
    this.physics.add.collider(this.playerAgentsGroup, this.walls)
    this.physics.add.collider(this.cpuAgentsGroup, this.walls)
  }

  initRaycaster() {
    const baseLayer = this.layers.base
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
    this.playerAgentsGroup = this.add.group()
    this.cpuAgentsGroup = this.add.group()

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
    // Initialize tilemap
    this.tilemap = this.make.tilemap({
      key: 'map',
    })
    const tileset = this.tilemap.addTilesetImage('map-tiles', 'map-tiles')
    const baseLayer = this.createLayer('Base', tileset)
    const topLayer = this.createLayer('Top', tileset)
    this.layers.base = baseLayer
    this.layers.top = topLayer
    this.walls = this.add.group()

    // TODO: Load walls from a config
    this.createWall({ x: 8, y: 168 }, { x: 104, y: 168 })
    this.createWall({ x: 200, y: 152 }, { x: 248, y: 152 })
    this.createWall({ x: 520, y: 152 }, { x: 568, y: 152 })
  }

  createWall(
    start: { x: number; y: number },
    end: { x: number; y: number },
    isVertical: boolean = false
  ) {
    const startXPos = isVertical ? start.x : start.x - 8
    const startYPos = isVertical ? start.y - 8 : start.y
    const wallSprite = this.physics.add
      .sprite(startXPos, startYPos, 'wall')
      .setDepth(Constants.SORT_LAYERS.UI)
      .setOrigin(0, 0.5)
    wallSprite.setImmovable(true)

    let scaledWidth = isVertical ? wallSprite.displayWidth : end.x - start.x
    let scaledHeight = isVertical ? end.y - start.y : wallSprite.displayHeight
    wallSprite.setDisplaySize(scaledWidth, scaledHeight)
    this.walls.add(wallSprite)
    return wallSprite
  }

  createLayer(layerName: string, tileset: Phaser.Tilemaps.Tileset) {
    return this.tilemap.createLayer(layerName, tileset)
  }

  createFOV() {
    this.maskGraphics = this.add.graphics({ fillStyle: { color: 0xffffff, alpha: 0 } })
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
  }

  unPause() {
    this.isPaused = false
    this.pausedStateText
      .setText('Playing')
      .setPosition(Constants.MAP_WIDTH - this.pausedStateText.displayWidth - 20, 10)
    this.player.unpause()
  }

  public draw(intersections: any[]) {
    this.maskGraphics.fillPoints(intersections)
  }
}
