import TeamMgmt, { PlayerAgentConfig, TeamConfig } from '../TeamMgmt'
import { Screen } from './Screen'
import { PlayerAttrRow } from '~/core/ui/PlayerAttrRow'
import { RoundConstants } from '~/utils/RoundConstants'
import { Button } from '~/core/ui/Button'
import { ScreenKeys } from './ScreenKeys'
import { TradeNegotiationScreenData } from './FrontOffice/Trades/TradeNegotationScreen'

export interface RosterScreenData {
  teamToRender: TeamConfig
  shouldShowTradeButton: boolean
  shouldShowBackButton: boolean
  titleText: string
}

export class RosterScreen implements Screen {
  private scene: TeamMgmt
  private agentTableRowStats: PlayerAttrRow[] = []
  private titleText: Phaser.GameObjects.Text
  private teamConfig!: TeamConfig
  private tradeButton!: Button
  private backButton!: Phaser.GameObjects.Image

  constructor(scene: TeamMgmt) {
    this.scene = scene
    this.titleText = this.scene.add.text(
      RoundConstants.TEAM_MGMT_SIDEBAR_WIDTH + 40,
      22,
      'Your Roster',
      {
        fontSize: '25px',
        color: 'black',
      }
    )
    this.setupTradeButton()
    this.setupBackButton()
    this.setVisible(false)
  }

  setupTradeButton() {
    this.tradeButton = new Button({
      scene: this.scene,
      x: RoundConstants.WINDOW_WIDTH - 75,
      y: 35,
      width: 120,
      height: 40,
      text: 'Trade',
      fontSize: '15px',
      strokeWidth: 1,
      strokeColor: 0x000000,
      backgroundColor: 0xffffff,
      onClick: () => {
        const tradeNegotiationData: TradeNegotiationScreenData = {
          teamToTradeWith: this.teamConfig,
        }
        this.scene.renderActiveScreen(ScreenKeys.TRADE_NEGOTIATION, tradeNegotiationData)
      },
    })
  }

  setupBackButton() {
    this.backButton = this.scene.add
      .image(RoundConstants.TEAM_MGMT_SIDEBAR_WIDTH + 20, 35, 'backward')
      .setScale(0.5)
      .setInteractive()
      .on(Phaser.Input.Events.POINTER_DOWN, () => {
        this.backButton.setAlpha(0.5)
      })
      .on(Phaser.Input.Events.POINTER_DOWN_OUTSIDE, () => {
        this.scene.goBackToPreviousScreen()
        this.backButton.setAlpha(1)
      })
      .on(Phaser.Input.Events.POINTER_UP, () => {
        this.scene.goBackToPreviousScreen()
        this.backButton.setAlpha(1)
      })
      .on(Phaser.Input.Events.POINTER_UP_OUTSIDE, () => {
        this.scene.goBackToPreviousScreen()
        this.backButton.setAlpha(1)
      })
  }

  setupPlayerStats(teamToRender: TeamConfig) {
    if (this.agentTableRowStats.length > 0) {
      this.agentTableRowStats.forEach((row: PlayerAttrRow) => {
        row.destroy()
      })
      this.agentTableRowStats = []
    }
    let yPos = 125
    teamToRender.roster.forEach((config: PlayerAgentConfig, index: number) => {
      const agentTableRowStat = new PlayerAttrRow(this.scene, {
        name: config.name,
        attributes: config.attributes,
        isHeader: index === 0,
        position: {
          x: RoundConstants.TEAM_MGMT_SIDEBAR_WIDTH + 15,
          y: yPos,
        },
        buttonConfig: {
          text: 'Show Stats',
          shouldShow: true,
          onClick: () => {
            this.scene.renderActiveScreen(ScreenKeys.PLAYER_DRILLDOWN, config)
          },
        },
      })
      this.agentTableRowStats.push(agentTableRowStat)
      yPos += 40
    })
  }

  setVisible(isVisible: boolean): void {
    this.titleText.setVisible(isVisible)
    this.agentTableRowStats.forEach((stats: PlayerAttrRow) => {
      stats.setVisible(isVisible)
    })
    this.backButton.setVisible(isVisible)
    this.tradeButton.setVisible(isVisible)
  }

  onRender(data?: RosterScreenData): void {
    if (data) {
      this.titleText.setText(data.titleText)
      this.teamConfig = data.teamToRender
      this.tradeButton.setVisible(data.shouldShowTradeButton)
      this.setupPlayerStats(data.teamToRender)
    }
  }
}
