import { Sidebar } from '~/core/ui/Sidebar'
import { HomeScreen } from '~/core/ui/screens/HomeScreen'
import { ScreenKeys } from '~/core/ui/screens/ScreenKeys'
import { Constants } from '~/utils/Constants'

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

  create() {
    this.screens = {
      [ScreenKeys.HOME]: new HomeScreen(this),
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
          onClick: () => {},
        },
        {
          text: 'Season',
          onClick: () => {},
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
    newActiveScreen.setVisible(true)
  }
}
