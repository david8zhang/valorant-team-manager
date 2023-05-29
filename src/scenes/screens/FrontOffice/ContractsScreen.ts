import TeamMgmt, { PlayerAgentConfig, TeamConfig } from '~/scenes/TeamMgmt'
import { PlayerContractRow } from './PlayerContractRow'
import { Screen } from '../Screen'
import { Save, SaveKeys } from '~/utils/Save'
import { RoundConstants } from '~/utils/RoundConstants'
import { ScreenKeys } from '../ScreenKeys'

export class ContractsScreen implements Screen {
  private scene: TeamMgmt
  private playerContractRows: PlayerContractRow[] = []
  private titleText: Phaser.GameObjects.Text
  private salaryCapText!: Phaser.GameObjects.Text
  private totalSalaryText!: Phaser.GameObjects.Text
  private totalSalaryAmountText!: Phaser.GameObjects.Text

  constructor(scene: TeamMgmt) {
    this.scene = scene
    this.titleText = this.scene.add.text(
      RoundConstants.TEAM_MGMT_SIDEBAR_WIDTH + 15,
      15,
      'Contracts',
      {
        fontSize: '24px',
        color: 'black',
      }
    )
    this.setupSalaryCapText()
    this.setupPlayerContractRows()
    this.setVisible(false)
  }

  setupSalaryCapText() {
    this.salaryCapText = this.scene.add
      .text(RoundConstants.WINDOW_WIDTH - 15, 30, `| Salary Cap: $${RoundConstants.SALARY_CAP}M`, {
        fontSize: '20px',
        color: 'black',
      })
      .setOrigin(1, 0.5)

    const allTeams = Save.getData(SaveKeys.ALL_TEAM_CONFIGS) as { [key: string]: TeamConfig }
    const playerTeam = allTeams[Save.getData(SaveKeys.PLAYER_TEAM_NAME)] as TeamConfig
    const totalSalaryAmount = playerTeam.roster.reduce((acc, curr) => {
      return acc + curr.contract.salary
    }, 0)
    this.totalSalaryAmountText = this.scene.add
      .text(
        this.salaryCapText.x - this.salaryCapText.displayWidth - 15,
        30,
        `$${totalSalaryAmount}M`,
        {
          fontSize: '20px',
          color: totalSalaryAmount <= RoundConstants.SALARY_CAP ? 'green' : 'red',
        }
      )
      .setOrigin(1, 0.5)
    this.totalSalaryText = this.scene.add
      .text(
        this.totalSalaryAmountText.x - this.totalSalaryAmountText.displayWidth,
        30,
        'Total Salary: ',
        {
          fontSize: '20px',
          color: 'black',
        }
      )
      .setOrigin(1, 0.5)
  }

  setupPlayerContractRows() {
    const allTeams = Save.getData(SaveKeys.ALL_TEAM_CONFIGS) as { [key: string]: TeamConfig }
    const playerTeam = allTeams[Save.getData(SaveKeys.PLAYER_TEAM_NAME)] as TeamConfig
    let yPos = this.titleText.displayHeight + 75
    playerTeam.roster.forEach((playerConfig: PlayerAgentConfig, index: number) => {
      const newPlayerContractRow = new PlayerContractRow(this.scene, {
        position: {
          x: RoundConstants.TEAM_MGMT_SIDEBAR_WIDTH + 15,
          y: yPos,
        },
        playerConfig,
        isHeader: index === 0,
        onManage: () => {
          this.scene.renderActiveScreen(ScreenKeys.CONTRACT_DRILLDOWN, {
            playerConfig,
          })
        },
      })
      this.playerContractRows.push(newPlayerContractRow)
      yPos += 40
    })
  }

  updateSalaryCapText() {
    this.salaryCapText.destroy()
    this.totalSalaryAmountText.destroy()
    this.totalSalaryText.destroy()
    this.setupSalaryCapText()
  }

  updatePlayerContractRows() {
    this.playerContractRows.forEach((row) => {
      row.destroy()
    })
    this.playerContractRows = []
    this.setupPlayerContractRows()
  }

  setVisible(isVisible: boolean): void {
    this.titleText.setVisible(isVisible)
    this.playerContractRows.forEach((row: PlayerContractRow) => {
      row.setVisible(isVisible)
    })
    this.salaryCapText.setVisible(isVisible)
    this.totalSalaryText.setVisible(isVisible)
    this.totalSalaryAmountText.setVisible(isVisible)
  }

  onRender(data?: any): void {
    this.updatePlayerContractRows()
    this.updateSalaryCapText()
  }
}
