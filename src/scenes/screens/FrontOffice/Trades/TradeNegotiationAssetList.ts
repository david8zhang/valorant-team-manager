import { Button } from '~/core/ui/Button'
import TeamMgmt, { PlayerAgentConfig, TeamConfig } from '~/scenes/TeamMgmt'
import { RoundConstants } from '~/utils/RoundConstants'
import { TradeAssetRow } from './TradeAssetRow'
import { Utilities } from '~/utils/Utilities'
import { TradeNegotiationScreen } from './TradeNegotationScreen'
import { Save, SaveKeys } from '~/utils/Save'
import { Side } from '~/core/Agent'

export interface TradeNegotiationAssetListConfig {
  position: {
    x: number
    y: number
  }
  width: number
  height: number
  teamName: string
  onAddAsset: Function
  onRemoveAsset: Function
  negotiationScreen: TradeNegotiationScreen
  teamConfig: TeamConfig
}

export class TradeNegotiationAssetList {
  private scene: TeamMgmt
  private assetRect!: Phaser.GameObjects.Rectangle
  private titleText!: Phaser.GameObjects.Text

  // Total trade value text
  private totalTradeValueLabelText!: Phaser.GameObjects.Text
  private totalTradeValueText!: Phaser.GameObjects.Text

  // Salary after trade text
  private salaryAfterTradeLabel!: Phaser.GameObjects.Text
  private salaryAfterTradeValueText!: Phaser.GameObjects.Text
  private salaryCapStatusText!: Phaser.GameObjects.Text

  private addAssetButton: Button
  private onRemoveAsset: Function
  private currPageIndex: number = 0
  private static PAGE_SIZE: number = 4

  private leftButton!: Phaser.GameObjects.Image
  private rightButton!: Phaser.GameObjects.Image
  public assetList: PlayerAgentConfig[] = []
  private assetListRow: TradeAssetRow[] = []
  private negotiationScreen: TradeNegotiationScreen
  private teamConfig: TeamConfig

  constructor(scene: TeamMgmt, config: TradeNegotiationAssetListConfig) {
    this.scene = scene
    this.negotiationScreen = config.negotiationScreen
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
    this.onRemoveAsset = config.onRemoveAsset
    this.teamConfig = config.teamConfig
    this.setupTotalTradeValueText()
    this.setupSalaryAfterTradeText()
    this.setupPaginationButton()
    this.updatePage(0)
  }

  setupSalaryAfterTradeText() {
    const salaryAfterTrade = this.getSalaryAfterTrade()
    const salaryCapDiff = RoundConstants.SALARY_CAP - salaryAfterTrade

    this.salaryAfterTradeLabel = this.scene.add.text(
      this.assetRect.x + 15,
      this.totalTradeValueLabelText.y + this.totalTradeValueLabelText.displayHeight + 10,
      `Salary after trade: `,
      {
        fontSize: '14px',
        color: 'black',
      }
    )
    this.salaryCapStatusText = this.scene.add
      .text(
        this.assetRect.x + this.assetRect.displayWidth - 15,
        this.salaryAfterTradeLabel.y,
        `(${salaryCapDiff})`,
        {
          fontSize: '16px',
          color: salaryCapDiff > 0 ? 'green' : 'red',
        }
      )
      .setOrigin(1, 0)
    this.salaryAfterTradeValueText = this.scene.add
      .text(
        this.salaryCapStatusText.x - this.salaryCapStatusText.displayWidth - 5,
        this.salaryAfterTradeLabel.y,
        `$${this.getSalaryAfterTrade()}M`,
        {
          fontSize: '16px',
          color: 'black',
        }
      )
      .setOrigin(1, 0)
  }

  getSalaryAfterTrade() {
    const proposedTrade = this.negotiationScreen.getProposedTrade()
    const side =
      this.teamConfig.name === Save.getData(SaveKeys.PLAYER_TEAM_NAME) ? Side.PLAYER : Side.CPU
    const assetsToReceive =
      side === Side.CPU ? proposedTrade.cpuToReceive : proposedTrade.playerToReceive
    const assetsToSend =
      side === Side.CPU ? proposedTrade.playerToReceive : proposedTrade.cpuToReceive
    const assetsToSendIds = new Set(assetsToSend.map((config) => config.id))
    const rosterAfterTrade = this.teamConfig.roster
      .concat(assetsToReceive)
      .filter((agentConfig) => {
        return !assetsToSendIds.has(agentConfig.id)
      })
    return rosterAfterTrade.reduce((acc, curr) => {
      return curr.contract.salary + acc
    }, 0)
  }

