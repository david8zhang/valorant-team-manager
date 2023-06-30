import { Button } from '~/core/ui/Button'
import TeamMgmt, { PlayerAgentConfig } from '../../TeamMgmt'
import { Screen } from '../Screen'
import { RoundConstants } from '~/utils/RoundConstants'
import { Utilities } from '~/utils/Utilities'
import { PlayerAttributesTab } from './tabs/PlayerAttributesTab'

export class PlayerDrilldownScreen implements Screen {
  private scene: TeamMgmt
  private playerConfig!: PlayerAgentConfig
  private backButton: Button
  private playerNameText: Phaser.GameObjects.Text
  private playerImage: Phaser.GameObjects.Image
  private playerRankText: Phaser.GameObjects.Text
  private playerPotentialText: Phaser.GameObjects.Text
  private playerContractAmountText: Phaser.GameObjects.Text

  private playerAttributesTab: PlayerAttributesTab | null = null

  constructor(scene: TeamMgmt) {
    this.scene = scene
    this.backButton = new Button({
      scene: this.scene,
      text: 'Back',
      onClick: () => {
        this.scene.goBackToPreviousScreen()
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
          fontSize: '30px',
          color: 'black',
        }
      )
      .setOrigin(0)

    this.playerPotentialText = this.scene.add.text(
      this.playerNameText.x,
      this.playerNameText.y + this.playerNameText.displayHeight + 15,
      '',
      {
        fontSize: '15px',
        color: 'black',
      }
    )

    this.playerContractAmountText = this.scene.add.text(
      this.playerPotentialText.x + this.playerPotentialText.displayWidth + 15,
      this.playerPotentialText.y,
      '',
      {
        fontSize: '15px',
        color: 'black',
      }
    )

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
    this.playerPotentialText.setText(`Potential: ${this.playerConfig.potential}`)
    this.playerContractAmountText
      .setText(
        `Contract: $${this.playerConfig.contract.salary}M/${this.playerConfig.contract.duration}Yrs.`
      )
      .setPosition(
        this.playerPotentialText.x + this.playerPotentialText.displayWidth + 15,
        this.playerPotentialText.y
      )

    const overallRank = Utilities.getRankNameForEnum(
      Utilities.getOverallPlayerRank(this.playerConfig)
    )
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
    this.playerPotentialText.setVisible(isVisible)
    this.playerContractAmountText.setVisible(isVisible)
    if (this.playerAttributesTab) {
      this.playerAttributesTab.setVisible(isVisible)
    }
  }
}
