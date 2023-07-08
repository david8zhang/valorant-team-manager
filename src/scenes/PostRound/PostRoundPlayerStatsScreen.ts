import { PostRoundPlayerStats } from '~/core/ui/PostRoundPlayerStats'
import { RoundConstants } from '~/utils/RoundConstants'
import { Button } from '~/core/ui/Button'
import { Screen } from '../TeamMgmt/Screen'
import { PostRound } from '~/scenes/PostRound/PostRound'
import TeamMgmt from '~/scenes/TeamMgmt/TeamMgmt'
import { PostRoundScreenKeys } from './PostRoundScreenKeys'
import { Side } from '~/core/Agent'

export class PostRoundPlayerStatsScreen implements Screen {
  private scene: PostRound
  private playerStatCards: PostRoundPlayerStats[] = []
  private continueButton!: Button
  private titleText: Phaser.GameObjects.Text

  constructor(scene: PostRound) {
    this.scene = scene
    this.setupPlayerStatCards()
    this.setupContinueButton()
    this.titleText = this.scene.add.text(RoundConstants.WINDOW_WIDTH / 2, 30, 'Post Round', {
      fontSize: '30px',
      color: 'black',
    })
    this.titleText.setPosition(
      RoundConstants.WINDOW_WIDTH / 2 - this.titleText.displayWidth / 2,
      this.titleText.y + 10
    )
    this.setVisible(false)
  }

  setupContinueButton() {
    this.continueButton = new Button({
      scene: this.scene,
      x: RoundConstants.WINDOW_WIDTH / 2,
      y: RoundConstants.WINDOW_HEIGHT - 50,
      backgroundColor: 0x444444,
      width: 150,
      height: 50,
      text: 'Continue',
      textColor: 'white',
      fontSize: '20px',
      onClick: () => {
        this.scene.renderActiveScreen(PostRoundScreenKeys.PLAYER_EXP)
      },
    })
  }

  setupPlayerStatCards() {
    const padding = 15
    const playerAgentStats = this.scene.playerStats[Side.PLAYER]
    const playerConfigs = Object.keys(playerAgentStats).map((key) => {
      return {
        ...playerAgentStats[key],
        name: key,
      }
    })
    const cardWidth =
      TeamMgmt.BODY_WIDTH / playerConfigs.length -
      padding * ((playerConfigs.length + 1) / playerConfigs.length)
    let xPos =
      RoundConstants.WINDOW_WIDTH / 2 -
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
          height: RoundConstants.WINDOW_HEIGHT - 200,
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
