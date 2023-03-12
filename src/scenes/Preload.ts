import { Constants } from '~/utils/Constants'

export default class Preload extends Phaser.Scene {
  constructor() {
    super('preload')
  }

  preload() {
    this.load.tilemapTiledJSON('map', 'map/map.json')
    this.load.image('map-tiles', 'map/map-tiles.png')
    this.load.image('wall-horizontal', 'map/wall-horizontal.png')
    this.load.image('wall-vertical', 'map/wall-vertical.png')
    this.load.image('spike', 'map/spike.png')
    this.load.image('spike-planted', 'map/spike-planted.png')
    this.load.image('spike-icon', 'map/spike-icon.png')

    this.load.image('player-agent', 'agents/player-agent.png')
    this.load.image('cpu-agent', 'agents/cpu-agent.png')

    this.load.image('move-icon', 'ui/move-icon.png')
    this.load.image('watch-icon', 'ui/watch-icon.png')
    this.load.image('plant-icon', 'ui/plant-icon.png')
    this.load.image('pause', 'ui/pause.png')
    this.load.image('play', 'ui/play.png')

    this.load.image('muzzle-flare', 'effects/muzzle-flare.png')

    // Weapons
    this.load.image('classic-icon', 'weapons/classic-icon.png')
    this.load.image('spectre-icon', 'weapons/spectre-icon.png')
    this.load.image('vandal-icon', 'weapons/vandal-icon.png')

    Constants.CALC_A_SITE_POSITIONS()
    Constants.CALC_B_SITE_POSITIONS()
  }

  create() {
    this.scene.start('ui')
    this.scene.start('game')
  }
}
