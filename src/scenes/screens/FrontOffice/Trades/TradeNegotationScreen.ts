import TeamMgmt, { PlayerAgentConfig, TeamConfig } from '~/scenes/TeamMgmt'
import { Screen } from '../../Screen'
import { RoundConstants } from '~/utils/RoundConstants'
import { AddTradeAssetModal } from '~/scenes/screens/FrontOffice/Trades/AddTradeAssetModal'
import { Utilities } from '~/utils/Utilities'
import { TradeNegotiationAssetList } from './TradeNegotiationAssetList'
import { Save, SaveKeys } from '~/utils/Save'
import { Side } from '~/core/Agent'
import { Button } from '~/core/ui/Button'

export interface TradeNegotiationScreenData {
  teamToTradeWith: TeamConfig
}

export class TradeNegotiationScreen implements Screen {
  private scene: TeamMgmt
  public teamToTradeWith!: TeamConfig
  public playerAssetList!: TradeNegotiationAssetList
  private cpuAssetList!: TradeNegotiationAssetList
  private addAssetModal!: AddTradeAssetModal
  private currSideToAddFrom: Side = Side.PLAYER
  private proposeTradeButton!: Button

  constructor(scene: TeamMgmt) {
    this.scene = scene
    this.setupAddAssetModal()
    this.setupProposeTradeButton()
    this.setVisible(false)
  }

  getAddedAssetIds() {
    const set = new Set<string>()
    this.playerAssetList.assetList.forEach((asset) => {
      set.add(asset.id)
    })
    this.cpuAssetList.assetList.forEach((asset) => {
      set.add(asset.id)
    })
    return set
  }

  setupAssetLists() {
    if (this.playerAssetList) {
      this.playerAssetList.destroy()
    }
    if (this.cpuAssetList) {
      this.cpuAssetList.destroy()
    }
    const totalWidth = RoundConstants.WINDOW_WIDTH - RoundConstants.TEAM_MGMT_SIDEBAR_WIDTH - 45
    const playerTeamName = Save.getData(SaveKeys.PLAYER_TEAM_NAME)
    this.playerAssetList = new TradeNegotiationAssetList(this.scene, {
      position: {
        x: RoundConstants.TEAM_MGMT_SIDEBAR_WIDTH + 15,
        y: 50,
      },
      onAddAsset: () => {
        this.currSideToAddFrom = Side.PLAYER
        const playerTeam = Utilities.getPlayerTeamFromSave()
        this.addAssetModal.showModal(playerTeam)
      },
      onRemoveAsset: () => {
        this.removeAsset()
      },
      width: totalWidth / 2,
      height: RoundConstants.WINDOW_HEIGHT - 135,
      teamName: playerTeamName,
      negotiationScreen: this,
      teamConfig: Utilities.getPlayerTeamFromSave(),
    })
    this.cpuAssetList = new TradeNegotiationAssetList(this.scene, {
      position: {
        x: RoundConstants.TEAM_MGMT_SIDEBAR_WIDTH + 15 + totalWidth / 2 + 15,
        y: 50,
      },
      onAddAsset: () => {
        this.currSideToAddFrom = Side.CPU
        this.addAssetModal.showModal(this.teamToTradeWith)
      },
      onRemoveAsset: () => {
        this.removeAsset()
      },
      width: totalWidth / 2,
      height: RoundConstants.WINDOW_HEIGHT - 135,
      teamName: this.teamToTradeWith.name,
      negotiationScreen: this,
      teamConfig: this.teamToTradeWith,
    })
  }

  getProposedTrade() {
    return {
      playerToReceive: this.cpuAssetList ? this.cpuAssetList.assetList : [],
      cpuToReceive: this.playerAssetList ? this.playerAssetList.assetList : [],
    }
  }

  removeAsset() {
    if (this.addAssetModal.isVisible) {
      this.addAssetModal.updatePage(0)
    }
    this.cpuAssetList.updateSalaryAfterTradeValueText()
    this.playerAssetList.updateSalaryAfterTradeValueText()
  }

  addAsset(playerAgentConfig: PlayerAgentConfig) {
    if (this.currSideToAddFrom === Side.PLAYER) {
      this.playerAssetList.addAsset(playerAgentConfig)
    } else if (this.currSideToAddFrom === Side.CPU) {
      this.cpuAssetList.addAsset(playerAgentConfig)
    }
    this.cpuAssetList.updateSalaryAfterTradeValueText()
    this.playerAssetList.updateSalaryAfterTradeValueText()
  }

  setupProposeTradeButton() {
    this.proposeTradeButton = new Button({
      scene: this.scene,
      x: (RoundConstants.TEAM_MGMT_SIDEBAR_WIDTH + RoundConstants.WINDOW_WIDTH) / 2,
      y: RoundConstants.WINDOW_HEIGHT - 45,
      width: RoundConstants.WINDOW_WIDTH - RoundConstants.TEAM_MGMT_SIDEBAR_WIDTH - 30,
      height: 50,
      text: 'Propose Trade',
      fontSize: '15px',
      textColor: 'white',
      backgroundColor: 0x444444,
      onClick: () => {},
    })
  }

  proposeTrade() {
    const proposedTrade = this.getProposedTrade()
    const playerTeam = Utilities.getPlayerTeamFromSave()
    const cpuTeam = this.teamToTradeWith

    const playerToSendIds = new Set(proposedTrade.playerToReceive.map((agent) => agent.id))
    const cpuToSendIds = new Set(proposedTrade.cpuToReceive.map((agent) => agent.id))

    const newPlayerRoster = playerTeam.roster
      .concat(proposedTrade.playerToReceive)
      .filter((config) => !playerToSendIds.has(config.id))

    const newCPURoster = cpuTeam.roster
      .concat(proposedTrade.cpuToReceive)
      .filter((config) => !cpuToSendIds.has(config.id))

    if (newPlayerRoster.length < 3 || newCPURoster.length < 3) {
    }
  }

  setupAddAssetModal() {
    this.addAssetModal = new AddTradeAssetModal(this.scene, {
      onAddAsset: (asset: PlayerAgentConfig) => {
        this.addAsset(asset)
      },
      tradeNegotiationScreen: this,
    })
  }

  setVisible(isVisible: boolean): void {
    if (this.playerAssetList) {
      this.playerAssetList.setVisible(isVisible)
    }
    if (this.cpuAssetList) {
      this.cpuAssetList.setVisible(isVisible)
    }
    if (!isVisible) {
      this.addAssetModal.setVisible(isVisible)
    }
    this.proposeTradeButton.setVisible(isVisible)
  }

  onRender(data?: any): void {
    if (data) {
      this.teamToTradeWith = data.teamToTradeWith
      this.setupAssetLists()
    }
  }
}
