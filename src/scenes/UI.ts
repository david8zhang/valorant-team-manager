import { Constants } from '~/utils/Constants'
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
    const icon = this.add.image(x, y, texture)
    boundingBox.setInteractive()
    boundingBox.on(Phaser.Input.Events.POINTER_DOWN, (e) => {
      this.selectNewCommand(commandState)
    })
    this.commandMapping[commandState] = boundingBox
    const shortcutIcon = this.add
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
        } else {
          playOrPauseButton.setTexture('play')
          pauseOverlay.setVisible(true)
          Game.instance.pause()
        }
      }
    })
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
