import { Scene } from 'phaser'

export interface FinalsMatchupConfig {
  position: {
    x: number
    y: number
  }
  isPending: boolean
  width: number
  height: number
  team1: {
    teamName: string
    score: number | string
  }
  team2: {
    teamName: string
    score: number | string
  }
}

export class FinalsMatchup {
  private scene: Scene
  private team1Rect: Phaser.GameObjects.Rectangle
  private team1Name: Phaser.GameObjects.Text
  private team1Score: Phaser.GameObjects.Text

  private team2Rect: Phaser.GameObjects.Rectangle
  private team2Name: Phaser.GameObjects.Text
  private team2Score: Phaser.GameObjects.Text

  constructor(scene: Scene, config: FinalsMatchupConfig) {
    this.scene = scene
    this.team1Rect = this.scene.add
      .rectangle(config.position.x - config.width / 2 - 5, config.position.y, 200, 100, 0xffffff)
      .setStrokeStyle(1, config.isPending ? 0xbbbbbb : 0x000000)
    this.team1Name = this.scene.add
      .text(
        this.team1Rect.x - this.team1Rect.displayWidth / 2 + 15,
        config.position.y,
        `${config.team1.teamName}`,
        {
          fontSize: '30px',
          color: config.isPending ? '#bbb' : 'black',
        }
      )
      .setOrigin(0, 0.5)
    this.team1Score = this.scene.add
      .text(
        this.team1Rect.x + this.team1Rect.displayWidth / 2 - 15,
        config.position.y,
        `${config.team1.score}`,
        {
          fontSize: '30px',
          color: config.isPending ? '#bbb' : 'black',
        }
      )
      .setOrigin(1, 0.5)

    this.team2Rect = this.scene.add
      .rectangle(config.position.x + config.width / 2 + 5, config.position.y, 200, 100, 0xffffff)
      .setStrokeStyle(1, config.isPending ? 0xbbbbbb : 0x000000)
    this.team2Name = this.scene.add
      .text(
        this.team2Rect.x + this.team2Rect.displayWidth / 2 - 15,
        config.position.y,
        `${config.team2.teamName}`,
        {
          fontSize: '30px',
          color: config.isPending ? '#bbb' : 'black',
        }
      )
      .setOrigin(1, 0.5)
    this.team2Score = this.scene.add
      .text(
        this.team2Rect.x - this.team2Rect.displayWidth / 2 + 12,
        config.position.y,
        `${config.team1.score}`,
        {
          fontSize: '30px',
          color: config.isPending ? '#bbb' : 'black',
        }
      )
      .setOrigin(0, 0.5)
  }

  destroy() {
    this.team1Name.destroy()
    this.team1Rect.destroy()
    this.team1Score.destroy()
    this.team2Name.destroy()
    this.team2Rect.destroy()
    this.team2Score.destroy()
  }

  setVisible(isVisible: boolean) {
    this.team1Name.setVisible(isVisible)
    this.team1Rect.setVisible(isVisible)
    this.team1Score.setVisible(isVisible)
    this.team2Name.setVisible(isVisible)
    this.team2Rect.setVisible(isVisible)
    this.team2Score.setVisible(isVisible)
  }
}
