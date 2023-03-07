import { Side } from '~/core/Agent'
import { Timer } from '~/core/Timer'
import { Constants, RoundState } from '~/utils/Constants'
import Game from './Game'

export enum CommandState {
  MOVE = 'MOVE',
  HOLD = 'HOLD',
}

export default class UI extends Phaser.Scene {
  public currCommandState: CommandState = CommandState.MOVE
  private static _instance: UI
  private commandMapping: {
    [key in CommandState]?: Phaser.GameObjects.Rectangle
  }
  private shortcutMapping: {
    [key: string]: CommandState
  }
  public timer!: Timer
  public playerScoreText!: Phaser.GameObjects.Text
  public playerTeamLabel!: Phaser.GameObjects.Text
  public cpuScoreText!: Phaser.GameObjects.Text
  public cpuTeamLabel!: Phaser.GameObjects.Text

  constructor() {
    super('ui')
    this.commandMapping = {}
    this.shortcutMapping = {}
    UI._instance = this
  }

  public static get instance() {
    return UI._instance
  }

  createCommandIcon(
    texture: string,
    x: number,
    y: number,
    commandState: CommandState,
    shortcut: string
  ) {
    const boundingBox = this.add.rectangle(x, y, 36, 36, 0xffffff)
    boundingBox.setStrokeStyle(1, 0x000000)
    this.add.image(x, y, texture)
    boundingBox.setInteractive()
    boundingBox.on(Phaser.Input.Events.POINTER_DOWN, (e) => {
      this.selectNewCommand(commandState)
    })
    this.commandMapping[commandState] = boundingBox
    this.add
      .text(boundingBox.x + 10, boundingBox.y - 30, shortcut)
      .setFontSize(12)
      .setColor('#000000')
    this.shortcutMapping[shortcut] = commandState
  }

  selectNewCommand(newCommandState: CommandState) {
    const prevCommandBox = this.commandMapping[this.currCommandState]
    const newCommandBox = this.commandMapping[newCommandState]
    if (prevCommandBox && this.currCommandState !== newCommandState) {
      prevCommandBox.setStrokeStyle(1, 0x000000)
      prevCommandBox.setFillStyle(0xffffff)
    }
    if (newCommandBox) {
      newCommandBox.setFillStyle(0xffff00)
    }
    this.currCommandState = newCommandState
  }

  create() {
    const backgroundRectangle = this.add
      .rectangle(
        0,
        Constants.MAP_HEIGHT + Constants.BOTTOM_BAR_HEIGHT,
        Constants.MAP_WIDTH,
        Constants.BOTTOM_BAR_HEIGHT
      )
      .setOrigin(0)
    this.createCommandIcon(
      'move-icon',
      Constants.WINDOW_WIDTH / 2 - 24,
      Constants.WINDOW_HEIGHT - 27,
      CommandState.MOVE,
      'A'
    )
    this.createCommandIcon(
      'watch-icon',
      Constants.WINDOW_WIDTH / 2 + 24,
      Constants.WINDOW_HEIGHT - 27,
      CommandState.HOLD,
      'S'
    )
    backgroundRectangle.setFillStyle(0xdddddd)
    this.selectNewCommand(this.currCommandState)
    this.setupKeyboardShortcutListener()

    this.createTopBar()
  }

