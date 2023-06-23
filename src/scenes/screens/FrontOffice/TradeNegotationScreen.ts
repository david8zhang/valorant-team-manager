import TeamMgmt, { TeamConfig } from '~/scenes/TeamMgmt'
import { Screen } from '../Screen'
import { RoundConstants } from '~/utils/RoundConstants'
import { Button } from '~/core/ui/Button'

export interface TradeNegotiationScreenData {
  teamToTradeWith: TeamConfig
}

export class TradeNegotiationScreen implements Screen {
  private scene: TeamMgmt
  private teamToTradeWith!: TeamConfig

  private playerAssetRect!: Phaser.GameObjects.Rectangle
  private cpuAssetRect!: Phaser.GameObjects.Rectangle
  private playerTeamTitleText!: Phaser.GameObjects.Text
  private cpuTeamTitleText!: Phaser.GameObjects.Text
  private playerAddAssetButton!: Button
  private cpuAddAssetButton!: Button

  constructor(scene: TeamMgmt) {
    this.scene = scene
    this.setVisible(false)
  }

  setupAssetListWindows() {
    if (this.playerAssetRect) {
      this.playerAssetRect.destroy()
    }
    if (this.cpuAssetRect) {
      this.cpuAssetRect.destroy()
    }
    if (this.playerTeamTitleText) {
      this.playerTeamTitleText.destroy()
    }
    if (this.cpuTeamTitleText) {
      this.cpuTeamTitleText.destroy()
    }

    const totalWidth = RoundConstants.WINDOW_WIDTH - RoundConstants.TEAM_MGMT_SIDEBAR_WIDTH - 45
    this.playerAssetRect = this.scene.add
      .rectangle(
        RoundConstants.TEAM_MGMT_SIDEBAR_WIDTH + 15,
        75,
        totalWidth / 2,
        RoundConstants.WINDOW_HEIGHT - 90,
        0xffffff
      )
      .setStrokeStyle(1, 0x000000)
      .setOrigin(0)
    this.cpuAssetRect = this.scene.add
      .rectangle(
        this.playerAssetRect.x + totalWidth / 2 + 15,
        75,
        totalWidth / 2,
        RoundConstants.WINDOW_HEIGHT - 90,
        0xffffff
      )
      .setStrokeStyle(1, 0x000000)
      .setOrigin(0)

    this.playerTeamTitleText = this.scene.add.text(this.playerAssetRect.x, 40, 'My Team', {
      fontSize: '20px',
      color: 'black',
    })
    this.cpuTeamTitleText = this.scene.add.text(
      this.cpuAssetRect.x,
      40,
      `${this.teamToTradeWith.name}`,
      {
        fontSize: '20px',
        color: 'black',
      }
    )

    this.playerAddAssetButton = new Button({
      scene: this.scene,
      x: this.playerAssetRect.x + this.playerAssetRect.displayWidth - 40,
      y: this.playerTeamTitleText.y + 12,
      width: 80,
      height: 25,
      text: 'Add Asset',
      strokeColor: 0x000000,
      strokeWidth: 1,
      onClick: () => {},
    })

    this.cpuAddAssetButton = new Button({
      scene: this.scene,
      x: this.cpuAssetRect.x + this.cpuAssetRect.displayWidth - 40,
      y: this.cpuTeamTitleText.y + 12,
      width: 80,
      height: 25,
      text: 'Add Asset',
      strokeColor: 0x000000,
      strokeWidth: 1,
      onClick: () => {},
    })
  }

  setVisible(isVisible: boolean): void {
    if (this.playerAssetRect) {
      this.playerAssetRect.setVisible(isVisible)
    }
    if (this.cpuAssetRect) {
      this.cpuAssetRect.setVisible(isVisible)
    }
    if (this.playerTeamTitleText) {
      this.playerTeamTitleText.setVisible(isVisible)
    }
    if (this.cpuTeamTitleText) {
      this.cpuTeamTitleText.setVisible(isVisible)
    }
    if (this.playerAddAssetButton) {
      this.playerAddAssetButton.setVisible(isVisible)
    }
    if (this.cpuAddAssetButton) {
      this.cpuAddAssetButton.setVisible(isVisible)
    }
  }

  onRender(data?: any): void {
    if (data) {
      this.teamToTradeWith = data.teamToTradeWith
      this.setupAssetListWindows()
    }
  }
}
