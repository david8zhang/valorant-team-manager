export default class Preload extends Phaser.Scene {
  constructor() {
    super('preload')
  }

  preload() {
    this.load.tilemapTiledJSON('map', 'map/map.json')
    this.load.image('map-tiles', 'map/map-tiles.png')
    this.load.image('wall-horizontal', 'map/wall-horizontal.png')
    this.load.image('wall-vertical', 'map/wall-vertical.png')

    this.load.image('player-agent', 'agents/player-agent.png')
    this.load.image('cpu-agent', 'agents/cpu-agent.png')

    this.load.image('move-icon', 'ui/move-icon.png')
    this.load.image('watch-icon', 'ui/watch-icon.png')
    this.load.image('pause', 'ui/pause.png')
    this.load.image('play', 'ui/play.png')

    this.load.image('muzzle-flare', 'effects/muzzle-flare.png')
  }

  create() {
    this.scene.start('ui')
    this.scene.start('game')
  }
}
