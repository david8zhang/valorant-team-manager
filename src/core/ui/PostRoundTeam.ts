import { Scene } from 'phaser'
import TeamMgmt, { TeamConfig } from '~/scenes/TeamMgmt'

export interface PostRoundTeamconfig {
  teamConfig: TeamConfig
  position: {
    x: number
    y: number
  }
}

export class PostRoundTeam {
  private scene: Scene
  private teamNameText: Phaser.GameObjects.Text
  private teamImage: Phaser.GameObjects.Image

  constructor(scene: Scene, config: PostRoundTeamconfig) {
    this.scene = scene
    const { teamConfig, position } = config
    const { x, y } = position
    this.teamImage = this.scene.add.sprite(x, y, '')
    this.teamNameText = this.scene.add.text(
      this.teamImage.x,
      this.teamImage.y + this.teamImage.displayHeight / 2 + 20,
      teamConfig.name,
      {
        fontSize: '18px',
        color: 'black',
      }
    )
    this.teamNameText.setPosition(
      this.teamNameText.x - this.teamNameText.displayWidth / 2,
      this.teamNameText.y - this.teamNameText.displayHeight / 2
    )
  }

  setVisible(isVisible: boolean) {
    this.teamNameText.setVisible(isVisible)
    this.teamImage.setVisible(isVisible)
  }

  public updateTeamInfo(teamConfig: TeamConfig) {
    this.teamNameText.setText(teamConfig.name)

    const yPos = this.teamImage.y + this.teamImage.displayHeight / 2 + 20
    this.teamNameText.setPosition(
      this.teamImage.x - this.teamNameText.displayWidth / 2,
      yPos - this.teamNameText.displayHeight / 2
    )
  }
}
