import { Button } from '~/core/ui/Button'
import TeamMgmt, { PlayerAgentConfig, TeamConfig } from '~/scenes/TeamMgmt/TeamMgmt'
import { RoundConstants } from '~/utils/RoundConstants'
import { TradeAssetRow } from './TradeAssetRow'
import { TradeNegotiationScreen } from './TradeNegotationScreen'

export interface AddTradeAssetModalConfig {
  tradeNegotiationScreen: TradeNegotiationScreen
  onAddAsset: Function
}

export class AddTradeAssetModal {
  private scene: TeamMgmt
  private bgRect: Phaser.GameObjects.Rectangle
  private leftButton!: Phaser.GameObjects.Image
  private rightButton!: Phaser.GameObjects.Image
  private cancelButton!: Button
  private teamConfig!: TeamConfig
  private titleText: Phaser.GameObjects.Text
  private assetRows: TradeAssetRow[] = []
  private currPageIndex: number = 0
  private static PAGE_SIZE = 3
  private onAddAsset: Function = () => {}
  private tradeNegotiationScreen: TradeNegotiationScreen

  constructor(scene: TeamMgmt, config: AddTradeAssetModalConfig) {
    this.scene = scene
    this.onAddAsset = config.onAddAsset
    this.tradeNegotiationScreen = config.tradeNegotiationScreen
    this.bgRect = this.scene.add
      .rectangle(
        (RoundConstants.TEAM_MGMT_SIDEBAR_WIDTH + RoundConstants.WINDOW_WIDTH) / 2,
        RoundConstants.WINDOW_HEIGHT / 2,
        500,
        400,
        0xffffff
      )
      .setStrokeStyle(1, 0x000000)
      .setDepth(RoundConstants.SORT_LAYERS.Modal)
    this.cancelButton = new Button({
      scene: this.scene,
      x: this.bgRect.x + this.bgRect.displayWidth / 2 - 50,
      y: this.bgRect.y - this.bgRect.displayHeight / 2 + 25,
      width: 75,
      height: 25,
      text: 'Cancel',
      fontSize: '12px',
      strokeColor: 0x000000,
      strokeWidth: 1,
      backgroundColor: 0xffffff,
      depth: RoundConstants.SORT_LAYERS.Modal,
      onClick: () => {
        this.setVisible(false)
      },
    })
    this.titleText = this.scene.add.text(
      this.bgRect.x,
      this.bgRect.y - this.bgRect.displayHeight / 2 + 20,
      '',
      {
        fontSize: '25px',
        color: 'black',
      }
    )
    this.setupPaginationButton()
  }

  getRosterWithoutAddedAssets() {
    const addedAssets = this.tradeNegotiationScreen.getAddedAssetIds()
    return this.teamConfig.roster.filter((playerAgent: PlayerAgentConfig) => {
      return !addedAssets.has(playerAgent.id)
    })
  }

  updatePage(diff: number) {
    const roster = this.getRosterWithoutAddedAssets()
    this.currPageIndex += diff
    this.currPageIndex = Math.max(0, this.currPageIndex)
    if (roster.length > 0) {
      this.currPageIndex = Math.min(
        Math.ceil(roster.length / AddTradeAssetModal.PAGE_SIZE) - 1,
        this.currPageIndex
      )
    }
    this.hideOrDisplayPaginationButtons()
    const assetsOnCurrPage = roster.slice(
      this.currPageIndex * AddTradeAssetModal.PAGE_SIZE,
      this.currPageIndex * AddTradeAssetModal.PAGE_SIZE + AddTradeAssetModal.PAGE_SIZE
    )
    if (this.assetRows.length > 0) {
      this.assetRows.forEach((row) => {
        row.destroy()
      })
      this.assetRows = []
    }
    let yPos = this.titleText.y + this.titleText.displayHeight + 20
    assetsOnCurrPage.forEach((playerConfig: PlayerAgentConfig) => {
      const tradeAssetRow = new TradeAssetRow(this.scene, {
        width: this.bgRect.width - 30,
        height: 85,
        position: {
          x: this.bgRect.x - this.bgRect.displayWidth / 2 + 15,
          y: yPos,
        },
        playerConfig,
        onClickButton: () => {
          this.onAddAsset(playerConfig)
          this.updatePage(0)
        },
        depth: RoundConstants.SORT_LAYERS.Modal,
        shouldShowButton: true,
      })
      yPos += 100
      this.assetRows.push(tradeAssetRow)
    })
  }

  hideOrDisplayPaginationButtons() {
    if (this.leftButton && this.rightButton) {
      const roster = this.teamConfig.roster
      this.leftButton.setVisible(true)
      this.rightButton.setVisible(true)
      if (this.currPageIndex === 0) {
        this.leftButton.setVisible(false)
      }
      const lastPageIndex = Math.ceil(roster.length / AddTradeAssetModal.PAGE_SIZE) - 1
      if (this.currPageIndex === lastPageIndex) {
        this.rightButton.setVisible(false)
      }
    }
  }

  showModal(teamConfig: TeamConfig) {
    this.teamConfig = teamConfig
    this.titleText.setText(teamConfig.name)
    this.titleText
      .setPosition(
        this.bgRect.x - this.titleText.displayWidth / 2,
        this.bgRect.y - this.bgRect.displayHeight / 2 + 20
      )
      .setDepth(this.bgRect.depth + 15)
    this.setVisible(true)
    this.updatePage(0)
  }

  get isVisible() {
    return this.bgRect.visible
  }

  setVisible(isVisible: boolean) {
    this.bgRect.setVisible(isVisible)
    this.leftButton.setVisible(isVisible)
    this.rightButton.setVisible(isVisible)
    this.cancelButton.setVisible(isVisible)
    this.titleText.setVisible(isVisible)
    this.assetRows.forEach((assetRow: TradeAssetRow) => {
      assetRow.setVisible(isVisible)
    })
  }

  setupPaginationButton() {
    this.leftButton = this.scene.add
      .image(
        this.bgRect.x - this.bgRect.displayWidth / 2 + 15,
        this.bgRect.y + this.bgRect.displayHeight / 2 - 15,
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
      .setDepth(RoundConstants.SORT_LAYERS.Modal)
    this.rightButton = this.scene.add
      .image(
        this.bgRect.x + this.bgRect.displayWidth / 2 - 15,
        this.bgRect.y + this.bgRect.displayHeight / 2 - 15,
        'forward'
      )
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
      .setDepth(RoundConstants.SORT_LAYERS.Modal)
  }
}
