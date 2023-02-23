export default class Preload extends Phaser.Scene {
  constructor() {
    super('preload')
  }

  preload() {
    this.load.tilemapTiledJSON('map', 'map.json')
    this.load.image('map-tiles', 'map-tiles.png')
  }

  create() {
    this.scene.start('game')
  }
}
