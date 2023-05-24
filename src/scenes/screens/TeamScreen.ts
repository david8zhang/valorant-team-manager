import TeamMgmt, { PlayerAgentConfig, TeamConfig } from '~/scenes/TeamMgmt'
import { RoundConstants } from '~/utils/RoundConstants'
import { Save, SaveKeys } from '~/utils/Save'
import { Screen } from './Screen'
import { HomePlayerInfo } from '~/core/ui/HomePlayerInfo'
import { Button } from '~/core/ui/Button'
import { ScreenKeys } from './ScreenKeys'

export class TeamScreen implements Screen {
  private scene: TeamMgmt
  private startingLineup: HomePlayerInfo[] = []
  private playerStatButtons: Button[] = []
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
    this.playerStatButtons.forEach((button) => {
      button.setVisible(isVisible)
    })
  }

  setupStartingLineupCards() {
    const allTeams = Save.getData(SaveKeys.ALL_TEAM_CONFIGS) as { [key: string]: TeamConfig }
    const playerTeam = allTeams[Save.getData(SaveKeys.PLAYER_TEAM_NAME)] as TeamConfig
    const starterConfigs = playerTeam.roster.filter((config: PlayerAgentConfig) => {
      return config.isStarting
    })
    const padding = 15
    const cardWidth =
      TeamMgmt.BODY_WIDTH / starterConfigs.length -
      padding * ((starterConfigs.length + 1) / starterConfigs.length)
    let xPos = RoundConstants.TEAM_MGMT_SIDEBAR_WIDTH + padding
    starterConfigs.forEach((config) => {
      const homePlayerInfo = new HomePlayerInfo(this.scene, {
        name: config.name,
        position: {
          x: xPos,
          y: padding + 75,
        },
        height: RoundConstants.WINDOW_HEIGHT - 240,
        width: cardWidth,
      })
      this.startingLineup.push(homePlayerInfo)
      const statButton = new Button({
        text: 'Show Stats',
        onClick: () => {
          this.scene.renderActiveScreen(ScreenKeys.PLAYER_DRILLDOWN, config)
        },
        x: xPos + homePlayerInfo.rectangle.displayWidth / 2,
        y: homePlayerInfo.rectangle.y + homePlayerInfo.rectangle.displayHeight + 35,
        width: homePlayerInfo.rectangle.displayWidth,
        height: 50,
        scene: this.scene,
        strokeColor: 0x000000,
        strokeWidth: 1,
      })
      this.playerStatButtons.push(statButton)
      xPos += cardWidth + padding
    })
  }
}
