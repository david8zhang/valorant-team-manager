import { PostRoundPlayerStats } from '~/core/ui/PostRoundPlayerStats'
import { PostRound } from '../PostRound'
import TeamMgmt from '../TeamMgmt'
import { Screen } from './Screen'
import { Constants } from '~/utils/Constants'
import { Button } from '~/core/ui/Button'
import { PostRoundScreenKeys } from './ScreenKeys'

export class PostRoundPlayerStatsScreen implements Screen {
  private scene: PostRound
  private playerStatCards: PostRoundPlayerStats[] = []
  private continueButton!: Button
  private titleText: Phaser.GameObjects.Text

  constructor(scene: PostRound) {
    this.scene = scene
    this.setupPlayerStatCards()
    this.setupContinueButton()
    this.titleText = this.scene.add.text(Constants.WINDOW_WIDTH / 2, 30, 'Post Round', {
      fontSize: '30px',
      color: 'black',
    })
    this.titleText.setPosition(
      Constants.WINDOW_WIDTH / 2 - this.titleText.displayWidth / 2,
      this.titleText.y + 10
    )
    this.setVisible(false)
  }

  setupContinueButton() {
    this.continueButton = new Button({
      scene: this.scene,
      x: Constants.WINDOW_WIDTH / 2,
      y: Constants.WINDOW_HEIGHT - 50,
      backgroundColor: 0x444444,
      width: 150,
      height: 50,
      text: 'Continue',
      textColor: 'white',
      fontSize: '20px',
      onClick: () => {
        this.scene.renderActiveScreen(PostRoundScreenKeys.PLAYER_STATS)
      },
    })
  }

  setupPlayerStatCards() {
    const padding = 15
    const playerConfigs = Object.keys(this.scene.playerStats).map((key) => {
      return {
        ...this.scene.playerStats[key],
        name: key,
      }
    })
    const cardWidth =
      TeamMgmt.BODY_WIDTH / playerConfigs.length -
      padding * ((playerConfigs.length + 1) / playerConfigs.length)
    let xPos =
      Constants.WINDOW_WIDTH / 2 -
      (cardWidth * playerConfigs.length + (padding * playerConfigs.length - 1)) / 2 +
      7

    playerConfigs.forEach((config) => {
      this.playerStatCards.push(
        new PostRoundPlayerStats(this.scene, {
          name: config.name,
          position: {
            x: xPos,
            y: padding + 80,
          },
          height: Constants.WINDOW_HEIGHT - 200,
          width: cardWidth,
          stats: {
            ...config,
          },
        })
      )
      xPos += cardWidth + padding
    })
  }

  onRender(): void {}
  setVisible(isVisible: boolean): void {
    this.playerStatCards.forEach((card) => {
      card.setVisible(isVisible)
    })
    this.continueButton.setVisible(isVisible)
    this.titleText.setVisible(isVisible)
  }
}
