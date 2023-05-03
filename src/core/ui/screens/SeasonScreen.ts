import { Scene } from 'phaser'
import { Screen } from './Screen'
import TeamMgmt from '~/scenes/TeamMgmt'

export class SeasonScreen implements Screen {
  private scene: TeamMgmt
  constructor(scene: TeamMgmt) {
    this.scene = scene
  }

  onRender() {
    console.log('Went here!')
  }
  setVisible(isVisible: boolean) {}
}
