import { Scene } from 'phaser'
import { Save, SaveKeys } from '~/utils/Save'
import { Screen } from './Screen'
import { HomePlayerInfo } from '../HomePlayerInfo'
import TeamMgmt from '~/scenes/TeamMgmt'
import { Constants } from '~/utils/Constants'

export class HomeScreen implements Screen {
  private scene: Scene
  private playerCards: HomePlayerInfo[] = []

  constructor(scene: Scene) {
    this.scene = scene
    this.setupPlayerCards()
  }

  setupPlayerCards() {
    let playerConfigs = Save.getData(SaveKeys.PLAYER_AGENT_CONFIGS)
    if (!playerConfigs) {
      playerConfigs = this.generateNewPlayers()
      Save.setData(SaveKeys.PLAYER_AGENT_CONFIGS, playerConfigs)
    }

    const padding = 15
    const cardWidth =
      TeamMgmt.BODY_WIDTH / playerConfigs.length -
      padding * ((playerConfigs.length + 1) / playerConfigs.length)
    let xPos = TeamMgmt.SIDEBAR_WIDTH + padding
    playerConfigs.forEach((config) => {
      this.playerCards.push(
        new HomePlayerInfo(this.scene, {
          name: config.name,
          position: {
            x: xPos,
            y: padding,
          },
          height: Constants.WINDOW_HEIGHT - 30,
          width: cardWidth,
        })
      )
      xPos += cardWidth + padding
    })
  }

  setVisible(isVisible: boolean) {}

  generateNewPlayers(): any[] {
    const newPlayers: any[] = []
    for (let i = 1; i <= 3; i++) {
      newPlayers.push({
        name: `Agent-${i}`,
      })
    }
    return newPlayers
  }
}
