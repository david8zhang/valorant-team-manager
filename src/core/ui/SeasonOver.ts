import { Scene } from 'phaser'
import { TeamConfig } from '~/scenes/TeamMgmt'
import { Save, SaveKeys } from '~/utils/Save'
import { Button } from './Button'

export interface SeasonOverConfig {
  position: {
    x: number
    y: number
  }
  onContinue: Function
}

export class SeasonOver {
  private scene: Scene
  private seasonOverText!: Phaser.GameObjects.Text
  private seasonRecordText!: Phaser.GameObjects.Text
  private goToPostSeasonButton!: Button
  private config: SeasonOverConfig

  constructor(scene: Scene, config: SeasonOverConfig) {
    this.scene = scene
    this.config = config
    this.seasonOverText = this.scene.add.text(config.position.x, config.position.y, '', {
      fontSize: '30px',
      color: 'black',
    })
    this.seasonRecordText = this.scene.add.text(config.position.x, config.position.y, '', {
      fontSize: '18px',
      color: 'black',
    })
    this.goToPostSeasonButton = new Button({
      scene: this.scene,
      x: this.seasonRecordText.x,
      y: this.seasonRecordText.y + 150,
      width: 150,
      height: 30,
      fontSize: '12px',
      text: 'Continue',
      onClick: () => {
        config.onContinue()
      },
      strokeColor: 0x000000,
      strokeWidth: 1,
    })
    this.goToPostSeasonButton.setVisible(false)
  }

  display() {
    this.seasonOverText.setText('Season Over')
    this.seasonOverText.setPosition(
      this.config.position.x - this.seasonOverText.displayWidth / 2,
      this.config.position.y
    )
    const allTeams = Save.getData(SaveKeys.ALL_TEAM_CONFIGS) as { [key: string]: TeamConfig }
    const playerTeamConfig = allTeams[Save.getData(SaveKeys.PLAYER_TEAM_NAME)] as TeamConfig
    this.seasonRecordText.setText(`${playerTeamConfig.wins}W - ${playerTeamConfig.losses}L`)
    this.seasonRecordText.setPosition(
      this.config.position.x - this.seasonRecordText.displayWidth / 2,
      this.config.position.y + this.seasonOverText.displayHeight + 15
    )
  }

  setVisible(isVisible: boolean) {
    this.seasonOverText.setVisible(isVisible)
    this.seasonRecordText.setVisible(isVisible)
    this.goToPostSeasonButton.setVisible(isVisible)
  }
}
