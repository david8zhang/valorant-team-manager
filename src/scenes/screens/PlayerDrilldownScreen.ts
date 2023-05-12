import TeamMgmt from '../TeamMgmt'
import { Screen } from './Screen'

export class PlayerDrilldownScreen implements Screen {
  private scene: TeamMgmt

  constructor(scene: TeamMgmt) {
    this.scene = scene
  }

  onRender(data?: any): void {}
  setVisible(isVisible: boolean): void {}
}
