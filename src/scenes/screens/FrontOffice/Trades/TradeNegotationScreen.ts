import TeamMgmt, { PlayerAgentConfig, TeamConfig } from '~/scenes/TeamMgmt'
import { Screen } from '../../Screen'
import { RoundConstants } from '~/utils/RoundConstants'
import { AddTradeAssetModal } from '~/scenes/screens/FrontOffice/Trades/AddTradeAssetModal'
import { Utilities } from '~/utils/Utilities'
import { TradeNegotiationAssetList } from './TradeNegotiationAssetList'
import { Save, SaveKeys } from '~/utils/Save'
import { Side } from '~/core/Agent'
import { Button } from '~/core/ui/Button'
import { TradeProposalNotifModal } from './TradeProposalNotifModal'
import { ScreenKeys } from '../../ScreenKeys'
import { RosterScreenData } from '../../RosterScreen'

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
  private tradeProposalNotifModal!: TradeProposalNotifModal

  constructor(scene: TeamMgmt) {
    this.scene = scene
    this.setupAddAssetModal()
    this.setupProposeTradeButton()
    this.setupTradeProposalNotifModal()
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
      onClick: () => {
        this.proposeTrade()
      },
    })
  }

  setupTradeProposalNotifModal() {
    this.tradeProposalNotifModal = new TradeProposalNotifModal(this.scene, {
      onContinue: () => {},
      title: '',
      subtitle: '',
      depth: RoundConstants.SORT_LAYERS.Modal,
    })
    this.tradeProposalNotifModal.setVisible(false)
  }

  proposeTrade() {
    const proposedTrade = this.getProposedTrade()
    const playerTeam = Utilities.getPlayerTeamFromSave()
    const cpuTeam = this.teamToTradeWith

    const playerToSendIds = new Set(proposedTrade.cpuToReceive.map((agent) => agent.id))
    const cpuToSendIds = new Set(proposedTrade.playerToReceive.map((agent) => agent.id))

    const newPlayerRoster = playerTeam.roster
      .concat(proposedTrade.playerToReceive)
      .filter((config) => !playerToSendIds.has(config.id))

    const newCPURoster = cpuTeam.roster
      .concat(proposedTrade.cpuToReceive)
      .filter((config) => !cpuToSendIds.has(config.id))

    if (!this.areRosterSizesValid(newPlayerRoster, newCPURoster)) {
      this.tradeProposalNotifModal.display({
        title: 'Trade Invalid!',
        subtitle: 'Teams must have at least 3 players on them after trade',
        onContinue: () => {
          this.tradeProposalNotifModal.setVisible(false)
        },
      })
      return
    }
    if (!this.areSalariesValid(newPlayerRoster, newCPURoster)) {
      this.tradeProposalNotifModal.display({
        title: 'Trade Invalid!',
        subtitle: 'Salaries after the trade must be under the salary cap',
        onContinue: () => {
          this.tradeProposalNotifModal.setVisible(false)
        },
      })
      return
    }
    if (!this.areTradeValuesFair(newPlayerRoster, newCPURoster)) {
      this.tradeProposalNotifModal.display({
        title: 'Trade Rejected!',
        subtitle: 'You must add more value to make this trade work',
        onContinue: () => {
          this.tradeProposalNotifModal.setVisible(false)
        },
      })
      return
    }
    this.tradeProposalNotifModal.display({
      title: 'Trade Successful',
      subtitle: `The ${this.teamToTradeWith.name} have accepted your trade request`,
      onContinue: () => {
        this.processSuccessfulTrade(newPlayerRoster, newCPURoster)
      },
    })
  }

  processSuccessfulTrade(newPlayerRoster: PlayerAgentConfig[], newCPURoster: PlayerAgentConfig[]) {
    const playerTeam = Utilities.getPlayerTeamFromSave()
    playerTeam.roster = newPlayerRoster
    Utilities.updatePlayerTeamInSave(playerTeam)

    const allTeams = Save.getData(SaveKeys.ALL_TEAM_CONFIGS)
    const cpuTeam = allTeams[this.teamToTradeWith.name]
    cpuTeam.roster = newCPURoster
    allTeams[this.teamToTradeWith.name] = cpuTeam
    Save.setData(SaveKeys.ALL_TEAM_CONFIGS, allTeams)

    const rosterData: RosterScreenData = {
      shouldShowTradeButton: false,
      teamToRender: playerTeam,
      titleText: `${playerTeam.name} Roster`,
      shouldShowBackButton: false,
    }
    this.scene.renderActiveScreen(ScreenKeys.TEAM_ROSTER, rosterData)
  }

  areRosterSizesValid(newPlayerRoster: PlayerAgentConfig[], newCPURoster: PlayerAgentConfig[]) {
    return newPlayerRoster.length >= 3 && newCPURoster.length >= 3
  }

  areSalariesValid(newPlayerRoster: PlayerAgentConfig[], newCPURoster: PlayerAgentConfig[]) {
    const playerTotalSalary = newPlayerRoster.reduce((acc, curr) => {
      return acc + curr.contract.salary
    }, 0)
    const cpuTotalSalary = newCPURoster.reduce((acc, curr) => {
      return acc + curr.contract.salary
    }, 0)
    return (
      playerTotalSalary <= RoundConstants.SALARY_CAP && cpuTotalSalary <= RoundConstants.SALARY_CAP
    )
  }

  areTradeValuesFair(newPlayerRoster: PlayerAgentConfig[], newCPURoster: PlayerAgentConfig[]) {
    const playerAssets = this.playerAssetList.assetList
    const playerTotalTradeValue = playerAssets.reduce((acc, curr) => {
      return acc + Utilities.getTradeValue(curr)
    }, 0)

    const cpuAssets = this.cpuAssetList.assetList
    const cpuTotalTradeValue = cpuAssets.reduce((acc, curr) => {
      return acc + Utilities.getTradeValue(curr)
    }, 0)
    return playerTotalTradeValue >= cpuTotalTradeValue + 2
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
      this.tradeProposalNotifModal.setVisible(isVisible)
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
