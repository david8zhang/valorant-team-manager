import { Scene } from 'phaser'
import TeamMgmt from '~/scenes/TeamMgmt'
import { Side } from '../Agent'
import { Constants } from '~/utils/Constants'

export interface PostRoundTeamStatsConfig {
  position: {
    x: number
    y: number
  }
  totalKills: {
    [key in Side]: number
  }
  totalDeaths: {
    [key in Side]: number
  }
  totalAssists: {
    [key in Side]: number
  }
}

export class PostRoundTeamStats {
  private scene: Scene
  private killsText!: Phaser.GameObjects.Text
  private assistsText!: Phaser.GameObjects.Text
  private deathsText!: Phaser.GameObjects.Text

  private playerKillsText!: Phaser.GameObjects.Text
  private cpuKillsText!: Phaser.GameObjects.Text

  private playerAssistsText!: Phaser.GameObjects.Text
  private cpuAssistsText!: Phaser.GameObjects.Text

  private playerDeathsText!: Phaser.GameObjects.Text
  private cpuDeathsText!: Phaser.GameObjects.Text

  private static LEFT_START_X = Constants.WINDOW_WIDTH / 2 - 125
  private static RIGHT_START_X = Constants.WINDOW_WIDTH / 2 + 125

  constructor(scene: Scene, config: PostRoundTeamStatsConfig) {
    this.scene = scene
    this.setupKillsStatLine(config)
    this.setupAssistsStatLine(config)
    this.setupDeathsStatLine(config)
  }

  setupDeathsStatLine(config: PostRoundTeamStatsConfig) {
    this.deathsText = this.scene.add.text(
      config.position.x,
      this.assistsText.y + this.assistsText.displayHeight + 30,
      'Deaths',
      {
        fontSize: '20px',
        color: 'black',
      }
    )
    this.deathsText.setPosition(
      this.deathsText.x - this.deathsText.displayWidth / 2,
      this.deathsText.y - this.deathsText.displayHeight / 2
    )
    this.playerDeathsText = this.scene.add.text(
      PostRoundTeamStats.LEFT_START_X,
      this.deathsText.y,
      `${config.totalDeaths.PLAYER}`,
      {
        fontSize: '25px',
        color: 'black',
      }
    )
    this.cpuDeathsText = this.scene.add.text(
      PostRoundTeamStats.RIGHT_START_X,
      this.deathsText.y,
      `${config.totalDeaths.CPU}`,
      {
        fontSize: '25px',
        color: 'black',
      }
    )

    this.playerDeathsText.setPosition(
      this.playerDeathsText.x - this.playerDeathsText.displayWidth / 2,
      this.playerDeathsText.y
    )
    this.cpuDeathsText.setPosition(
      this.cpuDeathsText.x - this.cpuDeathsText.displayWidth / 2,
      this.cpuDeathsText.y
    )
  }

  setupAssistsStatLine(config: PostRoundTeamStatsConfig) {
    this.assistsText = this.scene.add.text(
      config.position.x,
      this.killsText.y + this.killsText.displayHeight + 30,
      'Assists',
      {
        fontSize: '20px',
        color: 'black',
      }
    )
    this.assistsText.setPosition(
      this.assistsText.x - this.assistsText.displayWidth / 2,
      this.assistsText.y - this.assistsText.displayHeight / 2
    )
    this.playerAssistsText = this.scene.add.text(
      PostRoundTeamStats.LEFT_START_X,
      this.assistsText.y,
      `${config.totalAssists.PLAYER}`,
      {
        fontSize: '25px',
        color: 'black',
      }
    )
    this.cpuAssistsText = this.scene.add.text(
      PostRoundTeamStats.RIGHT_START_X,
      this.assistsText.y,
      `${config.totalAssists.CPU}`,
      {
        fontSize: '25px',
        color: 'black',
      }
    )

    this.playerAssistsText.setPosition(
      this.playerAssistsText.x - this.playerAssistsText.displayWidth / 2,
      this.playerAssistsText.y
    )
    this.cpuAssistsText.setPosition(
      this.cpuAssistsText.x - this.cpuAssistsText.displayWidth / 2,
      this.cpuAssistsText.y
    )
  }

  setupKillsStatLine(config: PostRoundTeamStatsConfig) {
    this.killsText = this.scene.add.text(config.position.x, config.position.y, 'Kills', {
      fontSize: '20px',
      color: 'black',
    })
    this.killsText.setPosition(
      this.killsText.x - this.killsText.displayWidth / 2,
      this.killsText.y - this.killsText.displayHeight / 2
    )
    this.playerKillsText = this.scene.add.text(
      PostRoundTeamStats.LEFT_START_X,
      this.killsText.y,
      `${config.totalKills.PLAYER}`,
      {
        fontSize: '25px',
        color: 'black',
      }
    )
    this.cpuKillsText = this.scene.add.text(
      PostRoundTeamStats.RIGHT_START_X,
      this.killsText.y,
      `${config.totalKills.CPU}`,
      {
        fontSize: '25px',
        color: 'black',
      }
    )

    this.playerKillsText.setPosition(
      this.playerKillsText.x - this.playerKillsText.displayWidth / 2,
      this.playerKillsText.y
    )
    this.cpuKillsText.setPosition(
      this.cpuKillsText.x - this.cpuKillsText.displayWidth / 2,
      this.cpuKillsText.y
    )
  }
}
