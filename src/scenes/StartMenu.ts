import { Scene } from 'phaser'
import { Button } from '~/core/ui/Button'
import { RoundConstants } from '~/utils/RoundConstants'
import { Save, SaveKeys } from '~/utils/Save'

export default class StartMenu extends Scene {
  constructor() {
    super('start')
  }

  create() {
    const titleScreenText = this.add.text(
      RoundConstants.WINDOW_WIDTH / 2,
      RoundConstants.WINDOW_HEIGHT / 2.5,
      'FPS Manager',
      {
        fontSize: '75px',
        color: 'white',
      }
    )
    titleScreenText.setPosition(
      RoundConstants.WINDOW_WIDTH / 2 - titleScreenText.displayWidth / 2,
      RoundConstants.WINDOW_HEIGHT / 2.5 - titleScreenText.displayHeight / 2
    )

    const startButton = new Button({
      text: 'Start',
      onClick: () => {
        const hasExistingSave = Save.getData(SaveKeys.ALL_TEAM_CONFIGS)
        if (!hasExistingSave) {
          this.scene.start('ftue')
        } else {
          this.scene.start('team-mgmt')
        }
      },
      backgroundColor: 0x555555,
      textColor: '#ffffff',
      width: 200,
      height: 50,
      fontSize: '25px',
      scene: this,
      x: RoundConstants.WINDOW_WIDTH / 2,
      y: titleScreenText.y + titleScreenText.displayHeight + 50,
    })
  }
}
