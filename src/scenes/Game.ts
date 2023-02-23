import Phaser from 'phaser'

export default class Game extends Phaser.Scene {
  public tilemap!: Phaser.Tilemaps.Tilemap

  constructor() {
    super('game')
  }

  create() {
    this.tilemap = this.make.tilemap({
      key: 'map',
    })
    const tileset = this.tilemap.addTilesetImage('map-tiles', 'map-tiles')
    this.createLayer('Base', tileset)
    this.createLayer('Top', tileset)
  }

  createLayer(layerName: string, tileset: Phaser.Tilemaps.Tileset) {
    this.tilemap.createLayer(layerName, tileset)
  }
}
