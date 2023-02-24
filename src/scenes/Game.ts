import Phaser from 'phaser'
import { Agent } from '~/core/Agent'
import { Pathfinding } from '~/core/Pathfinding'
import { Player } from '~/core/Player'
import { Constants } from '~/utils/Constants'

export default class Game extends Phaser.Scene {
  private static _instance: Game
  public tilemap!: Phaser.Tilemaps.Tilemap

  public maskGraphics!: Phaser.GameObjects.Graphics
  public mask!: Phaser.Display.Masks.GeometryMask
  public fow!: Phaser.GameObjects.Graphics
  public raycasterPlugin: any
  public raycaster: any
  public ray: any

  public playerAgents: Agent[] = []
  public pathfinding!: Pathfinding

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

  getTilePosForWorldPos(worldX: number, worldY: number) {
    return {
      col: Math.floor(worldX / 16),
      row: Math.floor(worldY / 16),
    }
  }

  create() {
    this.raycaster = this.raycasterPlugin.createRaycaster()
    this.ray = this.raycaster.createRay({
      origin: {
        x: 200,
        y: 200,
      },
    })

    this.tilemap = this.make.tilemap({
      key: 'map',
    })
    const tileset = this.tilemap.addTilesetImage('map-tiles', 'map-tiles')
    const baseLayer = this.createLayer('Base', tileset)
    const topLayer = this.createLayer('Top', tileset)

    this.raycaster.mapGameObjects(baseLayer, false, {
      collisionTiles: [1],
    })

    this.createFOV()
    this.fow.setDepth(1)
    topLayer.setDepth(2)
    this.createPlayerAgents()

    this.pathfinding = new Pathfinding({
      tilemap: this.tilemap,
      unwalkableTiles: [1],
    })

    const player = new Player()
  }

  createPlayerAgents() {
    let startX = 320
    let startY = 20
    for (let i = 1; i <= 3; i++) {
      const newAgent = new Agent({
        position: {
          x: startX,
          y: startY,
        },
        texture: 'player-agent',
      })
      this.playerAgents.push(newAgent)
      startX += newAgent.sprite.displayWidth + 20
    }
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
    this.fow.fillRect(0, 0, Constants.WINDOW_WIDTH, Constants.WINDOW_HEIGHT)
  }

  update() {
    this.maskGraphics.clear()
    this.playerAgents.forEach((agent) => {
      agent.update()
    })
  }

  public draw(intersections: any[]) {
    this.maskGraphics.fillPoints(intersections)
  }
}
