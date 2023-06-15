import { RoundConstants } from '~/utils/RoundConstants'
import { PostRound } from '../../PostRound'
import { Screen } from '../Screen'
import TeamMgmt, { TeamConfig } from '~/scenes/TeamMgmt'
import { PostRoundPlayerExp } from '~/core/ui/PostRoundPlayerExp'
import { PlayerRank } from '~/utils/PlayerConstants'
import { Side } from '~/core/Agent'
import { Button } from '~/core/ui/Button'
import { ExpGrowthMapping, SimulationUtils } from '~/utils/SimulationUtils'

export interface PlayerStatGrowthConfig {
  curr: number
  max: number
  gain: number
  oldRank: PlayerRank
  newRank: PlayerRank
}

export class PostRoundPlayerExpScreen implements Screen {
  private scene: PostRound
  private titleText: Phaser.GameObjects.Text
  private continueButton!: Button
  private playerExpCards: PostRoundPlayerExp[] = []
  public playerExpGrowthMapping: ExpGrowthMapping = {}

  // Static constants
  public static ROUND_WIN_EXP_MODIFIER = 2
  public static MVP_EXP_MODIFIER = 1.5

  constructor(scene: PostRound) {
    this.scene = scene
    this.titleText = this.scene.add.text(RoundConstants.WINDOW_WIDTH / 2, 30, 'Post Round', {
      fontSize: '30px',
      color: 'black',
    })
    this.titleText.setPosition(
      RoundConstants.WINDOW_WIDTH / 2 - this.titleText.displayWidth / 2,
      this.titleText.y + 10
    )
    this.playerExpGrowthMapping = SimulationUtils.createPlayerExpGrowthMapping(
      this.scene.playerTeamConfig,
      this.scene.playerStats[Side.PLAYER],
      this.scene.winningSide === Side.PLAYER
    )
    this.setupPlayerExpCards()
    this.setupContinueButton()
    this.setVisible(false)
  }

  setVisible(isVisible: boolean) {
    this.titleText.setVisible(isVisible)
    this.playerExpCards.forEach((card) => {
      card.setVisible(isVisible)
    })
    this.continueButton.setVisible(isVisible)
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
        this.setVisible(false)
        this.scene.handlePostRoundFinished(this.playerExpGrowthMapping)
      },
    })
  }

  onRender() {
    this.playerExpCards.forEach((card) => {
      card.onRender()
    })
  }

  setupPlayerExpCards() {
    const padding = 15
    const playerAgentStats = this.scene.playerStats[Side.PLAYER]
    const playerConfigs = Object.keys(playerAgentStats).map((key) => {
      return {
        ...playerAgentStats[key],
        name: key,
      }
    })
    // Calculate card widths and layout
    const cardWidth =
      TeamMgmt.BODY_WIDTH / playerConfigs.length -
      padding * ((playerConfigs.length + 1) / playerConfigs.length)
    let xPos =
      RoundConstants.WINDOW_WIDTH / 2 -
      (cardWidth * playerConfigs.length + (padding * playerConfigs.length - 1)) / 2 +
      7
    playerConfigs.forEach((config) => {
      const growthConfig = this.playerExpGrowthMapping[config.name]
      this.playerExpCards.push(
        new PostRoundPlayerExp(this.scene, {
          name: config.name,
          position: {
            x: xPos,
            y: padding + 80,
          },
          height: RoundConstants.WINDOW_HEIGHT - 200,
          width: cardWidth,
          exp: growthConfig,
        })
      )
      xPos += cardWidth + padding
    })
  }
}
