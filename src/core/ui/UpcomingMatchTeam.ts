import TeamMgmt, { TeamConfig } from '~/scenes/TeamMgmt'

export interface UpcomingMatchTeamConfig {
  teamConfig: TeamConfig
  position: {
    x: number
    y: number
  }
}

export class UpcomingMatchTeam {
  private scene: TeamMgmt
  private teamNameText: Phaser.GameObjects.Text
  private teamImage: Phaser.GameObjects.Image
  private teamRecordText: Phaser.GameObjects.Text

  constructor(scene: TeamMgmt, config: UpcomingMatchTeamConfig) {
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
    this.teamRecordText = this.scene.add.text(
      this.teamNameText.x,
      this.teamNameText.y,
      `${teamConfig.wins}W - ${teamConfig.losses}L`,
      {
        fontSize: '15px',
        color: 'black',
      }
    )
    this.teamRecordText.setPosition(
      this.teamImage.x - this.teamRecordText.displayWidth / 2,
      this.teamNameText.y +
        this.teamNameText.displayHeight +
        15 -
        this.teamRecordText.displayHeight / 2
    )
  }

  setVisible(isVisible: boolean) {
    this.teamNameText.setVisible(isVisible)
    this.teamRecordText.setVisible(isVisible)
    this.teamImage.setVisible(isVisible)
  }

  public updateTeamInfo(teamConfig: TeamConfig) {
    this.teamNameText.setText(teamConfig.name)

    const yPos = this.teamImage.y + this.teamImage.displayHeight / 2 + 20
    this.teamNameText.setPosition(
      this.teamImage.x - this.teamNameText.displayWidth / 2,
      yPos - this.teamNameText.displayHeight / 2
    )
    this.teamRecordText.setText(`${teamConfig.wins}W - ${teamConfig.losses}L`)
    this.teamRecordText.setPosition(
      this.teamImage.x - this.teamRecordText.displayWidth / 2,
      this.teamNameText.y +
        this.teamNameText.displayHeight +
        15 -
        this.teamRecordText.displayHeight / 2
    )
  }
}
