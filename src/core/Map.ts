import Round from '~/scenes/Round'
import { RoundConstants } from '~/utils/RoundConstants'
import { MapConstants } from '~/utils/MapConstants'

export class Map {
  private game: Round
  public tilemap!: Phaser.Tilemaps.Tilemap
  public layers: any = {}
  public walls!: Phaser.GameObjects.Group
  public wallColliders: Phaser.Physics.Arcade.Collider[] = []

  private static REGION_WIDTH_PIXELS = 64 * 2
  private static REGION_HEIGHT_PIXELS = 48 * 2
  private regions: {
    regionId: number
    topLeft: { row: number; col: number }
    bottomRight: { row: number; col: number }
    rect: Phaser.GameObjects.Rectangle
  }[] = []

  constructor(game: Round) {
    this.game = game
    this.setupTilemap()
    this.setupWalls()
    this.generateRegions()
    this.renderMapCallouts()
  }

  renderMapCallouts() {
    MapConstants.MAP_CALLOUT_LOCATIONS.forEach((obj) => {
      const { center, name } = obj
      const text = this.game.add
        .text(center.x, center.y, name, {
          fontSize: '8px',
          color: 'white',
        })
        .setDepth(RoundConstants.SORT_LAYERS.UI)
      text.setPosition(center.x - text.displayWidth / 2, center.y - text.displayHeight / 2)
    })
  }

  generateRegions() {
    let regionId = 0
    for (let i = 0; i < RoundConstants.MAP_WIDTH; i += Map.REGION_WIDTH_PIXELS) {
      for (let j = 0; j < RoundConstants.MAP_HEIGHT; j += Map.REGION_HEIGHT_PIXELS) {
        const tileTopLeft = this.getTileAt(i, j)
        const tileBottomRight = this.getTileAt(i + 118, j + 88)
        const regionRect = this.game.add
          .rectangle(
            i + Map.REGION_WIDTH_PIXELS / 2,
            j + Map.REGION_HEIGHT_PIXELS / 2,
            Map.REGION_WIDTH_PIXELS,
            Map.REGION_HEIGHT_PIXELS
          )
          .setStrokeStyle(2, 0x00ff00)
          .setDepth(RoundConstants.SORT_LAYERS.UI + 100)
          .setVisible(false)
        this.regions.push({
          regionId,
          topLeft: { row: tileTopLeft!.x, col: tileTopLeft!.y },
          bottomRight: { row: tileBottomRight!.x, col: tileBottomRight!.y },
          rect: regionRect,
        })
        regionId++
      }
    }
  }

  setupTilemap() {
    this.tilemap = this.game.make.tilemap({
      key: 'map',
    })
    const tileset = this.tilemap.addTilesetImage('map-tiles', 'map-tiles')
    const baseLayer = this.createLayer('Base', tileset)
    const topLayer = this.createLayer('Top', tileset)
    this.layers.base = baseLayer
    this.layers.top = topLayer
    this.walls = this.game.add.group()
  }

  getTileAtRowCol(row: number, col: number) {
    const layer = this.tilemap.getLayer('Base')
    return layer.data[row][col]
  }

  getTileAt(worldX: number, worldY: number) {
    const layer = this.tilemap.getLayer('Base')
    const x = Math.floor(worldX / 16)
    const y = Math.floor(worldY / 16)
    if (y >= 0 && y < layer.data.length && x >= 0 && x < layer.data[0].length) {
      return layer.data[y][x]
    }
    return null
  }

  getWorldPosForTilePos(row: number, col: number) {
    const layer = this.tilemap.getLayer('Base')
    const tile = layer.data[row][col]
    return {
      x: tile.pixelX + tile.width / 2,
      y: tile.pixelY + tile.height / 2,
    }
  }

  private createWall(
    start: { x: number; y: number },
    end: { x: number; y: number },
    isVertical: boolean = false
  ) {
    const startXPos = isVertical ? start.x : start.x - 8
    const startYPos = isVertical ? start.y - 8 : start.y
    const wallSprite = this.game.physics.add
      .sprite(startXPos, startYPos, isVertical ? 'wall-vertical' : 'wall-horizontal')
      .setDepth(RoundConstants.SORT_LAYERS.UI)
    if (isVertical) {
      wallSprite.setOrigin(0.5, 0)
    } else {
      wallSprite.setOrigin(0, 0.5)
    }
    wallSprite.setImmovable(true)
    let scaledWidth = isVertical ? wallSprite.displayWidth : end.x - start.x
    let scaledHeight = isVertical ? end.y - start.y : wallSprite.displayHeight
    wallSprite.setDisplaySize(scaledWidth, scaledHeight)
    this.walls.add(wallSprite)
    return wallSprite
  }

  private createLayer(layerName: string, tileset: Phaser.Tilemaps.Tileset) {
    return this.tilemap.createLayer(layerName, tileset)
  }

  setupWalls() {
    // Player side walls
    this.createWall({ x: 568, y: 248 }, { x: 600, y: 248 })
    this.createWall({ x: 456, y: 232 }, { x: 488, y: 232 })
    this.createWall({ x: 104, y: 40 }, { x: 152, y: 40 })
    this.createWall({ x: 328, y: 232 }, { x: 360, y: 232 })

    // CPU side walls
    this.createWall({ x: 8, y: 264 }, { x: 56, y: 264 })
    this.createWall({ x: 408, y: 360 }, { x: 408, y: 408 }, true)
    this.createWall({ x: 472, y: 344 }, { x: 504, y: 344 })

    const playerWallCollider = this.game.physics.add.collider(
      this.game.playerAgentsGroup,
      this.walls
    )
    const agentWallCollider = this.game.physics.add.collider(this.game.cpuAgentsGroup, this.walls)
    this.wallColliders.push(playerWallCollider)
    this.wallColliders.push(agentWallCollider)
  }

  getDimensionsInTiles() {
    const layer = this.tilemap.getLayer('Base')
    return {
      numRows: layer.data.length,
      numCols: layer.data[0].length,
    }
  }

  isTileCoordWithinBounds(tileRow: number, tileCol: number) {
    const dimensionsInTiles = this.getDimensionsInTiles()
    return (
      tileRow >= 0 &&
      tileRow < dimensionsInTiles.numRows &&
      tileCol >= 0 &&
      tileCol < dimensionsInTiles.numCols
    )
  }

  isTileWalkable(tileRow: number, tileCol: number) {
    if (!this.isTileCoordWithinBounds(tileRow, tileCol)) {
      console.error('Tile row/col not within bounds: ', tileRow, tileCol)
      return false
    } else {
      const layer = this.tilemap.getLayer('Base')
      const tileData = layer.data[tileRow][tileCol]
      return tileData.index !== 1
    }
  }

  dropBarriers() {
    this.game.tweens.add({
      targets: this.walls.children.entries,
      alpha: {
        from: 1,
        to: 0,
      },
      duration: 250,
      onComplete: () => {
        this.wallColliders.forEach((collider) => {
          collider.active = false
        })
      },
    })
  }

  raiseBarriers() {
    this.walls.children.entries.forEach((child: Phaser.GameObjects.GameObject) => {
      const sprite = child as Phaser.Physics.Arcade.Sprite
      sprite.setAlpha(1)
    })
    this.wallColliders.forEach((collider) => {
      collider.active = true
    })
  }
}
