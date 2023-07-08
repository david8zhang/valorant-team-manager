import { Screen } from '../TeamMgmt/Screen'
import { FirstTime } from './FirstTime'

export class DraftStartingPlayersScreen implements Screen {
  private scene: FirstTime
  constructor(scene: FirstTime) {
    this.scene = scene
  }

  onRender(data?: any): void {}
  setVisible(isVisible: boolean): void {}
}
