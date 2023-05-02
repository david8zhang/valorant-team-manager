import { Scene } from 'phaser'
import { Button } from '~/core/ui/Button'
import { Constants } from '~/utils/Constants'

export default class StartMenu extends Scene {
  constructor() {
    super('start')
  }

  create() {
    const titleScreenText = this.add.text(
      Constants.WINDOW_WIDTH / 2,
      Constants.WINDOW_HEIGHT / 2.5,
      'FPS Manager',
      {
        fontSize: '75px',
        color: 'white',
      }
    )
    titleScreenText.setPosition(
      Constants.WINDOW_WIDTH / 2 - titleScreenText.displayWidth / 2,
      Constants.WINDOW_HEIGHT / 2.5 - titleScreenText.displayHeight / 2
    )

    const startButton = new Button({
      text: 'Start',
      onClick: () => {
        this.scene.start('home')
      },
      backgroundColor: 0x555555,
      textColor: '#ffffff',
      width: 200,
      height: 50,
      fontSize: '25px',
      scene: this,
      x: Constants.WINDOW_WIDTH / 2,
      y: titleScreenText.y + titleScreenText.displayHeight + 50,
    })
  }
}
