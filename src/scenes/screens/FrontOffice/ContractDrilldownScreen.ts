import TeamMgmt, { PlayerAgentConfig } from '~/scenes/TeamMgmt'
import { Screen } from '../Screen'
import { RoundConstants } from '~/utils/RoundConstants'
import { GenericPlayerAttrRow } from '~/core/ui/GenericPlayerAttrRow'
import { Utilities } from '~/utils/Utilities'
import { PlayerAttributes } from '~/utils/PlayerConstants'
import { Button } from '~/core/ui/Button'
import { ScreenKeys } from '../ScreenKeys'
import { ContractConfigModal } from './ContractConfigModal'

export class ContractDrilldownScreen implements Screen {
  private scene: TeamMgmt
  private playerConfig: PlayerAgentConfig | null = null
  private playerNameText: Phaser.GameObjects.Text | null = null
  private attributeRow: GenericPlayerAttrRow | null = null
  private contractConfigModal: ContractConfigModal | null = null
  private cancelButton!: Button
  private extendButton!: Button
  private releaseButton!: Button

  constructor(scene: TeamMgmt) {
    this.scene = scene
    this.setupCancelButton()
    this.setupExtendButton()
    this.setupReleaseButton()
    this.setVisible(false)
  }

  setupContractConfigModal() {
    if (!this.playerConfig) {
      return
    }
    const xPos = (RoundConstants.TEAM_MGMT_SIDEBAR_WIDTH + RoundConstants.WINDOW_WIDTH) / 2
    const yPos = RoundConstants.WINDOW_HEIGHT / 2
    this.contractConfigModal = new ContractConfigModal(this.scene, {
      position: {
        x: xPos,
        y: yPos,
      },
      playerConfig: this.playerConfig,
      width: 500,
      height: 350,
    })
    this.contractConfigModal.hide()
  }

  setupExtendButton() {
    this.extendButton = new Button({
      scene: this.scene,
      width: 150,
      height: 30,
      text: 'Extend',
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

  setupReleaseButton() {
    if (!this.playerConfig) {
      return
    }
    if (this.playerConfig.contract.duration == 1) {
      this.releaseButton = new Button({
        scene: this.scene,
        width: 150,
        height: 30,
        text: 'Release',
        onClick: () => {},
        x: RoundConstants.TEAM_MGMT_SIDEBAR_WIDTH + 90 + 150 + 15,
        y: 200,
        textColor: 'black',
        strokeWidth: 1,
        strokeColor: 0x000000,
        fontSize: '15px',
      })
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
    this.extendButton.setVisible(isVisible)
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
        this.scene.renderActiveScreen(ScreenKeys.CONTRACTS)
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
          value: `${Utilities.getOverallRank(this.playerConfig)}`,
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

  onRender(data?: any): void {
    if (data && data.playerConfig) {
      this.playerConfig = data.playerConfig
      this.setupPlayerName()
      this.setupPlayerAttributes()
      this.setupContractConfigModal()
    }
  }
}
