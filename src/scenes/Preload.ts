export default class Preload extends Phaser.Scene {
  constructor() {
    super('preload')
  }

  preload() {
    this.load.tilemapTiledJSON('map', 'map.json')
    this.load.image('map-tiles', 'map-tiles.png')
    this.load.image('player-agent', 'agents/player-agent.png')
    this.load.image('cpu-agent', 'agents/cpu-agent.png')

    this.load.image('move-icon', 'ui/move-icon.png')
    this.load.image('watch-icon', 'ui/watch-icon.png')
  }

  create() {
    this.scene.start('ui')
    this.scene.start('game')
  }
}
