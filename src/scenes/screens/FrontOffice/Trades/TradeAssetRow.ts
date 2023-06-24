import { Button } from '~/core/ui/Button'
import TeamMgmt, { PlayerAgentConfig } from '~/scenes/TeamMgmt'
import { PlayerRank } from '~/utils/PlayerConstants'
import { Utilities } from '~/utils/Utilities'

export interface TradeAssetRowConfig {
  position: {
    x: number
    y: number
  }
  width: number
  height: number
  playerConfig: PlayerAgentConfig
  onAddAsset: Function
  depth: number
  shouldShowAddAssetButton: boolean
}

export class TradeAssetRow {
  private scene: TeamMgmt
  private _playerConfig: PlayerAgentConfig
  public bgRect: Phaser.GameObjects.Rectangle
  private playerNameText: Phaser.GameObjects.Text
  private playerOvrText: Phaser.GameObjects.Text
  private playerImage: Phaser.GameObjects.Image
  private addAssetButton: Button
  private shouldShowAddAssetButton: boolean = false

  constructor(scene: TeamMgmt, config: TradeAssetRowConfig) {
    this.scene = scene
    this._playerConfig = config.playerConfig
    this.bgRect = this.scene.add
      .rectangle(config.position.x, config.position.y, config.width, config.height, 0xffffff)
      .setStrokeStyle(1, 0x000000)
      .setDepth(config.depth)
      .setOrigin(0)

    const playerImageSize = this.bgRect.displayHeight - 10
    this.playerImage = this.scene.add
      .image(this.bgRect.x + 5, this.bgRect.y + 5, '')
      .setOrigin(0)
      .setDisplaySize(playerImageSize, playerImageSize)
      .setDepth(config.depth)
    this.playerNameText = this.scene.add
      .text(
        this.playerImage.x + this.playerImage.displayWidth + 15,
        this.playerImage.y + 10,
        `${config.playerConfig.name}`,
        {
          fontSize: '15px',
          color: 'black',
        }
      )
      .setOrigin(0)
      .setDepth(config.depth)

    const overallRank = Utilities.getOverallPlayerRank(config.playerConfig) as PlayerRank
    const overallRankStr = Utilities.getRankNameForEnum(overallRank)
    this.playerOvrText = this.scene.add
      .text(
        this.playerNameText.x,
        this.playerNameText.y + this.playerNameText.displayHeight + 5,
        `${overallRankStr}`,
        {
          fontSize: '15px',
          color: 'black',
        }
      )
      .setOrigin(0)
      .setDepth(config.depth)

    this.addAssetButton = new Button({
      scene: this.scene,
      x: this.bgRect.x + this.bgRect.displayWidth - 50,
      y: this.bgRect.y + this.bgRect.displayHeight / 2,
      width: 75,
      height: 30,
      text: 'Add',
      strokeWidth: 1,
      strokeColor: 0x000000,
      backgroundColor: 0xffffff,
      fontSize: '12px',
      onClick: () => {
        config.onAddAsset(this._playerConfig)
      },
      depth: config.depth,
    })

    this.shouldShowAddAssetButton = config.shouldShowAddAssetButton
    if (!this.shouldShowAddAssetButton) {
      this.addAssetButton.setVisible(false)
    }
  }

  public get playerConfig() {
    return this._playerConfig
  }

  setVisible(isVisible: boolean) {
    this.playerNameText.setVisible(isVisible)
    this.playerOvrText.setVisible(isVisible)
    this.addAssetButton.setVisible(this.shouldShowAddAssetButton && isVisible)
    this.bgRect.setVisible(isVisible)
    this.playerImage.setVisible(isVisible)
  }

  destroy() {
    this.playerNameText.destroy()
    this.playerOvrText.destroy()
    this.addAssetButton.destroy()
    this.bgRect.destroy()
    this.playerImage.destroy()
  }
}
