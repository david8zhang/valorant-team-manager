import TeamMgmt, { MatchConfig } from '~/scenes/TeamMgmt'
import { Constants } from '~/utils/Constants'

export interface SeasonScheduleConfig {
  schedule: MatchConfig[]
  currMatchIndex: number
}

export class SeasonSchedule {
  private scene: TeamMgmt
  private schedule: MatchConfig[]
  private pageIndex: number = 0
  private pageSize: number = 7

  private rightCarat!: Phaser.GameObjects.Image
  private leftCarat!: Phaser.GameObjects.Image

  private matchText: Phaser.GameObjects.Text[] = []

  constructor(scene: TeamMgmt, config: SeasonScheduleConfig) {
    this.scene = scene
    this.schedule = config.schedule
    this.setupSeasonSchedule()
  }

  setupSeasonSchedule() {
    const rectangle = this.scene.add
      .rectangle(
        Constants.TEAM_MGMT_SIDEBAR_WIDTH,
        0,
        Constants.WINDOW_WIDTH - Constants.TEAM_MGMT_SIDEBAR_WIDTH - 235,
        50
      )
      .setOrigin(0)
    rectangle.setStrokeStyle(1, 0x000000)
    this.leftCarat = this.scene.add
      .image(Constants.TEAM_MGMT_SIDEBAR_WIDTH, 10, 'backward')
      .setScale(0.5)
      .setOrigin(0)
      .setInteractive()
      .on(Phaser.Input.Events.POINTER_DOWN, () => {
        this.leftCarat.setAlpha(0.5)
      })
      .on(Phaser.Input.Events.POINTER_DOWN_OUTSIDE, () => {
        this.updateSchedulePage(-1)
        this.leftCarat.setAlpha(1)
      })
      .on(Phaser.Input.Events.POINTER_UP, () => {
        this.updateSchedulePage(-1)
        this.leftCarat.setAlpha(1)
      })
      .on(Phaser.Input.Events.POINTER_UP_OUTSIDE, () => {
        this.updateSchedulePage(-1)
        this.leftCarat.setAlpha(1)
      })

    this.rightCarat = this.scene.add
      .image(Constants.TEAM_MGMT_SIDEBAR_WIDTH + rectangle.displayWidth - 25, 10, 'forward')
      .setScale(0.5)
      .setOrigin(0)
      .setInteractive()
      .on(Phaser.Input.Events.POINTER_DOWN, () => {
        this.rightCarat.setAlpha(0.5)
      })
      .on(Phaser.Input.Events.POINTER_DOWN_OUTSIDE, () => {
        this.updateSchedulePage(1)
        this.rightCarat.setAlpha(1)
      })
      .on(Phaser.Input.Events.POINTER_UP, () => {
        this.updateSchedulePage(1)
        this.rightCarat.setAlpha(1)
      })
      .on(Phaser.Input.Events.POINTER_UP_OUTSIDE, () => {
        this.updateSchedulePage(1)
        this.rightCarat.setAlpha(1)
      })
    this.updateSchedulePage(0)
  }

  updateSchedulePage(amt: number) {
    this.matchText.forEach((text) => {
      text.destroy()
    })
    this.matchText = []
    let xPos = this.leftCarat.x + this.leftCarat.displayWidth / 2 + 25
    this.pageIndex += amt
    if (this.pageIndex == 0) {
      this.leftCarat.setVisible(false)
      this.rightCarat.setVisible(true)
    }
    if (this.pageIndex == this.schedule.length / this.pageSize - 1) {
      this.leftCarat.setVisible(true)
      this.rightCarat.setVisible(false)
    }

    const matches = this.schedule.slice(
      this.pageIndex * this.pageSize,
      this.pageIndex * this.pageSize + this.pageSize
    )

    matches.forEach((matchConfig: MatchConfig) => {
      const text = this.scene.add
        .text(xPos, this.rightCarat.y + 2, matchConfig.shortName, {
          fontSize: '20px',
          color: 'black',
        })
        .setOrigin(0)
      this.matchText.push(text)
      xPos += text.displayWidth + 20
    })
  }
}
