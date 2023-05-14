import { Side } from '~/core/Agent'
import { Screen } from './Screen'
import TeamMgmt, { PlayerAgentConfig, TeamConfig } from '../TeamMgmt'
import { Save, SaveKeys } from '~/utils/Save'
import { PlayerAttrRow } from '~/core/ui/PlayerAttrRow'
import { Scene } from 'phaser'
import { RoundConstants } from '~/utils/RoundConstants'
import { Button } from '~/core/ui/Button'

export class ViewLineupsScreen implements Screen {
  public currTeam: Side = Side.CPU
  public currTeamImage: Phaser.GameObjects.Image
  public currTeamNameText: Phaser.GameObjects.Text
  public currTeamSubtitleText: Phaser.GameObjects.Text

  public viewNextTeamButton: Button
  public startMatchButton: Button

  public playerTeamConfig: TeamConfig
  public cpuTeamConfig: TeamConfig | null = null
  public playerAttrRows: PlayerAttrRow[] = []
  private scene: TeamMgmt

  constructor(scene: TeamMgmt) {
    this.scene = scene
    const allTeams = Save.getData(SaveKeys.ALL_TEAM_CONFIGS) as { [key: string]: TeamConfig }
    this.playerTeamConfig = allTeams[Save.getData(SaveKeys.PLAYER_TEAM_NAME)]
    this.currTeamImage = this.scene.add.image(RoundConstants.TEAM_MGMT_SIDEBAR_WIDTH + 15, 15, '')
    this.currTeamImage.setDisplaySize(75, 75).setOrigin(0)
    this.currTeamNameText = this.scene.add
      .text(this.currTeamImage.x + this.currTeamImage.displayWidth + 15, 30, '', {
        fontSize: '30px',
        color: 'black',
      })
      .setOrigin(0)
    this.currTeamSubtitleText = this.scene.add.text(
      this.currTeamNameText.x,
      this.currTeamNameText.y + this.currTeamNameText.displayHeight + 10,
      'Starting Lineup',
      {
        fontSize: '18px',
        color: 'black',
      }
    )

    this.viewNextTeamButton = new Button({
      scene: this.scene,
      x: RoundConstants.WINDOW_WIDTH - 80,
      y: 30,
      width: 125,
      height: 25,
      text: 'Next Team',
      onClick: () => {
        this.currTeam = this.currTeam === Side.PLAYER ? Side.CPU : Side.PLAYER
        this.displayCurrTeam()
      },
      strokeColor: 0x000000,
      strokeWidth: 1,
    })

    this.startMatchButton = new Button({
      scene: this.scene,
      x: RoundConstants.WINDOW_WIDTH - 80,
      y: 65,
      width: 125,
      height: 25,
      text: 'Start Match',
      onClick: () => {
        this.scene.startGame()
      },
      backgroundColor: 0x222222,
      textColor: 'white',
    })

    this.setVisible(false)
  }

  onRender(data?: any): void {
    this.cpuTeamConfig = data.opponentTeam
    this.displayCurrTeam()
  }

  displayCurrTeam() {
    const teamToShow = this.currTeam === Side.PLAYER ? this.playerTeamConfig : this.cpuTeamConfig
    if (teamToShow) {
      this.currTeamNameText.setText(teamToShow.name)
      if (this.playerAttrRows.length > 0) {
        this.playerAttrRows.forEach((statRow) => {
          statRow.destroy()
        })
        this.playerAttrRows = []
      }
      let yPos = 150
      teamToShow.roster.forEach((player: PlayerAgentConfig, index: number) => {
        const row = new PlayerAttrRow(this.scene, {
          isHeader: index === 0,
          position: {
            x: RoundConstants.TEAM_MGMT_SIDEBAR_WIDTH + 15,
            y: yPos,
          },
          name: player.name,
          attributes: player.attributes,
        })
        this.playerAttrRows.push(row)
        yPos += 30
      })
    }
  }

  setVisible(isVisible: boolean): void {
    this.playerAttrRows.forEach((attrRow) => {
      attrRow.setVisible(isVisible)
    })
    this.currTeamImage.setVisible(isVisible)
    this.currTeamNameText.setVisible(isVisible)
    this.currTeamSubtitleText.setVisible(isVisible)
    this.viewNextTeamButton.setVisible(isVisible)
    this.startMatchButton.setVisible(isVisible)
  }
}
