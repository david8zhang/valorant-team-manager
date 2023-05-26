import { Save, SaveKeys } from '~/utils/Save'
import { Screen } from './Screen'
import TeamMgmt, { PlayerAgentConfig, TeamConfig } from '~/scenes/TeamMgmt'
import { RoundConstants } from '~/utils/RoundConstants'
import { ScreenKeys } from './ScreenKeys'
import { HomePlayerInfo } from '~/core/ui/HomePlayerInfo'
import { Button } from '~/core/ui/Button'

export class HomeScreen implements Screen {
  private scene: TeamMgmt
  private playerCards: HomePlayerInfo[] = []
  private queueButton: Button
  private teamNameText!: Phaser.GameObjects.Text
  private winLossRecordText!: Phaser.GameObjects.Text

  constructor(scene: TeamMgmt) {
    this.scene = scene
    this.queueButton = new Button({
      scene: this.scene,
      width: 200,
      height: 50,
      x: 200 + TeamMgmt.BODY_WIDTH / 2,
      y: RoundConstants.WINDOW_HEIGHT - 60,
      text: 'Queue Up',
      backgroundColor: 0x444444,
      onClick: () => {
        this.scene.renderActiveScreen(ScreenKeys.SEASON)
      },
      fontSize: '20px',
      textColor: 'white',
      strokeColor: 0x000000,
      strokeWidth: 1,
    })
    this.setupPlayerCards()
    this.setupTeamName()
    this.setupWinLossRecordText()
    this.setVisible(false)
  }

  setupWinLossRecordText() {
    const allTeams = Save.getData(SaveKeys.ALL_TEAM_CONFIGS) as { [key: string]: TeamConfig }
    const playerTeam = allTeams[Save.getData(SaveKeys.PLAYER_TEAM_NAME)] as TeamConfig

    this.winLossRecordText = this.scene.add.text(
      200 + TeamMgmt.BODY_WIDTH / 2,
      this.teamNameText.y + this.teamNameText.displayHeight + 15,
      `${playerTeam.wins}W - ${playerTeam.losses}L`,
      {
        fontSize: '20px',
        color: 'black',
      }
    )
    this.winLossRecordText.setPosition(
      200 + TeamMgmt.BODY_WIDTH / 2 - this.winLossRecordText.displayWidth / 2,
      this.winLossRecordText.y - this.winLossRecordText.displayHeight / 2
    )
  }

  setupTeamName() {
    const teamName = Save.getData(SaveKeys.PLAYER_TEAM_NAME)
    this.teamNameText = this.scene.add.text(200 + TeamMgmt.BODY_WIDTH / 2, 40, teamName, {
      fontSize: '40px',
      color: 'black',
    })
    this.teamNameText.setPosition(
      this.teamNameText.x - this.teamNameText.displayWidth / 2,
      this.teamNameText.y - this.teamNameText.displayHeight / 2
    )
  }

  setupPlayerCards() {
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
          y: padding + 90,
        },
        height: RoundConstants.WINDOW_HEIGHT - 240,
        width: cardWidth,
      })
      this.playerCards.push(homePlayerInfo)
      xPos += cardWidth + padding
    })
  }

  onRender() {
    const allTeams = Save.getData(SaveKeys.ALL_TEAM_CONFIGS) as { [key: string]: TeamConfig }
    const playerTeam = allTeams[Save.getData(SaveKeys.PLAYER_TEAM_NAME)] as TeamConfig
    const starters = playerTeam.roster.filter((p) => p.isStarting)
    const teamName = Save.getData(SaveKeys.PLAYER_TEAM_NAME)

    this.playerCards.forEach((playerCard, index) => {
      playerCard.updateInfo(starters[index])
    })
    this.teamNameText.setText(teamName)
    this.teamNameText.setPosition(
      200 + TeamMgmt.BODY_WIDTH / 2 - this.teamNameText.displayWidth / 2,
      40 - this.teamNameText.displayHeight / 2
    )
    this.winLossRecordText.setText(`${playerTeam.wins}W - ${playerTeam.losses}L`)
    this.winLossRecordText.setPosition(
      200 + TeamMgmt.BODY_WIDTH / 2 - this.winLossRecordText.displayWidth / 2,
      this.teamNameText.y +
        this.teamNameText.displayHeight +
        15 -
        this.winLossRecordText.displayHeight / 2
    )
  }

  setVisible(isVisible: boolean) {
    this.playerCards.forEach((playerCard) => {
      playerCard.setVisible(isVisible)
    })
    this.teamNameText.setVisible(isVisible)
    this.winLossRecordText.setVisible(isVisible)
    this.queueButton.setVisible(isVisible)
  }

  generateNewPlayers(): any[] {
    const newPlayers: any[] = []
    for (let i = 1; i <= 3; i++) {
      newPlayers.push({
        name: `Agent-${i}`,
      })
    }
    return newPlayers
  }
}
