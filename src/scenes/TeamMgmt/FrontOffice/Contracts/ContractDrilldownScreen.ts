import TeamMgmt, { PlayerAgentConfig, TeamConfig } from '~/scenes/TeamMgmt/TeamMgmt'
import { Screen } from '../../Screen'
import { RoundConstants } from '~/utils/RoundConstants'
import { GenericPlayerAttrRow } from '~/core/ui/GenericPlayerAttrRow'
import { Utilities } from '~/utils/Utilities'
import { PlayerAttributes } from '~/utils/PlayerConstants'
import { Button } from '~/core/ui/Button'
import { ScreenKeys } from '../../ScreenKeys'
import { ContractConfigModal } from './ContractConfigModal'
import { Save, SaveKeys } from '~/utils/Save'
import { ConfirmReleaseModal } from './ConfirmReleaseModal'

export interface ContractDrilldownScreenConfig {
  playerConfig: PlayerAgentConfig
  onCancelFn?: Function | undefined
  isFreeAgentSigning: boolean
}

export class ContractDrilldownScreen implements Screen {
  private scene: TeamMgmt
  private playerConfig: PlayerAgentConfig | null = null
  private playerNameText: Phaser.GameObjects.Text | null = null
  private attributeRow: GenericPlayerAttrRow | null = null
  private contractConfigModal: ContractConfigModal | null = null
  private cancelButton!: Button
  private extendButton!: Button
  private releaseButton!: Button
  private mgmtHelpText: Phaser.GameObjects.Text | null = null
  private confirmReleaseModal: ConfirmReleaseModal | null = null
  private onCancelFn: Function | undefined

  constructor(scene: TeamMgmt) {
    this.scene = scene
    this.setupCancelButton()
    this.setVisible(false)
  }

  setupConfirmReleaseModal() {
    if (!this.playerConfig) {
      return
    }
    if (this.confirmReleaseModal) {
      this.confirmReleaseModal.destroy()
    }
    this.confirmReleaseModal = new ConfirmReleaseModal(this.scene, {
      onAccept: () => {
        this.releasePlayer()
      },
      onDeny: () => {
        this.confirmReleaseModal!.hide()
      },
      playerAgent: this.playerConfig,
      position: {
        x: (RoundConstants.TEAM_MGMT_SIDEBAR_WIDTH + RoundConstants.WINDOW_WIDTH) / 2,
        y: RoundConstants.WINDOW_HEIGHT / 2,
      },
    })
  }

  setupContractConfigModal(isFreeAgentSigning: boolean = false) {
    if (!this.playerConfig) {
      return
    }
    if (this.contractConfigModal) {
      this.contractConfigModal.destroy()
    }
    const xPos = (RoundConstants.TEAM_MGMT_SIDEBAR_WIDTH + RoundConstants.WINDOW_WIDTH) / 2
    const yPos = RoundConstants.WINDOW_HEIGHT / 2
    this.contractConfigModal = new ContractConfigModal(this.scene, {
      position: {
        x: xPos,
        y: yPos,
      },
      onAccept: (salaryAsk: number, durationAsk: number) => {
        if (isFreeAgentSigning) {
          this.signFreeAgent(salaryAsk, durationAsk)
        } else {
          this.extendPlayer(salaryAsk, durationAsk)
        }
      },
      onDeny: () => {
        if (this.contractConfigModal) {
          this.contractConfigModal.hide()
        }
      },
      playerConfig: this.playerConfig,
      width: 500,
      height: 350,
    })
    this.contractConfigModal.hide()
  }

  setupExtendOrSignButton(isFreeAgentSigning: boolean = false) {
    if (!this.playerConfig) {
      return
    }
    if (this.extendButton) {
      this.extendButton.destroy()
    }
    if (this.playerConfig.contract.duration <= 1 || isFreeAgentSigning) {
      this.extendButton = new Button({
        scene: this.scene,
        width: 150,
        height: 30,
        text: `${isFreeAgentSigning ? 'Sign' : 'Extend'}`,
        onClick: () => {
          if (this.contractConfigModal) {
            this.contractConfigModal.display()
          }
        },
        x: RoundConstants.TEAM_MGMT_SIDEBAR_WIDTH + 90,
        y: 200,
        textColor: 'black',
        strokeWidth: 1,
        strokeColor: 0x000000,
        fontSize: '15px',
      })
    }
  }