  createTopBar() {
    this.timer = new Timer(this, {
      fontSize: '22px',
      onTimerExpired: () => {
        this.handleTimerExpired()
      },
      time: Constants.PREROUND_TIME_SEC,
    })

    // Setup player score text
    this.playerScoreText = this.add.text(
      this.timer.clockText.x,
      this.timer.clockText.y - 5,
      Game.instance.roundScoreMapping[Side.PLAYER].toString(),
      {
        fontSize: '30px',
      }
    )
    this.playerScoreText.setPosition(
      this.timer.clockText.x - this.playerScoreText.displayWidth - 30,
      this.timer.clockText.y - 5
    )
    this.playerTeamLabel = this.add
      .text(this.playerScoreText.x, this.playerScoreText.y, 'Player', {
        fontSize: '15px',
        align: 'center',
      })
      .setOrigin(0, 0)

    this.playerTeamLabel.setPosition(
      this.playerScoreText.x - this.playerTeamLabel.displayWidth - 15,
      this.playerScoreText.y + 7
    )

    // Setup CPU score text
    this.cpuScoreText = this.add.text(
      this.timer.clockText.x,
      this.timer.clockText.y - 5,
      Game.instance.roundScoreMapping[Side.CPU].toString(),
      {
        fontSize: '30px',
      }
    )
    this.cpuScoreText.setPosition(
      this.timer.clockText.x + this.timer.clockText.displayWidth + 30,
      this.timer.clockText.y - 5
    )
    this.cpuTeamLabel = this.add
      .text(this.cpuScoreText.x, this.cpuScoreText.y - 15, 'CPU', {
        fontSize: '15px',
        align: 'center',
      })
      .setOrigin(0, 0)
    this.cpuTeamLabel.setPosition(
      this.cpuScoreText.x + this.cpuScoreText.displayWidth + 15,
      this.cpuScoreText.y + 7
    )

    const playOrPauseButton = this.add.image(Constants.MAP_WIDTH - 30, 30, 'pause').setScale(0.75)
    const pauseOverlay = this.add
      .rectangle(
        0,
        Constants.TOP_BAR_HEIGHT,
        Constants.MAP_WIDTH,
        Constants.MAP_HEIGHT,
        0x000000,
        0.1
      )
      .setOrigin(0, 0)
      .setVisible(false)
    this.input.keyboard.on(Phaser.Input.Keyboard.Events.ANY_KEY_DOWN, (e) => {
      if (e.code === 'Space') {
        if (Game.instance.isPaused) {
          playOrPauseButton.setTexture('pause')
          pauseOverlay.setVisible(false)
          Game.instance.unPause()
          this.timer.start()
        } else {
          playOrPauseButton.setTexture('play')
          pauseOverlay.setVisible(true)
          Game.instance.pause()
          this.timer.stop()
        }
      }
    })
  }

  updateScores() {
    this.playerScoreText.setText(Game.instance.roundScoreMapping[Side.PLAYER].toString())
    this.playerScoreText.setPosition(
      this.timer.clockText.x - this.playerScoreText.displayWidth - 30,
      this.timer.clockText.y - 5
    )
    this.playerTeamLabel.setPosition(
      this.playerScoreText.x - this.playerTeamLabel.displayWidth - 15,
      this.playerScoreText.y + 7
    )
    this.cpuScoreText.setText(Game.instance.roundScoreMapping[Side.CPU].toString())
    this.cpuScoreText.setPosition(
      this.timer.clockText.x + this.timer.clockText.displayWidth + 30,
      this.timer.clockText.y - 5
    )
    this.cpuTeamLabel.setPosition(
      this.cpuScoreText.x + this.cpuScoreText.displayWidth + 15,
      this.cpuScoreText.y + 7
    )
  }

  handleTimerExpired() {
    const game = Game.instance
    switch (game.roundState) {
      case RoundState.PREROUND: {
        this.timer.setTime(Constants.PREPLANT_ROUND_TIME_SEC)
        this.timer.start()
        game.roundState = RoundState.PRE_PLANT_ROUND
        game.dropBarriers()
        break
      }
      case RoundState.PRE_PLANT_ROUND: {
        this.timer.setTime(Constants.POST_ROUND)
        this.timer.start()
        game.roundState = RoundState.POSTROUND
        game.plantTimeExpire()
        break
      }
      case RoundState.POST_PLANT_ROUND: {
        this.timer.setTime(Constants.POST_ROUND)
        this.timer.start()
        game.roundState = RoundState.POSTROUND
        game.detonateSpike()
        break
      }
      case RoundState.POSTROUND: {
        this.timer.setTime(Constants.PREROUND_TIME_SEC)
        game.restartRound()
        game.roundState = RoundState.PREROUND
        this.timer.start()
        break
      }
    }
  }

  endRoundPrematurely() {
    this.timer.stop()
    this.timer.setTime(Constants.POST_ROUND)
    this.timer.start()
  }

  setupKeyboardShortcutListener() {
    this.input.keyboard.on(Phaser.Input.Keyboard.Events.ANY_KEY_DOWN, (e) => {
      const keyPressed = e.key.toUpperCase()
      const commandState = this.shortcutMapping[keyPressed]
      if (commandState) {
        this.selectNewCommand(commandState)
      }
    })
  }
}
