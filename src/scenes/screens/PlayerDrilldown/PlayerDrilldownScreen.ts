import { Button } from '~/core/ui/Button'
import TeamMgmt, { PlayerAgentConfig } from '../../TeamMgmt'
import { Screen } from '../Screen'
import { RoundConstants } from '~/utils/RoundConstants'
import { ScreenKeys } from '../ScreenKeys'
import { Utilities } from '~/utils/Utilities'
import { PlayerAttributesTab } from './tabs/PlayerAttributesTab'

export class PlayerDrilldownScreen implements Screen {
  private scene: TeamMgmt
  private playerConfig!: PlayerAgentConfig
  private backButton: Button
  private playerNameText: Phaser.GameObjects.Text
  private playerImage: Phaser.GameObjects.Image
  private playerRankText: Phaser.GameObjects.Text

  private playerAttributesTab: PlayerAttributesTab | null = null

  constructor(scene: TeamMgmt) {
    this.scene = scene
    this.backButton = new Button({
      scene: this.scene,
      text: 'Back',
      onClick: () => {
        this.scene.renderActiveScreen(ScreenKeys.TEAM)
      },
      fontSize: '15px',
      x: RoundConstants.TEAM_MGMT_SIDEBAR_WIDTH + 40,
      y: 25,
      width: 50,
      height: 25,
    })
    this.playerImage = this.scene.add
      .image(RoundConstants.TEAM_MGMT_SIDEBAR_WIDTH + 20, 60, '')
      .setOrigin(0)
    this.playerImage.setDisplaySize(100, 100)
    this.playerNameText = this.scene.add
      .text(
        RoundConstants.TEAM_MGMT_SIDEBAR_WIDTH + this.playerImage.displayWidth + 40,
        60 + this.playerImage.displayHeight / 4,
        '',
        {
          fontSize: '40px',
          color: 'black',
        }
      )
      .setOrigin(0)
    this.playerRankText = this.scene.add
      .text(RoundConstants.WINDOW_WIDTH - 20, this.playerNameText.y, '', {
        fontSize: '20px',
        color: 'black',
      })
      .setOrigin(1, 0)
    this.setVisible(false)
  }

  onRender(data?: any): void {
    this.playerConfig = data
    this.playerNameText.setText(`${this.playerConfig.name}`)
    const overallRank = Utilities.getRankNameForEnum(Utilities.getOverallRank(this.playerConfig))
    if (!this.playerAttributesTab) {
      this.playerAttributesTab = new PlayerAttributesTab(this.scene, {
        playerConfig: this.playerConfig,
        position: {
          x: RoundConstants.TEAM_MGMT_SIDEBAR_WIDTH + 25,
          y: this.playerImage.y + this.playerImage.displayHeight + 50,
        },
      })
    } else {
      this.playerAttributesTab.updatePlayerConfig(this.playerConfig)
    }
    this.playerRankText.setText(`${overallRank}`)
  }

  setVisible(isVisible: boolean): void {
    this.backButton.setVisible(isVisible)
    this.playerNameText.setVisible(isVisible)
    this.playerImage.setVisible(isVisible)
    this.playerRankText.setVisible(isVisible)
    if (this.playerAttributesTab) {
      this.playerAttributesTab.setVisible(isVisible)
    }
  }
}