  extendPlayer(salaryAsk: number, durationAsk: number) {
    if (!this.playerConfig) {
      return
    }
    const allTeams = Save.getData(SaveKeys.ALL_TEAM_CONFIGS) as { [key: string]: TeamConfig }
    const playerTeam = allTeams[Save.getData(SaveKeys.PLAYER_TEAM_NAME)] as TeamConfig
    const newContract = {
      salary: salaryAsk,
      duration: durationAsk,
    }
    const newRoster = playerTeam.roster.map((player: PlayerAgentConfig) => {
      if (player.id === this.playerConfig!.id) {
        return { ...player, contract: newContract }
      }
      return player
    })
    playerTeam.roster = newRoster
    allTeams[playerTeam.name] = playerTeam
    Save.setData(SaveKeys.ALL_TEAM_CONFIGS, allTeams)
    this.scene.renderActiveScreen(ScreenKeys.CONTRACTS)
  }

  signFreeAgent(salaryAsk: number, durationAsk: number) {
    if (!this.playerConfig) {
      return
    }
    const allTeams = Save.getData(SaveKeys.ALL_TEAM_CONFIGS) as { [key: string]: TeamConfig }
    const playerTeam = allTeams[Save.getData(SaveKeys.PLAYER_TEAM_NAME)] as TeamConfig
    const currContract = this.playerConfig.contract
    const newContract = {
      salary: salaryAsk,
      duration: currContract.duration + durationAsk,
    }
    const newRoster = playerTeam.roster.concat({
      ...this.playerConfig,
      contract: newContract,
    })
    playerTeam.roster = newRoster
    allTeams[playerTeam.name] = playerTeam
    const existingFreeAgents = Save.getData(SaveKeys.FREE_AGENTS) || []
    const newFreeAgents = existingFreeAgents.filter((agent) => {
      return agent.id !== this.playerConfig!.id
    })
    Save.setData(SaveKeys.FREE_AGENTS, newFreeAgents)
    Save.setData(SaveKeys.ALL_TEAM_CONFIGS, allTeams)
    this.scene.renderActiveScreen(ScreenKeys.CONTRACTS)
  }

  releasePlayer() {
    if (!this.playerConfig) {
      return
    }
    const allTeams = Save.getData(SaveKeys.ALL_TEAM_CONFIGS) as { [key: string]: TeamConfig }
    const playerTeam = allTeams[Save.getData(SaveKeys.PLAYER_TEAM_NAME)] as TeamConfig
    playerTeam.roster = playerTeam.roster.filter((playerAgent: PlayerAgentConfig) => {
      return playerAgent.id !== this.playerConfig!.id
    })
    allTeams[Save.getData(SaveKeys.PLAYER_TEAM_NAME)] = playerTeam
    Save.setData(SaveKeys.ALL_TEAM_CONFIGS, allTeams)
    this.scene.renderActiveScreen(ScreenKeys.CONTRACTS)
  }

  setupReleaseButton(isFreeAgentSigning: boolean = false) {
    if (!this.playerConfig) {
      return
    }
    if (this.releaseButton) {
      this.releaseButton.destroy()
    }
    if (this.playerConfig.contract.duration <= 1) {
      this.releaseButton = new Button({
        scene: this.scene,
        width: 150,
        height: 30,
        text: 'Release',
        onClick: () => {
          this.confirmReleaseModal?.display()
        },
        x: RoundConstants.TEAM_MGMT_SIDEBAR_WIDTH + 90 + 150 + 15,
        y: 200,
        textColor: 'black',
        strokeWidth: 1,
        strokeColor: 0x000000,
        fontSize: '15px',
      })
      this.releaseButton.setVisible(!isFreeAgentSigning)
    }
  }

