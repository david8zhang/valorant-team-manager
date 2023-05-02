import Phaser from 'phaser'
import PhaserRaycaster from 'phaser-raycaster'
import ToggleSwitchPlugin from 'phaser3-rex-plugins/plugins/toggleswitch-plugin'

import Round from './scenes/Round'
import Preload from './scenes/Preload'
import UI from './scenes/UI'
import { Constants } from './utils/Constants'
import StartMenu from './scenes/StartMenu'
import Home from './scenes/Home'

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: Constants.WINDOW_WIDTH,
  height: Constants.WINDOW_HEIGHT,
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
  scene: [Preload, StartMenu, Home, Round, UI],
}

export default new Phaser.Game(config)
