import { Screen } from './Screen'
import { PlayerAttrRow } from '~/core/ui/PlayerAttrRow'
import TeamMgmt, { PlayerAgentConfig } from './TeamMgmt'
import { RoundConstants } from '~/utils/RoundConstants'
import { ScreenKeys } from './ScreenKeys'
import { Button } from '~/core/ui/Button'
import { Utilities } from '~/utils/Utilities'

export class SubstitutePlayerScreen implements Screen {
  private scene: TeamMgmt
  private agentTableRowStats: PlayerAttrRow[] = []
  private titleText: Phaser.GameObjects.Text
  private playerToReplace: PlayerAgentConfig | null = null
  private cancelButton!: Button

  constructor(scene: TeamMgmt) {
    this.scene = scene
    this.titleText = this.scene.add.text(
      RoundConstants.TEAM_MGMT_SIDEBAR_WIDTH + 15,
      20,
      'Select New Starter',
      {
        fontSize: '35px',
        color: 'black',
      }
    )
    this.setupCancelButton()
    this.setVisible(false)
  }

  setupCancelButton() {
    this.cancelButton = new Button({
      scene: this.scene,
      width: 150,
      height: 30,
      x: RoundConstants.WINDOW_WIDTH - 85,
      y: this.titleText.y + 20,
      text: 'Cancel',
      onClick: () => {
        this.scene.renderActiveScreen(ScreenKeys.TEAM)
      },
      fontSize: '15px',
      textColor: 'black',
      strokeColor: 0x000000,
      strokeWidth: 1,
    })
  }

  replaceStarter(newStarterConfig: PlayerAgentConfig) {
    const playerTeam = Utilities.getPlayerTeamFromSave()
    playerTeam.roster.forEach((p: PlayerAgentConfig) => {
      if (this.playerToReplace && p.id === this.playerToReplace.id) {
        p.isStarting = false
      }
      if (p.id === newStarterConfig.id) {
        p.isStarting = true
      }
    })
    Utilities.updatePlayerTeamInSave(playerTeam)
    this.scene.renderActiveScreen(ScreenKeys.TEAM)
  }

  setupPlayerRows() {
    if (this.agentTableRowStats.length > 0) {
      this.agentTableRowStats.forEach((row: PlayerAttrRow) => {
        row.destroy()
      })
      this.agentTableRowStats = []
    }
    const playerTeam = Utilities.getPlayerTeamFromSave()
    let yPos = 125
    playerTeam.roster.forEach((config: PlayerAgentConfig, index: number) => {
      const agentTableRowStat = new PlayerAttrRow(this.scene, {
        name: config.name,
        attributes: config.attributes,
        isHeader: index === 0,
        position: {
          x: RoundConstants.TEAM_MGMT_SIDEBAR_WIDTH + 15,
          y: yPos,
        },
        buttonConfig: {
          text: 'Start',
          shouldShow:
            (this.playerToReplace == null || this.playerToReplace.id !== config.id) &&
            !config.isStarting,
          onClick: () => {
            this.replaceStarter(config)
          },
        },
      })
      this.agentTableRowStats.push(agentTableRowStat)
      yPos += 40
    })
  }

  onRender(data?: any): void {
    if (data && data.playerToReplace) {
      this.playerToReplace = data.playerToReplace
    }
    this.setupPlayerRows()
  }
  setVisible(isVisible: boolean): void {
    this.agentTableRowStats.forEach((row: PlayerAttrRow) => {
      row.setVisible(isVisible)
    })
    this.cancelButton.setVisible(isVisible)
    this.titleText.setVisible(isVisible)
  }
}
