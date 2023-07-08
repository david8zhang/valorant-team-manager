import { Button } from '~/core/ui/Button'
import TeamMgmt, { PlayerAgentConfig } from '~/scenes/TeamMgmt'
import { PlayerRank } from '~/utils/PlayerConstants'
import { Utilities } from '~/utils/Utilities'
import { ScreenKeys } from '../../ScreenKeys'
import { PlayerDrilldownScreenConfig } from '../../PlayerDrilldown/PlayerDrilldownScreen'

export interface TradeAssetRowConfig {
  position: {
    x: number
    y: number
  }
  width: number
  height: number
  playerConfig: PlayerAgentConfig
  depth: number
  onClickButton: Function
  shouldShowButton: boolean
  buttonText?: string
}

export class TradeAssetRow {
  private scene: TeamMgmt
  private _playerConfig: PlayerAgentConfig
  public bgRect: Phaser.GameObjects.Rectangle
  private playerContractAmtText: Phaser.GameObjects.Text
  private playerContractDurationText: Phaser.GameObjects.Text
  private playerNameText: Phaser.GameObjects.Text
  private playerOvrText: Phaser.GameObjects.Text
  private playerImage: Phaser.GameObjects.Image
  private tradeValueText: Phaser.GameObjects.Text
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
        this.playerImage.x + this.playerImage.displayWidth + 10,
        this.playerImage.y + 5,
        `${config.playerConfig.name}`,
        {
          fontSize: '15px',
          color: 'blue',
          fontStyle: 'bold',
        }
      )
      .setOrigin(0)
      .setDepth(config.depth)
      .setInteractive({ useHandCursor: true })
      .on(Phaser.Input.Events.POINTER_DOWN, () => {
        const screenConfig: PlayerDrilldownScreenConfig = {
          playerConfig: config.playerConfig,
        }
        this.scene.renderActiveScreen(ScreenKeys.PLAYER_DRILLDOWN, screenConfig)
      })

    const overallRank = Utilities.getOverallPlayerRank(config.playerConfig) as PlayerRank
    const overallRankStr = Utilities.getAbbrevRankNameForEnum(overallRank)
    this.playerOvrText = this.scene.add
      .text(
        this.playerNameText.x,
        this.playerNameText.y + this.playerNameText.displayHeight + 5,
        `${overallRankStr}/`,
        {
          fontSize: '15px',
          color: 'black',
        }
      )
      .setOrigin(0)
      .setDepth(config.depth)

    this.playerContractAmtText = this.scene.add
      .text(
        this.playerOvrText.x + this.playerOvrText.displayWidth,
        this.playerOvrText.y,
        `$${this.playerConfig.contract.salary}M/`,
        {
          fontSize: '15px',
          color: 'black',
        }
      )
      .setOrigin(0)
      .setDepth(config.depth)

    this.playerContractDurationText = this.scene.add
      .text(
        this.playerContractAmtText.x + this.playerContractAmtText.displayWidth,
        this.playerOvrText.y,
        `${this.playerConfig.contract.duration}Yrs.`,
        {
          fontSize: '15px',
          color: 'black',
        }
      )
      .setOrigin(0)
      .setDepth(config.depth)

    const tradeValue = Utilities.getTradeValue(config.playerConfig)
    this.tradeValueText = this.scene.add
      .text(
        this.playerOvrText.x,
        this.playerOvrText.y + this.playerOvrText.displayHeight + 5,
        `★${tradeValue}`,
        {
          fontSize: '15px',
          color: 'black',
        }
      )
      .setDepth(config.depth)
      .setOrigin(0)

    this.addAssetButton = new Button({
      scene: this.scene,
      x: this.bgRect.x + this.bgRect.displayWidth - 35,
      y: this.bgRect.y + this.bgRect.displayHeight / 2,
      width: 50,
      height: 25,
      text: config.buttonText ? config.buttonText : 'Add',
      strokeWidth: 1,
      strokeColor: 0x000000,
      backgroundColor: 0xffffff,
      fontSize: '10px',
      onClick: () => {
        config.onClickButton(this._playerConfig)
      },
      depth: config.depth,
    })

    this.shouldShowAddAssetButton = config.shouldShowButton
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
    this.tradeValueText.setVisible(isVisible)
    this.playerContractAmtText.setVisible(isVisible)
    this.playerContractDurationText.setVisible(isVisible)
  }

  destroy() {
    this.playerNameText.destroy()
    this.playerOvrText.destroy()
    this.addAssetButton.destroy()
    this.bgRect.destroy()
    this.playerImage.destroy()
    this.tradeValueText.destroy()
    this.playerContractAmtText.destroy()
    this.playerContractDurationText.destroy()
  }
}