  setupTotalTradeValueText() {
    this.totalTradeValueLabelText = this.scene.add.text(
      this.assetRect.x + 15,
      this.assetRect.y + 15,
      `Total trade value:`,
      {
        fontSize: '14px',
        color: 'black',
      }
    )
    this.totalTradeValueText = this.scene.add
      .text(
        this.assetRect.x + this.assetRect.displayWidth - 15,
        this.assetRect.y + 10,
        `★${this.getTotalTradeValue()}`,
        {
          fontSize: '18px',
          color: 'black',
        }
      )
      .setOrigin(1, 0)
  }

  updateSalaryAfterTradeValueText() {
    const salaryAfterTrade = this.getSalaryAfterTrade()
    const salaryCapDiff = RoundConstants.SALARY_CAP - salaryAfterTrade
    this.salaryCapStatusText.setText(`(${salaryCapDiff})`)
    this.salaryAfterTradeValueText
      .setText(`$${this.getSalaryAfterTrade()}M`)
      .setPosition(
        this.salaryCapStatusText.x - this.salaryCapStatusText.displayWidth - 5,
        this.salaryAfterTradeLabel.y
      )
  }

  getTotalTradeValue() {
    return this.assetList.reduce((acc, curr) => {
      return Utilities.getTradeValue(curr) + acc
    }, 0)
  }

  addAsset(playerConfig: PlayerAgentConfig) {
    this.assetList.push(playerConfig)
    const lastPage =
      this.assetList.length > TradeNegotiationAssetList.PAGE_SIZE
        ? Math.ceil(this.assetList.length / TradeNegotiationAssetList.PAGE_SIZE) - 1
        : 0
    this.updatePage(lastPage)
    this.totalTradeValueText.setText(`★${this.getTotalTradeValue()}`)
  }

  removeAsset(playerConfig: PlayerAgentConfig) {
    this.assetList = this.assetList.filter((config) => {
      return config.id !== playerConfig.id
    })
    this.updatePage(0)
    this.totalTradeValueText.setText(`★${this.getTotalTradeValue()}`)
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
    let yPos = this.titleText.y + this.titleText.displayHeight + 90
    assetsOnCurrPage.forEach((playerConfig: PlayerAgentConfig) => {
      const tradeAssetRow = new TradeAssetRow(this.scene, {
        playerConfig,
        position: {
          x: this.assetRect.x + 15,
          y: yPos,
        },
        width: this.assetRect.displayWidth - 30,
        height: 75,
        onClickButton: () => {
          this.removeAsset(playerConfig)
          this.onRemoveAsset()
        },
        shouldShowButton: true,
        buttonText: 'Remove',
        depth: RoundConstants.SORT_LAYERS.UI,
      })
      yPos += 85
      this.assetListRow.push(tradeAssetRow)
    })
  }

  setupPaginationButton() {
    this.leftButton = this.scene.add
      .image(
        this.assetRect.x + 15,
        this.assetRect.y + this.assetRect.displayHeight - 15,
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
      .image(
        this.assetRect.x + this.assetRect.displayWidth - 15,
        this.assetRect.y + this.assetRect.displayHeight - 15,
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
  }

  hideOrDisplayPaginationButtons() {
    if (this.leftButton && this.rightButton) {
      this.leftButton.setVisible(true)
      this.rightButton.setVisible(true)
      if (this.currPageIndex === 0) {
        this.leftButton.setVisible(false)
      }
      const lastPageIndex =
        Math.ceil(this.assetList.length / TradeNegotiationAssetList.PAGE_SIZE) - 1
      if (
        this.assetList.length <= TradeNegotiationAssetList.PAGE_SIZE ||
        this.currPageIndex === lastPageIndex
      ) {
        this.rightButton.setVisible(false)
      }
    }
  }

  setVisible(isVisible: boolean) {
    this.assetRect.setVisible(isVisible)
    this.titleText.setVisible(isVisible)
    this.addAssetButton.setVisible(isVisible)
    this.leftButton.setVisible(isVisible)
    this.rightButton.setVisible(isVisible)
    this.totalTradeValueLabelText.setVisible(isVisible)
    this.totalTradeValueText.setVisible(isVisible)
    this.salaryAfterTradeLabel.setVisible(isVisible)
    this.salaryAfterTradeValueText.setVisible(isVisible)
    this.salaryCapStatusText.setVisible(isVisible)
    this.assetListRow.forEach((row) => {
      row.setVisible(isVisible)
    })
  }

  destroy() {
    this.assetRect.destroy()
    this.titleText.destroy()
    this.addAssetButton.destroy()
    this.leftButton.destroy()
    this.rightButton.destroy()
    this.totalTradeValueLabelText.destroy()
    this.totalTradeValueText.destroy()
    this.salaryAfterTradeLabel.destroy()
    this.salaryAfterTradeValueText.destroy()
    this.salaryCapStatusText.destroy()
    this.assetListRow.forEach((row) => {
      row.destroy()
    })
  }
}
