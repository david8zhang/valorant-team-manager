import { Save, SaveKeys } from '~/utils/Save'
import TeamMgmt, { PlayerAgentConfig, TeamConfig } from '../TeamMgmt'
import { Screen } from './Screen'
import { PlayerAttrRow } from '~/core/ui/PlayerAttrRow'
import { RoundConstants } from '~/utils/RoundConstants'
import { Button } from '~/core/ui/Button'
import { ScreenKeys } from './ScreenKeys'

export class RosterScreen implements Screen {
  private scene: TeamMgmt
  private agentTableRowStats: PlayerAttrRow[] = []
  private titleText: Phaser.GameObjects.Text
  private goToTeamButton!: Button

  constructor(scene: TeamMgmt) {
    this.scene = scene
    this.setupPlayerStats()
    this.titleText = this.scene.add.text(
      RoundConstants.TEAM_MGMT_SIDEBAR_WIDTH + 15,
      20,
      'Your Roster',
      {
        fontSize: '35px',
        color: 'black',
      }
    )
    this.setupGoToTeamButton()
    this.setVisible(false)
  }

  setupGoToTeamButton() {
    this.goToTeamButton = new Button({
      scene: this.scene,
      width: 200,
      height: 40,
      x: RoundConstants.WINDOW_WIDTH - 115,
      y: this.titleText.y + 20,
      text: 'View Starters',
      backgroundColor: 0x444444,
      onClick: () => {
        this.scene.renderActiveScreen(ScreenKeys.TEAM)
      },
      fontSize: '15px',
      textColor: 'white',
      strokeColor: 0x000000,
      strokeWidth: 1,
    })
  }

  setupPlayerStats() {
    const allTeams = Save.getData(SaveKeys.ALL_TEAM_CONFIGS) as { [key: string]: TeamConfig }
    const playerTeam = allTeams[Save.getData(SaveKeys.PLAYER_TEAM_NAME)] as TeamConfig
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
    this.goToTeamButton.setVisible(isVisible)
  }
  onRender(): void {}
}
