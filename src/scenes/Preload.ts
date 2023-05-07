import { MapConstants } from '~/utils/MapConstants'
import { Save } from '~/utils/Save'
import { PostRoundConfig } from './PostRound'
import { Side } from '~/core/Agent'

export default class Preload extends Phaser.Scene {
  constructor() {
    super('preload')
    new Save()
  }

  preload() {
    this.load.tilemapTiledJSON('map', 'map/ascent.json')
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
    this.load.image('stop-watch-icon', 'ui/stop-watch-icon.png')
    this.load.image('plant-icon', 'ui/plant-icon.png')
    this.load.image('pause', 'ui/pause.png')
    this.load.image('play', 'ui/play.png')

    this.load.image('muzzle-flare', 'effects/muzzle-flare.png')

    // Weapons
    this.load.image('classic-icon', 'weapons/classic-icon.png')
    this.load.image('spectre-icon', 'weapons/spectre-icon.png')
    this.load.image('vandal-icon', 'weapons/vandal-icon.png')

    this.load.image('classic-icon-cropped', 'weapons/classic-icon-cropped.png')
    this.load.image('spectre-icon-cropped', 'weapons/spectre-icon-cropped.png')
    this.load.image('vandal-icon-cropped', 'weapons/vandal-icon-cropped.png')

    this.load.image('backward', 'ui/backward.png')
    this.load.image('forward', 'ui/forward.png')

    MapConstants.CALC_A_SITE_POSITIONS()
    MapConstants.CALC_B_SITE_POSITIONS()
  }

  create() {
    const data: PostRoundConfig = {
      winningSide: Side.PLAYER,
      teamStats: {
        [Side.PLAYER]: {
          totalKills: 30,
          totalAssists: 10,
          totalDeaths: 5,
        },
        [Side.CPU]: {
          totalKills: 30,
          totalAssists: 10,
          totalDeaths: 5,
        },
      },
      playerStats: {
        'GDT-1': {
          kills: 10,
          deaths: 5,
          assists: 5,
          teamMvp: false,
          matchMvp: true,
        },
        'GDT-2': {
          kills: 10,
          deaths: 5,
          assists: 5,
          teamMvp: false,
          matchMvp: false,
        },
        'GDT-3': {
          kills: 10,
          deaths: 5,
          assists: 5,
          teamMvp: false,
          matchMvp: false,
        },
      },
      cpuTeamConfig: {
        name: 'Ironborn Dragons',
        shortName: 'IRD',
        wins: 1,
        losses: 0,
        roster: [
          {
            name: 'IRO-1',
            isStarting: true,
            texture: '',
            potential: 1,
            attributes: { accuracy: 0, headshot: 0, reaction: 0 },
            experience: { accuracy: 0, headshot: 0, reaction: 0 },
          },
          {
            name: 'IRO-2',
            isStarting: true,
            texture: '',
            potential: 1,
            attributes: { accuracy: 0, headshot: 0, reaction: 0 },
            experience: { accuracy: 0, headshot: 0, reaction: 0 },
          },
          {
            name: 'IRO-3',
            isStarting: true,
            texture: '',
            potential: 1,
            attributes: { accuracy: 0, headshot: 0, reaction: 0 },
            experience: { accuracy: 0, headshot: 0, reaction: 0 },
          },
        ],
      },
      playerTeamConfig: {
        name: 'Guangdong Tigers',
        shortName: 'GDT',
        wins: 1,
        losses: 0,
        roster: [
          {
            name: 'GDT-1',
            isStarting: true,
            texture: '',
            potential: 2,
            attributes: { accuracy: 0, headshot: 0, reaction: 0 },
            experience: { accuracy: 0, headshot: 0, reaction: 0 },
          },
          {
            name: 'GDT-2',
            isStarting: true,
            texture: '',
            potential: 0,
            attributes: { accuracy: 0, headshot: 0, reaction: 0 },
            experience: { accuracy: 0, headshot: 0, reaction: 0 },
          },
          {
            name: 'GDT-3',
            isStarting: true,
            texture: '',
            potential: 0,
            attributes: { accuracy: 0, headshot: 0, reaction: 0 },
            experience: { accuracy: 0, headshot: 0, reaction: 0 },
          },
        ],
      },
    }
    this.scene.start('post-round', data)
    // this.scene.start('team-mgmt')
    // this.scene.start('start')
  }
}
