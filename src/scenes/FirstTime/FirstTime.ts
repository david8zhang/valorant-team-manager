import { RoundConstants } from '~/utils/RoundConstants'
import { FirstTimeScreenKeys } from './FirstTimeScreenKeys'
import { CreateTeamScreen } from './CreateTeamScreen'
import { DraftStartingPlayersScreen } from './DraftStartingPlayersScreen'

export class FirstTime extends Phaser.Scene {
  public screens!: {
    [key in FirstTimeScreenKeys]: any
  }
  public activeScreenKey: FirstTimeScreenKeys = FirstTimeScreenKeys.CREATE_TEAM
  public teamName: string = ''
  public teamShortName: string = ''

  constructor() {
    super('ftue')
  }

  create() {
    this.cameras.main.setBackgroundColor(0xffffff)
    const bgRect = this.add
      .rectangle(1, 0, RoundConstants.WINDOW_WIDTH - 2, RoundConstants.WINDOW_HEIGHT - 2)
      .setStrokeStyle(1, 0x000000)
      .setOrigin(0)
    this.screens = {
      [FirstTimeScreenKeys.CREATE_TEAM]: new CreateTeamScreen(this),
      [FirstTimeScreenKeys.DRAFT_STARTERS]: new DraftStartingPlayersScreen(this),
    }
    this.renderActiveScreen(FirstTimeScreenKeys.CREATE_TEAM)
  }

  renderActiveScreen(newActiveScreenKey: FirstTimeScreenKeys) {
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
