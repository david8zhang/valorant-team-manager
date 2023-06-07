import { Scene } from 'phaser'

export interface MatchupConfig {
  hasStarted: boolean
  position: {
    x: number
    y: number
  }
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
  fontSize?: string
}

export class Matchup {
  private scene: Scene
  private team1ShortNameText: Phaser.GameObjects.Text
  private team1ScoreText: Phaser.GameObjects.Text

  private team2ShortNameText: Phaser.GameObjects.Text
  private team2ScoreText: Phaser.GameObjects.Text
  private matchupRect: Phaser.GameObjects.Rectangle
  private matchupDivider: Phaser.GameObjects.Line

  constructor(scene: Scene, config: MatchupConfig) {
    this.scene = scene
    this.matchupRect = this.scene.add
      .rectangle(config.position.x, config.position.y, config.width, config.height)
      .setOrigin(0, 0.5)
    this.matchupRect.setStrokeStyle(1, config.hasStarted ? 0x000 : 0xbbbbbb)

    this.matchupDivider = this.scene.add.line(
      0,
      0,
      config.position.x,
      config.position.y,
      config.position.x + this.matchupRect.displayWidth,
      config.position.y,
      config.hasStarted ? 0x000 : 0xbbbbbb
    )
    this.matchupDivider.setStrokeStyle(1, config.hasStarted ? 0x000 : 0xbbbbbb).setOrigin(0)

    const res1 = this.createTeamNameScoreRow(
      {
        x: config.position.x,
        y: config.position.y - 5,
      },
      config.team1,
      config
    )
    this.team1ScoreText = res1.teamScoreText
    this.team1ShortNameText = res1.teamShortNameText

    const res2 = this.createTeamNameScoreRow(
      {
        x: config.position.x,
        y: config.position.y + this.matchupRect.displayHeight / 2 - 5,
      },
      config.team2,
      config
    )
    this.team2ScoreText = res2.teamScoreText
    this.team2ShortNameText = res2.teamShortNameText
  }

  createTeamNameScoreRow(
    position: { x: number; y: number },
    team: {
      teamName: string
      score: number | string
    },
    config: MatchupConfig
  ) {
    const teamShortNameText = this.scene.add
      .text(position.x, position.y, `${team.teamName}`, {
        fontSize: config.fontSize ? config.fontSize : '20px',
        color: config.hasStarted ? 'black' : '#bbb',
      })
      .setOrigin(0, 1)
    teamShortNameText.setPosition(position.x + 15, position.y - teamShortNameText.displayHeight / 2)
    const teamScoreText = this.scene.add
      .text(position.x + this.matchupRect.displayWidth - 15, position.y, `${team.score}`, {
        fontSize: config.fontSize ? config.fontSize : '20px',
        color: config.hasStarted ? 'black' : '#bbb',
      })
      .setOrigin(1, 1)
    teamScoreText.setPosition(teamScoreText.x, teamScoreText.y - teamScoreText.displayHeight / 2)
    return {
      teamScoreText,
      teamShortNameText,
    }
  }

  destroy() {
    this.team1ScoreText.destroy()
    this.team1ShortNameText.destroy()
    this.team2ScoreText.destroy()
    this.team2ShortNameText.destroy()
    this.matchupRect.destroy()
    this.matchupDivider.destroy()
  }

  setVisible(isVisible: boolean) {
    this.team1ScoreText.setVisible(isVisible)
    this.team1ShortNameText.setVisible(isVisible)
    this.team2ScoreText.setVisible(isVisible)
    this.team2ShortNameText.setVisible(isVisible)
    this.matchupRect.setVisible(isVisible)
    this.matchupDivider.setVisible(isVisible)
  }
}
