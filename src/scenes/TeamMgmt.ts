import { Sidebar } from '~/core/ui/Sidebar'
import { HomeScreen } from '~/core/ui/screens/HomeScreen'
import { ScreenKeys } from '~/core/ui/screens/ScreenKeys'
import { SeasonScreen } from '~/core/ui/screens/SeasonScreen'
import { Constants } from '~/utils/Constants'
import { Save, SaveKeys } from '~/utils/Save'
import { CPU_TEAM_NAMES } from '~/utils/TeamConstants'
import { Utilities } from '~/utils/Utilities'

export default class TeamMgmt extends Phaser.Scene {
  private sidebar!: Sidebar
  public static SIDEBAR_WIDTH = 200
  public static BODY_WIDTH = Constants.WINDOW_WIDTH - TeamMgmt.SIDEBAR_WIDTH
  public screens!: {
    [key in ScreenKeys]: any
  }
  public activeScreenKey: ScreenKeys = ScreenKeys.HOME

  constructor() {
    super('team-mgmt')
  }

  initializeNewGameData() {
    const newPlayers = this.generateNewPlayers()
    const teamConfigs = this.generateTeams()
    const winLossRecord = {
      wins: 0,
      losses: 0,
    }

    Save.setData(SaveKeys.PLAYER_AGENT_CONFIGS, newPlayers)
    Save.setData(SaveKeys.PLAYER_TEAM_NAME, Constants.TEAM_NAME_PLACEHOLDER)
    Save.setData(SaveKeys.PLAYER_TEAM_WIN_LOSS_RECORD, winLossRecord)
    Save.setData(SaveKeys.CPU_CONTROLLED_TEAM_CONFIGS, teamConfigs)
  }

  generateTeams() {
    const shuffledCPUTeamNames = Utilities.shuffle([...CPU_TEAM_NAMES])
    return shuffledCPUTeamNames.map((teamName) => {
      return {
        name: teamName,
        wins: 0,
        losses: 0,
      }
    })
  }

  generateNewPlayers() {
    const newPlayers: any[] = []
    for (let i = 1; i <= 3; i++) {
      newPlayers.push({
        name: `Agent-${i}`,
      })
    }
    return newPlayers
  }

  create() {
    this.initializeNewGameData()
    this.screens = {
      [ScreenKeys.HOME]: new HomeScreen(this),
      [ScreenKeys.SEASON]: new SeasonScreen(this),
    }
    this.add
      .rectangle(201, 0, Constants.WINDOW_WIDTH - 202, Constants.WINDOW_HEIGHT - 2)
      .setOrigin(0)
      .setStrokeStyle(1, 0x000000)
    this.cameras.main.setBackgroundColor('#ffffff')
    this.sidebar = new Sidebar(this, {
      width: TeamMgmt.SIDEBAR_WIDTH,
      options: [
        {
          text: 'Home',
          onClick: () => {
            this.renderActiveScreen(ScreenKeys.HOME)
          },
        },
        {
          text: 'Season',
          onClick: () => {
            this.renderActiveScreen(ScreenKeys.SEASON)
          },
        },
        {
          text: 'My Team',
          onClick: () => {},
        },
        {
          text: 'Front Office',
          onClick: () => {},
        },
      ],
    })
  }

  renderActiveScreen(newActiveScreenKey: ScreenKeys) {
    if (this.activeScreenKey) {
      const prevActiveScreen = this.screens[this.activeScreenKey]
      prevActiveScreen.setVisible(false)
    }
    this.activeScreenKey = newActiveScreenKey
    const newActiveScreen = this.screens[this.activeScreenKey]
    newActiveScreen.onRender()
    newActiveScreen.setVisible(true)
  }
}
