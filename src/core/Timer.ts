import { Scene } from 'phaser'
import { RoundConstants } from '~/utils/RoundConstants'

export interface TimerConfig {
  fontSize: string
  time: number
  onTimerExpired: Function
}

export class Timer {
  private game: Scene
  public clockText: Phaser.GameObjects.Text
  public currSeconds: number = -1
  public onTimerExpired: Function | null = null
  public timerEvent: Phaser.Time.TimerEvent

  constructor(game: Scene, config: TimerConfig) {
    this.game = game
    this.currSeconds = config.time
    this.clockText = this.game.add.text(0, 0, this.convertToClockString(this.currSeconds))
    this.clockText.setStyle({
      fontSize: config.fontSize,
    })
    this.onTimerExpired = config.onTimerExpired
    this.clockText.setPosition(RoundConstants.MAP_WIDTH / 2 - this.clockText.width / 2, 18)
    this.timerEvent = this.game.time.addEvent({
      callback: () => {
        this.decrementClock()
      },
      delay: 1000,
      repeat: -1,
    })
  }
  decrementClock() {
    this.currSeconds--
    this.clockText
      .setText(this.convertToClockString(this.currSeconds))
      .setPosition(RoundConstants.MAP_WIDTH / 2 - this.clockText.width / 2, 18)
    if (this.currSeconds === 0) {
      if (this.onTimerExpired) {
        this.timerEvent.paused = true
        this.onTimerExpired()
      }
    }
  }

  stop() {
    this.timerEvent.paused = true
  }

  start() {
    this.timerEvent.paused = false
  }

  setTime(time: number) {
    this.currSeconds = time
  }

  convertToClockString(seconds: number) {
    const numMinutes = Math.floor(seconds / 60)
    const numSeconds = seconds % 60
    return `${numMinutes}:${numSeconds < 10 ? `0${numSeconds}` : numSeconds}`
  }
}
