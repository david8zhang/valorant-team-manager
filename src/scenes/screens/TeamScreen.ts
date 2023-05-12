import TeamMgmt, { TeamConfig } from '~/scenes/TeamMgmt'
import { RoundConstants } from '~/utils/RoundConstants'
import { Save, SaveKeys } from '~/utils/Save'
import { Screen } from './Screen'
import { HomePlayerInfo } from '~/core/ui/HomePlayerInfo'
import { Button } from '~/core/ui/Button'
import { ScreenKeys } from './ScreenKeys'

export class TeamScreen implements Screen {
  private scene: TeamMgmt
  private startingLineup: HomePlayerInfo[] = []
  private titleText: Phaser.GameObjects.Text
  private goToRosterButton!: Button

  constructor(scene: TeamMgmt) {
    this.scene = scene
    this.titleText = this.scene.add.text(
      RoundConstants.TEAM_MGMT_SIDEBAR_WIDTH + 15,
      20,
      'Starting Lineup',
      {
        fontSize: '35px',
        color: 'black',
      }
    )
    this.setupStartingLineupCards()
    this.setupGoToRosterButton()
    this.setVisible(false)
  }

  setupGoToRosterButton() {
    this.goToRosterButton = new Button({
      scene: this.scene,
      width: 200,
      height: 40,
      x: RoundConstants.WINDOW_WIDTH - 115,
      y: this.titleText.y + 20,
      text: 'View Roster',
      backgroundColor: 0x444444,
      onClick: () => {
        this.scene.renderActiveScreen(ScreenKeys.TEAM_ROSTER)
      },
      fontSize: '15px',
      textColor: 'white',
      strokeColor: 0x000000,
      strokeWidth: 1,
    })
  }

  onRender() {}

  setVisible(isVisible: boolean) {
    this.titleText.setVisible(isVisible)
    this.startingLineup.forEach((card) => {
      card.setVisible(isVisible)
    })
    this.goToRosterButton.setVisible(isVisible)
  }

  setupStartingLineupCards() {
    const allTeams = Save.getData(SaveKeys.ALL_TEAM_CONFIGS) as { [key: string]: TeamConfig }
    const playerTeam = allTeams[Save.getData(SaveKeys.PLAYER_TEAM_NAME)] as TeamConfig
    const playerConfigs = playerTeam.roster
    const padding = 15
    const cardWidth =
      TeamMgmt.BODY_WIDTH / playerConfigs.length -
      padding * ((playerConfigs.length + 1) / playerConfigs.length)
    let xPos = RoundConstants.TEAM_MGMT_SIDEBAR_WIDTH + padding
    playerConfigs.forEach((config) => {
      this.startingLineup.push(
        new HomePlayerInfo(this.scene, {
          name: config.name,
          position: {
            x: xPos,
            y: padding + 75,
          },
          height: RoundConstants.WINDOW_HEIGHT - 240,
          width: cardWidth,
        })
      )
      xPos += cardWidth + padding
    })
  }
}
