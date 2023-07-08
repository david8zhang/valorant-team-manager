import Phaser from 'phaser'
import PhaserRaycaster from 'phaser-raycaster'
import ToggleSwitchPlugin from 'phaser3-rex-plugins/plugins/toggleswitch-plugin'

import Round from './scenes/Round'
import Preload from './scenes/Preload'
import UI from './scenes/UI'
import { RoundConstants } from './utils/RoundConstants'
import StartMenu from './scenes/StartMenu'
import TeamMgmt from './scenes/TeamMgmt/TeamMgmt'
import { PostRound } from './scenes/PostRound/PostRound'
import { FirstTime } from './scenes/FirstTime/FirstTime'

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: RoundConstants.WINDOW_WIDTH,
  height: RoundConstants.WINDOW_HEIGHT,
  parent: 'phaser',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      // debug: true,
    },
  },
  dom: {
    createContainer: true,
  },
  pixelArt: true,
  scale: {
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  plugins: {
    global: [
      {
        key: 'rexToggleSwitchPlugin',
        plugin: ToggleSwitchPlugin,
        start: true,
      },
    ],
    scene: [
      {
        key: 'PhaserRaycaster',
        plugin: PhaserRaycaster,
        mapping: 'raycasterPlugin',
      },
    ],
  },
  scene: [Preload, StartMenu, FirstTime, TeamMgmt, Round, UI, PostRound],
}

export default new Phaser.Game(config)
