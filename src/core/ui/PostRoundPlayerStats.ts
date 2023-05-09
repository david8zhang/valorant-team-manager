import { Scene } from 'phaser'

export interface PostRoundPlayerStatsConfig {
  position: {
    x: number
    y: number
  }
  width: number
  height: number
  name: string
  stats: {
    kills: number
    deaths: number
    assists: number
    teamMvp: boolean
    matchMvp: boolean
  }
}

export class PostRoundPlayerStats {
  private scene: Scene
  private rectangle: Phaser.GameObjects.Rectangle
  private playerNameText: Phaser.GameObjects.Text
  private totalKillsText!: Phaser.GameObjects.Text
  private totalKillsAmt!: Phaser.GameObjects.Text

  private totalDeathsText!: Phaser.GameObjects.Text
  private totalDeathsAmt!: Phaser.GameObjects.Text

  private totalAssistsText!: Phaser.GameObjects.Text
  private totalAssistsAmt!: Phaser.GameObjects.Text

  private matchMVPText: Phaser.GameObjects.Text | null = null

  constructor(scene: Scene, config: PostRoundPlayerStatsConfig) {
    this.scene = scene
    this.rectangle = this.scene.add
      .rectangle(config.position.x, config.position.y, config.width, config.height)
      .setStrokeStyle(1, 0x000000)
      .setOrigin(0)
    this.playerNameText = this.scene.add.text(this.rectangle.x, this.rectangle.y, config.name, {
      fontSize: '24px',
      color: 'black',
    })
    this.playerNameText.setPosition(
      this.rectangle.x + this.rectangle.displayWidth / 2 - this.playerNameText.displayWidth / 2,
      this.rectangle.y + 200
    )
    this.setupKillsStatLine(config)
    this.setupAssistsStatLine(config)
    this.setupDeathsStatLine(config)
    this.setupMatchMVPText(config)
  }

  setupMatchMVPText(config: PostRoundPlayerStatsConfig) {
    if (config.stats.matchMvp) {
      this.matchMVPText = this.scene.add.text(
        this.playerNameText.x,
        this.playerNameText.y - this.rectangle.displayHeight / 2 + 15,
        'Match MVP',
        {
          fontSize: '15px',
          color: 'black',
        }
      )
    } else if (config.stats.teamMvp) {
      this.matchMVPText = this.scene.add.text(
        this.playerNameText.x,
        this.playerNameText.y,
        'Team MVP',
        {
          fontSize: '15px',
          color: 'black',
        }
      )
    }
  }

  setupDeathsStatLine(config: PostRoundPlayerStatsConfig) {
    this.totalDeathsText = this.scene.add.text(
      this.rectangle.x + 15,
      this.totalAssistsText.y + 30,
      'Deaths',
      {
        fontSize: '15px',
        color: 'black',
      }
    )
    this.totalDeathsAmt = this.scene.add
      .text(
        this.rectangle.x + this.rectangle.displayWidth - 15,
        this.totalDeathsText.y,
        `${config.stats.deaths}`,
        {
          fontSize: '15px',
          color: 'black',
        }
      )
      .setOrigin(1, 0)
    this.totalDeathsAmt.setPosition(
      this.rectangle.x + this.rectangle.displayWidth - 15,
      this.totalDeathsText.y
    )
  }

  setupKillsStatLine(config: PostRoundPlayerStatsConfig) {
    this.totalKillsText = this.scene.add.text(
      this.rectangle.x + 15,
      this.playerNameText.y + 50,
      'Kills',
      {
        fontSize: '15px',
        color: 'black',
      }
    )
    this.totalKillsAmt = this.scene.add
      .text(
        this.rectangle.x + this.rectangle.displayWidth - 15,
        this.totalKillsText.y,
        `${config.stats.kills}`,
        {
          fontSize: '15px',
          color: 'black',
        }
      )
      .setOrigin(1, 0)
    this.totalKillsAmt.setPosition(
      this.rectangle.x + this.rectangle.displayWidth - 15,
      this.totalKillsText.y
    )
  }

  setupAssistsStatLine(config: PostRoundPlayerStatsConfig) {
    this.totalAssistsText = this.scene.add.text(
      this.rectangle.x + 15,
      this.totalKillsText.y + 30,
      'Assists',
      {
        fontSize: '15px',
        color: 'black',
      }
    )
    this.totalAssistsAmt = this.scene.add
      .text(
        this.rectangle.x + this.rectangle.displayWidth - 15,
        this.totalAssistsText.y,
        `${config.stats.assists}`,
        {
          fontSize: '15px',
          color: 'black',
        }
      )
      .setOrigin(1, 0)
    this.totalAssistsAmt.setPosition(
      this.rectangle.x + this.rectangle.displayWidth - 15,
      this.totalAssistsText.y
    )
  }

  setVisible(isVisible: boolean) {
    this.rectangle.setVisible(isVisible)
    this.playerNameText.setVisible(isVisible)
    this.totalKillsText.setVisible(isVisible)
    this.totalKillsAmt.setVisible(isVisible)
    this.totalAssistsText.setVisible(isVisible)
    this.totalAssistsAmt.setVisible(isVisible)
    this.totalDeathsText.setVisible(isVisible)
    this.totalDeathsAmt.setVisible(isVisible)
    if (this.matchMVPText) {
      this.matchMVPText.setVisible(isVisible)
    }
  }
}
