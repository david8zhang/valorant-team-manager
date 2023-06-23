import TeamMgmt, { TeamConfig } from '~/scenes/TeamMgmt'
import { Screen } from '../Screen'
import { Save, SaveKeys } from '~/utils/Save'
import { TeamToTradeWith } from '~/core/ui/TeamToTradeWith'
import { RoundConstants } from '~/utils/RoundConstants'
import { ScreenKeys } from '../ScreenKeys'
import { RosterScreenData } from '../RosterScreen'

export class TeamsToTradeWithScreen implements Screen {
  private static PAGE_SIZE = 8

  private scene: TeamMgmt
  private teamsToTradeWith: TeamToTradeWith[] = []
  private titleText!: Phaser.GameObjects.Text
  private currPageIndex: number = 0

  private leftButton!: Phaser.GameObjects.Image
  private rightButton!: Phaser.GameObjects.Image

  constructor(scene: TeamMgmt) {
    this.scene = scene
    this.setupTitleText()
    this.setupPaginationButton()
    this.updateTeamList(0)
    this.setVisible(false)
  }

  setupTitleText() {
    this.titleText = this.scene.add
      .text(RoundConstants.TEAM_MGMT_SIDEBAR_WIDTH + 15, 25, 'Select team to trade with', {
        fontSize: '24px',
        color: 'black',
      })
      .setOrigin(0)
  }

  setupPaginationButton() {
    this.leftButton = this.scene.add
      .image(
        RoundConstants.TEAM_MGMT_SIDEBAR_WIDTH + 20,
        RoundConstants.WINDOW_HEIGHT - 20,
        'backward'
      )
      .setScale(0.5)
      .setInteractive()
      .on(Phaser.Input.Events.POINTER_DOWN, () => {
        this.leftButton.setAlpha(0.5)
      })
      .on(Phaser.Input.Events.POINTER_DOWN_OUTSIDE, () => {
        this.updateTeamList(-1)
        this.leftButton.setAlpha(1)
      })
      .on(Phaser.Input.Events.POINTER_UP, () => {
        this.updateTeamList(-1)
        this.leftButton.setAlpha(1)
      })
      .on(Phaser.Input.Events.POINTER_UP_OUTSIDE, () => {
        this.updateTeamList(-1)
        this.leftButton.setAlpha(1)
      })

    this.rightButton = this.scene.add
      .image(RoundConstants.WINDOW_WIDTH - 20, RoundConstants.WINDOW_HEIGHT - 20, 'forward')
      .setScale(0.5)
      .setInteractive()
      .on(Phaser.Input.Events.POINTER_DOWN, () => {
        this.rightButton.setAlpha(0.5)
      })
      .on(Phaser.Input.Events.POINTER_DOWN_OUTSIDE, () => {
        this.updateTeamList(1)
        this.rightButton.setAlpha(1)
      })
      .on(Phaser.Input.Events.POINTER_UP, () => {
        this.updateTeamList(1)
        this.rightButton.setAlpha(1)
      })
      .on(Phaser.Input.Events.POINTER_UP_OUTSIDE, () => {
        this.updateTeamList(1)
        this.rightButton.setAlpha(1)
      })
  }

  getAllTeamsExceptPlayer() {
    const allTeams = Save.getData(SaveKeys.ALL_TEAM_CONFIGS) as { [key: string]: TeamConfig }
    const playerTeamName = Save.getData(SaveKeys.PLAYER_TEAM_NAME) as string
    return Object.values(allTeams).filter((team) => {
      return team.name !== playerTeamName
    })
  }

  updateTeamList(diff: number) {
    const allTeamsExceptPlayer = this.getAllTeamsExceptPlayer()
    this.currPageIndex += diff
    this.currPageIndex = Math.max(0, this.currPageIndex)
    this.currPageIndex = Math.min(
      Math.round(allTeamsExceptPlayer.length / TeamsToTradeWithScreen.PAGE_SIZE) - 1,
      this.currPageIndex
    )
    if (this.leftButton && this.rightButton) {
      this.leftButton.setVisible(true)
      this.rightButton.setVisible(true)
      if (this.currPageIndex === 0) {
        this.leftButton.setVisible(false)
      }
      const lastPageIndex =
        Math.round(allTeamsExceptPlayer.length / TeamsToTradeWithScreen.PAGE_SIZE) - 1
      if (this.currPageIndex === lastPageIndex) {
        this.rightButton.setVisible(false)
      }
    }
    if (this.teamsToTradeWith.length > 0) {
      this.teamsToTradeWith.forEach((row) => {
        row.destroy()
      })
      this.teamsToTradeWith = []
    }
    const teamsOnCurrPage = allTeamsExceptPlayer.slice(
      this.currPageIndex * TeamsToTradeWithScreen.PAGE_SIZE,
      this.currPageIndex * TeamsToTradeWithScreen.PAGE_SIZE + TeamsToTradeWithScreen.PAGE_SIZE
    )
    let yPos = 100
    teamsOnCurrPage.forEach((team: TeamConfig) => {
      const teamToTradeWith = new TeamToTradeWith(this.scene, {
        teamConfig: team,
        onViewRoster: () => {
          const rosterData: RosterScreenData = {
            shouldShowTradeButton: true,
            teamToRender: team,
            titleText: `${team.name} Roster`,
            shouldShowBackButton: true,
          }
          this.scene.renderActiveScreen(ScreenKeys.TEAM_ROSTER, rosterData)
        },
        position: {
          x: RoundConstants.TEAM_MGMT_SIDEBAR_WIDTH + 30,
          y: yPos,
        },
      })
      this.teamsToTradeWith.push(teamToTradeWith)
      yPos += 60
    })
  }

  onRender(data?: any): void {
    if (this.leftButton && this.rightButton) {
      const allTeamsExceptPlayer = this.getAllTeamsExceptPlayer()
      this.leftButton.setVisible(true)
      this.rightButton.setVisible(true)
      if (this.currPageIndex === 0) {
        this.leftButton.setVisible(false)
      }
      const lastPageIndex =
        Math.round(allTeamsExceptPlayer.length / TeamsToTradeWithScreen.PAGE_SIZE) - 1
      if (this.currPageIndex === lastPageIndex) {
        this.rightButton.setVisible(false)
      }
    }
  }

  setVisible(isVisible: boolean): void {
    this.titleText.setVisible(isVisible)
    this.teamsToTradeWith.forEach((t) => {
      t.setVisible(isVisible)
    })
    this.leftButton.setVisible(isVisible)
    this.rightButton.setVisible(isVisible)
  }
}