  setVisible(isVisible: boolean): void {
    if (this.playerNameText) {
      this.playerNameText.setVisible(isVisible)
    }
    if (this.attributeRow) {
      this.attributeRow.setVisible(isVisible)
    }
    this.cancelButton.setVisible(isVisible)
    if (this.releaseButton) {
      this.releaseButton.setVisible(isVisible)
    }
    if (this.contractConfigModal) {
      this.contractConfigModal.setVisible(isVisible)
    }
    if (this.extendButton) {
      this.extendButton.setVisible(isVisible)
    }
    if (this.mgmtHelpText) {
      this.mgmtHelpText.setVisible(isVisible)
    }
    if (this.confirmReleaseModal && this.confirmReleaseModal.shouldShow) {
      this.confirmReleaseModal.setVisible(isVisible)
    }
  }

  setupMgmtHelpText(isFreeAgentSigning: boolean = false) {
    if (!this.playerConfig) {
      return
    }
    if (this.mgmtHelpText) {
      this.mgmtHelpText.destroy()
    }
    if (this.playerConfig.contract.duration > 1 && !isFreeAgentSigning) {
      this.mgmtHelpText = this.scene.add.text(
        RoundConstants.TEAM_MGMT_SIDEBAR_WIDTH + 15,
        200,
        '*Contracts can only be managed when there is 1 year left',
        {
          fontSize: '15px',
          color: 'black',
        }
      )
    }
  }

  setupCancelButton() {
    this.cancelButton = new Button({
      scene: this.scene,
      width: 150,
      height: 30,
      x: RoundConstants.WINDOW_WIDTH - 100,
      y: 40,
      text: 'Cancel',
      onClick: () => {
        if (this.onCancelFn) {
          this.onCancelFn()
        } else {
          this.scene.renderActiveScreen(ScreenKeys.CONTRACTS)
        }
      },
      fontSize: '15px',
      textColor: 'black',
      strokeColor: 0x000000,
      strokeWidth: 1,
    })
  }

  setupPlayerName() {
    if (!this.playerConfig) {
      return
    }
    if (this.playerNameText) {
      this.playerNameText.destroy()
    }
    this.playerNameText = this.scene.add.text(
      RoundConstants.TEAM_MGMT_SIDEBAR_WIDTH + 20,
      30,
      this.playerConfig.name,
      {
        fontSize: '24px',
        color: 'black',
      }
    )
  }

  setupPlayerAttributes() {
    if (!this.playerConfig) {
      return
    }
    if (this.attributeRow) {
      this.attributeRow.destroy()
    }
    this.attributeRow = new GenericPlayerAttrRow(this.scene, {
      position: {
        x: RoundConstants.TEAM_MGMT_SIDEBAR_WIDTH + 50,
        y: 125,
      },
      isHeader: true,
      columnConfigs: [
        {
          key: 'Ovr.',
          value: `${Utilities.getOverallPlayerRank(this.playerConfig)}`,
        },
        {
          key: 'Acc.',
          value: `${this.playerConfig.attributes[PlayerAttributes.ACCURACY]}`,
        },
        {
          key: 'React.',
          value: `${this.playerConfig.attributes[PlayerAttributes.REACTION]}`,
        },
        {
          key: 'HS',
          value: `${this.playerConfig.attributes[PlayerAttributes.HEADSHOT]}`,
        },
        {
          key: 'Pot.',
          value: `${this.playerConfig.potential}`,
        },
        {
          key: 'Salary',
          value: `$${this.playerConfig.contract.salary}M`,
        },
        {
          key: 'Length',
          value: `${this.playerConfig.contract.duration}Y`,
        },
      ],
    })
  }

  onRender(data?: ContractDrilldownScreenConfig): void {
    if (data && data.playerConfig) {
      this.playerConfig = data.playerConfig
      this.onCancelFn = data.onCancelFn
      this.setupPlayerName()
      this.setupPlayerAttributes()
      this.setupConfirmReleaseModal()
      this.setupMgmtHelpText(data.isFreeAgentSigning)
      this.setupExtendOrSignButton(data.isFreeAgentSigning)
      this.setupReleaseButton(data.isFreeAgentSigning)
      this.setupContractConfigModal(data.isFreeAgentSigning)
    }
  }
}
