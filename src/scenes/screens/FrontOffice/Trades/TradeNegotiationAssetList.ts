import { Button } from '~/core/ui/Button'
import TeamMgmt, { PlayerAgentConfig } from '~/scenes/TeamMgmt'
import { RoundConstants } from '~/utils/RoundConstants'
import { TradeAssetRow } from './TradeAssetRow'

export interface TradeNegotiationAssetListConfig {
  position: {
    x: number
    y: number
  }
  width: number
  height: number
  teamName: string
  onAddAsset: Function
}

export class TradeNegotiationAssetList {
  private scene: TeamMgmt
  private assetRect!: Phaser.GameObjects.Rectangle
  private titleText!: Phaser.GameObjects.Text
  private addAssetButton: Button
  private currPageIndex: number = 0
  private static PAGE_SIZE: number = 5

  private leftButton!: Phaser.GameObjects.Image
  private rightButton!: Phaser.GameObjects.Image
  public assetList: PlayerAgentConfig[] = []
  private assetListRow: TradeAssetRow[] = []

  constructor(scene: TeamMgmt, config: TradeNegotiationAssetListConfig) {
    this.scene = scene
    this.assetRect = this.scene.add
      .rectangle(config.position.x, config.position.y, config.width, config.height, 0xffffff)
      .setStrokeStyle(1, 0x000000)
      .setOrigin(0)
    this.titleText = this.scene.add.text(
      this.assetRect.x,
      this.assetRect.y - 35,
      `${config.teamName}`,
      {
        fontSize: '20px',
        color: 'black',
      }
    )
    this.addAssetButton = new Button({
      scene: this.scene,
      x: this.assetRect.x + this.assetRect.displayWidth - 40,
      y: this.titleText.y + 12,
      width: 80,
      height: 25,
      text: 'Add Asset',
      strokeColor: 0x000000,
      strokeWidth: 1,
      onClick: () => {
        config.onAddAsset()
      },
    })
  }

  addAsset(playerConfig: PlayerAgentConfig) {
    this.assetList.push(playerConfig)
    const lastPage =
      this.assetList.length > TradeNegotiationAssetList.PAGE_SIZE
        ? Math.ceil(this.assetList.length / TradeNegotiationAssetList.PAGE_SIZE) - 1
        : 0
    this.updatePage(lastPage)
  }

  updatePage(diff: number) {
    this.currPageIndex += diff
    this.currPageIndex = Math.max(0, this.currPageIndex)
    if (this.currPageIndex > 0) {
      this.currPageIndex = Math.min(
        Math.ceil(this.assetList.length / TradeNegotiationAssetList.PAGE_SIZE) - 1,
        this.currPageIndex
      )
    }
    this.hideOrDisplayPaginationButtons()
    if (this.assetListRow.length > 0) {
      this.assetListRow.forEach((row) => {
        row.destroy()
      })
      this.assetListRow = []
    }
    const assetsOnCurrPage = this.assetList.slice(
      this.currPageIndex * TradeNegotiationAssetList.PAGE_SIZE,
      this.currPageIndex * TradeNegotiationAssetList.PAGE_SIZE + TradeNegotiationAssetList.PAGE_SIZE
    )

    let yPos = this.titleText.y + this.titleText.displayHeight + 30
    assetsOnCurrPage.forEach((playerConfig: PlayerAgentConfig) => {
      const tradeAssetRow = new TradeAssetRow(this.scene, {
        playerConfig,
        shouldShowAddAssetButton: false,
        position: {
          x: this.assetRect.x + 15,
          y: yPos,
        },
        width: this.assetRect.displayWidth - 30,
        height: 75,
        onAddAsset: () => {},
        depth: RoundConstants.SORT_LAYERS.UI,
      })
      yPos += 80
      this.assetListRow.push(tradeAssetRow)
    })
  }

  setupPaginationButton() {
    this.leftButton = this.scene.add
      .image(
        RoundConstants.TEAM_MGMT_SIDEBAR_WIDTH + 20,
        RoundConstants.WINDOW_HEIGHT - 20,
        'backward'
      )
      .setScale(0.5)
      .setInteractive()
      .on(Phaser.Input.Events.POINTER_DOWN, () => {
        this.leftButton.setAlpha(0.5)
      })
      .on(Phaser.Input.Events.POINTER_DOWN_OUTSIDE, () => {
        this.updatePage(-1)
        this.leftButton.setAlpha(1)
      })
      .on(Phaser.Input.Events.POINTER_UP, () => {
        this.updatePage(-1)
        this.leftButton.setAlpha(1)
      })
      .on(Phaser.Input.Events.POINTER_UP_OUTSIDE, () => {
        this.updatePage(-1)
        this.leftButton.setAlpha(1)
      })

    this.rightButton = this.scene.add
      .image(RoundConstants.WINDOW_WIDTH - 20, RoundConstants.WINDOW_HEIGHT - 20, 'forward')
      .setScale(0.5)
      .setInteractive()
      .on(Phaser.Input.Events.POINTER_DOWN, () => {
        this.rightButton.setAlpha(0.5)
      })
      .on(Phaser.Input.Events.POINTER_DOWN_OUTSIDE, () => {
        this.updatePage(1)
        this.rightButton.setAlpha(1)
      })
      .on(Phaser.Input.Events.POINTER_UP, () => {
        this.updatePage(1)
        this.rightButton.setAlpha(1)
      })
      .on(Phaser.Input.Events.POINTER_UP_OUTSIDE, () => {
        this.updatePage(1)
        this.rightButton.setAlpha(1)
      })
  }

  hideOrDisplayPaginationButtons() {
    if (this.leftButton && this.rightButton) {
      this.leftButton.setVisible(true)
      this.rightButton.setVisible(true)
      if (this.currPageIndex === 0) {
        this.leftButton.setVisible(false)
      }
      const lastPageIndex =
        Math.round(this.assetListRow.length / TradeNegotiationAssetList.PAGE_SIZE) - 1
      if (this.currPageIndex === lastPageIndex) {
        this.rightButton.setVisible(false)
      }
    }
  }

  setVisible(isVisible: boolean) {
    this.assetRect.setVisible(isVisible)
    this.titleText.setVisible(isVisible)
    this.addAssetButton.setVisible(isVisible)
  }

  destroy() {
    this.assetRect.destroy()
    this.titleText.destroy()
    this.addAssetButton.destroy()
  }
}
