import TeamMgmt, { MatchConfig } from '~/scenes/TeamMgmt'
import { RoundConstants } from '~/utils/RoundConstants'

export interface SeasonScheduleConfig {
  schedule: MatchConfig[]
  currMatchIndex: number
}

export class SeasonSchedule {
  private scene: TeamMgmt
  private schedule: MatchConfig[]
  private pageIndex: number = 0
  private pageSize: number = 6
  private rightCarat!: Phaser.GameObjects.Image
  private leftCarat!: Phaser.GameObjects.Image
  private matchText: Phaser.GameObjects.Text[] = []
  private rectangle!: Phaser.GameObjects.Rectangle
  private currMatchIndex: number = 0

  constructor(scene: TeamMgmt, config: SeasonScheduleConfig) {
    this.scene = scene
    this.schedule = config.schedule
    this.currMatchIndex = config.currMatchIndex
    this.setupSeasonSchedule()
  }

  setupSeasonSchedule() {
    this.rectangle = this.scene.add
      .rectangle(
        RoundConstants.TEAM_MGMT_SIDEBAR_WIDTH,
        0,
        RoundConstants.WINDOW_WIDTH - RoundConstants.TEAM_MGMT_SIDEBAR_WIDTH - 235,
        50
      )
      .setOrigin(0)
    this.rectangle.setStrokeStyle(1, 0x000000)
    this.leftCarat = this.scene.add
      .image(RoundConstants.TEAM_MGMT_SIDEBAR_WIDTH, 10, 'backward')
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
      .image(
        RoundConstants.TEAM_MGMT_SIDEBAR_WIDTH + this.rectangle.displayWidth - 25,
        10,
        'forward'
      )
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

  resetSeasonSchedule(schedule: MatchConfig[]) {
    this.currMatchIndex = 0
    this.pageIndex = 0
    this.schedule = schedule
    this.updateSchedulePage(0)
  }

  updateSchedulePage(amt: number) {
    this.matchText.forEach((text) => {
      text.destroy()
    })
    this.matchText = []
    let xPos = this.leftCarat.x + this.leftCarat.displayWidth / 2 + 25
    this.pageIndex += amt
    this.pageIndex = Math.max(0, this.pageIndex)
    this.pageIndex = Math.min(this.pageIndex, this.schedule.length / this.pageSize - 1)

    if (this.pageIndex === 0) {
      this.leftCarat.setVisible(false)
      this.rightCarat.setVisible(true)
    }
    if (this.pageIndex === this.schedule.length / this.pageSize - 1) {
      this.leftCarat.setVisible(true)
      this.rightCarat.setVisible(false)
    }

    const matches = this.schedule.slice(
      this.pageIndex * this.pageSize,
      this.pageIndex * this.pageSize + this.pageSize
    )
    matches.forEach((matchConfig: MatchConfig, index: number) => {
      const matchNum = index + this.pageIndex * this.pageSize
      const text = this.scene.add
        .text(xPos, this.rightCarat.y + 2, matchConfig.shortName, {
          fontSize: '20px',
          color: this.currMatchIndex > matchNum ? 'gray' : 'black',
        })
        .setOrigin(0)
      this.matchText.push(text)
      xPos += text.displayWidth + 30
    })
  }

  setVisible(isVisible: boolean) {
    this.matchText.forEach((matchText) => {
      matchText.setVisible(isVisible)
    })
    this.rectangle.setVisible(isVisible)
    this.leftCarat.setVisible(isVisible)
    this.rightCarat.setVisible(isVisible)
  }
}
