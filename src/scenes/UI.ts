import { Agent, Side } from '~/core/Agent'
import { States } from '~/core/states/States'
import { Timer } from '~/core/Timer'
import { AgentInfoBox } from '~/core/ui/AgentInfoBox'
import { Button } from '~/core/ui/Button'
import { Utility } from '~/core/utility/Utility'
import { UtilityKey } from '~/core/utility/UtilityKey'
import { Constants, RoundState } from '~/utils/Constants'
import Game from './Game'

export enum CommandState {
  MOVE = 'MOVE',
  HOLD = 'HOLD',
  STOP_HOLD = 'STOP_HOLD',
  PEEK = 'PEEK',
  PLANT = 'PLANT',
  DEFUSE = 'DEFUSE',
  Q_UTILITY = 'Q_UTILITY',
  W_UTILITY = 'W_UTILITY',
  E_UTILITY = 'E_UTILITY',
}

export default class UI extends Phaser.Scene {
  private static _instance: UI
  // Commands
  public currCommandState: CommandState = CommandState.MOVE
  private commandMapping: {
    [key in CommandState]?: {
      boundingBox: Phaser.GameObjects.Rectangle
      icon: Phaser.GameObjects.Image
      shortcutText: Phaser.GameObjects.Text
      triggerOnPress: boolean
    }
  }
  private commandShortcutMapping: {
    [key: string]: CommandState
  }
  // Utility
  private utilityKeyMapping: {
    [key in UtilityKey]?: {
      boundingBox: Phaser.GameObjects.Rectangle
      icon: Phaser.GameObjects.Image
      shortcutText: Phaser.GameObjects.Text
      charges: Phaser.GameObjects.Arc[]
    }
  }
  private utilityShortcutMapping: {
    [key: string]: UtilityKey
  }
  public timer!: Timer
  public playerScoreText!: Phaser.GameObjects.Text
  public playerTeamLabel!: Phaser.GameObjects.Text
  public cpuScoreText!: Phaser.GameObjects.Text
  public cpuTeamLabel!: Phaser.GameObjects.Text

  public playerSidebarTeamLabel!: Phaser.GameObjects.Text
  public cpuSidebarTeamLabel!: Phaser.GameObjects.Text
  public didRenderPlayerAgentInfoBoxes: boolean = false
  public didRenderCPUAgentInfoBoxes: boolean = false

  public agentInfoBoxMapping: {
    [key: string]: AgentInfoBox
  } = {}
  public fireOnSightToggleSwitch: any
  private didInitialSetup: boolean = false

  constructor() {
    super('ui')
    this.commandMapping = {}
    this.commandShortcutMapping = {}
    this.utilityKeyMapping = {}
    this.utilityShortcutMapping = {}
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
    shortcut: string,
    triggerOnPress: boolean = false
  ) {
    const boundingBox = this.add.rectangle(x, y, 36, 36, 0xffffff)
    boundingBox.setOrigin(0, 0.5)
    boundingBox.setStrokeStyle(1, 0x000000)
    const icon = this.add.image(x, y, texture)
    boundingBox.setInteractive()
    boundingBox.on(Phaser.Input.Events.POINTER_DOWN, (e) => {
      if (!triggerOnPress) {
        this.selectNewCommand(commandState)
      }
    })
    const shortcutText = this.add
      .text(boundingBox.x + 15, boundingBox.y - 30, shortcut)
      .setFontSize(12)
      .setColor('#000000')
    const command = {
      boundingBox: boundingBox,
      icon: icon,
      shortcutText,
      triggerOnPress,
    }
    this.commandMapping[commandState] = command
    this.commandShortcutMapping[shortcut] = commandState
    return command
  }

  createUtilityIcon(texture: string, x: number, y: number, key: UtilityKey, shortcut: string) {
    const boundingBox = this.add.rectangle(x, y, 32, 32, 0xffffff)
    boundingBox.setOrigin(0, 0.5)
    boundingBox.setStrokeStyle(1, 0x000000)
    const icon = this.add.image(x, y, texture).setVisible(false)
    const shortcutText = this.add
      .text(boundingBox.x + 15, boundingBox.y - 30, shortcut)
      .setFontSize(12)
      .setColor('#000000')
    const command = {
      boundingBox: boundingBox,
      icon: icon,
      shortcutText,
      charges: [],
    }
    this.utilityKeyMapping[key] = command
    this.utilityShortcutMapping[shortcut] = key
    return command
  }

  selectNewCommand(newCommandState: CommandState) {
    // If the user is not selecting the current spike carrier, they cannot plant
    if (newCommandState === CommandState.PLANT) {
      if (!this.canPlantSpike()) {
        return
      }
    }

    // If the spike is not planted yet, the user cannot defuse
    if (newCommandState === CommandState.DEFUSE) {
      if (!Game.instance.spike.isPlanted) {
        return
      }
    }

    const prevCommandBox = this.commandMapping[this.currCommandState]!.boundingBox
    const newCommandBox = this.commandMapping[newCommandState]!.boundingBox
    if (prevCommandBox && this.currCommandState !== newCommandState) {
      prevCommandBox.setStrokeStyle(1, 0x000000)
      prevCommandBox.setFillStyle(0xffffff)
    }
    if (newCommandBox) {
      newCommandBox.setFillStyle(0xffff00)
    }
    this.currCommandState = newCommandState
  }

  selectNewUtility(utilityKey: UtilityKey) {
    if (Game.instance.player) {
      const currUtilityKey = Game.instance.player.currUtilityKey
      if (currUtilityKey) {
        const prevUtilityBox = this.utilityKeyMapping[currUtilityKey]!.boundingBox
        if (prevUtilityBox && currUtilityKey !== utilityKey) {
          prevUtilityBox.setStrokeStyle(1, 0x000000)
          prevUtilityBox.setFillStyle(0xffffff)
        }
      }
      const newUtilityBox = this.utilityKeyMapping[utilityKey]!.boundingBox
      if (newUtilityBox) {
        newUtilityBox.setFillStyle(0xffff00)
      }

      Game.instance.player.handleUtilityPress(utilityKey)
    }
  }

  canPlantSpike() {
    return !Game.instance.spike.isPlanted && this.isSelectingSpikeCarrier()
  }

  createCommandBar() {
    const backgroundRectangle = this.add
      .rectangle(
        0,
        Constants.MAP_HEIGHT + Constants.BOTTOM_BAR_HEIGHT,
        Constants.MAP_WIDTH,
        Constants.BOTTOM_BAR_HEIGHT
      )
      .setOrigin(0)
    backgroundRectangle.setFillStyle(0xdddddd)
  }

  create() {
    this.createCommandBar()
    this.createTopBar()
    this.createSideBar()
  }

  createFireOnSightToggle() {
    const fireOnSightText = this.add
      .text(20, Constants.WINDOW_HEIGHT - 30, 'Auto Fire', {
        color: '#000000',
        fontSize: '12px',
      })
      .setOrigin(0, 0.5)
    this.fireOnSightToggleSwitch = this.add.rexToggleSwitch(
      fireOnSightText.x + fireOnSightText.displayWidth + 25,
      Constants.WINDOW_HEIGHT - 30,
      36,
      36,
      0xff0000,
      {
        trackHeight: 0.5,
        thumbHeight: 0.51,
      }
    )
    this.fireOnSightToggleSwitch.on('valuechange', (value) => {
      if (Game.instance.player && Game.instance.player.selectedAgent) {
        Game.instance.player.selectedAgent.fireOnSight = value
      }
    })
  }

  createSideBar() {
    this.add
      .rectangle(
        Constants.MAP_WIDTH,
        0,
        Constants.RIGHT_BAR_WIDTH,
        Constants.WINDOW_HEIGHT,
        0x000000
      )
      .setOrigin(0, 0)
      .setDepth(Constants.SORT_LAYERS.UI)

    this.playerSidebarTeamLabel = this.add
      .text(Constants.MAP_WIDTH + 10, 10, 'Player', {
        fontSize: '16px',
        color: 'white',
      })
      .setDepth(Constants.SORT_LAYERS.UI)

    this.cpuSidebarTeamLabel = this.add
      .text(Constants.MAP_WIDTH + 10, Constants.WINDOW_HEIGHT / 2 + 10, 'CPU', {
        fontSize: '16px',
        color: 'white',
      })
      .setDepth(Constants.SORT_LAYERS.UI)
  }

  renderAgentsInfoBoxes(agents: Agent[], startingY: number) {
    let startY = startingY
    agents.forEach((agent) => {
      this.agentInfoBoxMapping[agent.name] = new AgentInfoBox(this, {
        agent,
        position: {
          x: Constants.MAP_WIDTH + 10,
          y: startY,
        },
      })
      startY += 90
    })
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
      Game.instance.scoreMapping[Side.PLAYER].toString(),
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
      Game.instance.scoreMapping[Side.CPU].toString(),
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

  initialPlayerSetup() {
    if (!this.didInitialSetup) {
      if (
        Game.instance.player &&
        Game.instance.cpu &&
        Game.instance.cpu.agents &&
        Game.instance.player.selectedAgent
      ) {
        this.renderAgentsInfoBoxes(Game.instance.player.agents, 30)
        this.renderAgentsInfoBoxes(Game.instance.cpu.agents, Constants.WINDOW_HEIGHT / 2 + 30)
        this.didInitialSetup = true
      }
    }
  }

  updateScores() {
    this.playerScoreText.setText(Game.instance.scoreMapping[Side.PLAYER].toString())
    this.playerScoreText.setPosition(
      this.timer.clockText.x - this.playerScoreText.displayWidth - 30,
      this.timer.clockText.y - 5
    )
    this.playerTeamLabel.setPosition(
      this.playerScoreText.x - this.playerTeamLabel.displayWidth - 15,
      this.playerScoreText.y + 7
    )
    this.cpuScoreText.setText(Game.instance.scoreMapping[Side.CPU].toString())
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
        this.timer.setTime(Constants.MID_ROUND_TIME_SEC)
        this.timer.start()
        game.roundState = RoundState.MID_ROUND
        game.dropBarriers()
        break
      }
      case RoundState.MID_ROUND: {
        this.renderEndOfRoundMessage()
        game.roundState = RoundState.POSTROUND
        break
      }
    }
  }

  renderEndOfRoundMessage() {
    const rectangle = this.add.rectangle(Constants.MAP_WIDTH / 2, Constants.WINDOW_HEIGHT / 2, 0, 0)
    rectangle.setFillStyle(0xffffff)
    this.tweens.add({
      targets: [rectangle],
      width: {
        from: 0,
        to: 300,
      },
      height: {
        from: 0,
        to: 200,
      },
      duration: 200,
      onUpdate: () => {
        rectangle.setPosition(
          Constants.MAP_WIDTH / 2 - rectangle.width / 2,
          Constants.WINDOW_HEIGHT / 2 - rectangle.height / 2
        )
      },
      onComplete: () => {
        const scoreMapping = Game.instance.scoreMapping
        let titleText = ''
        if (scoreMapping[Side.PLAYER] === scoreMapping[Side.CPU]) {
          titleText = "It's a tie!"
        } else {
          const winningSide = scoreMapping[Side.PLAYER] > scoreMapping[Side.CPU] ? 'Player' : 'CPU'
          titleText = `${winningSide} won!`
        }
        const subtitleText = `${scoreMapping[Side.PLAYER]} - ${scoreMapping[Side.CPU]}`
        const textObj = this.add.text(
          Constants.MAP_WIDTH / 2,
          Constants.WINDOW_HEIGHT / 2.25,
          titleText,
          {
            fontSize: '30px',
            color: 'black',
          }
        )
        textObj.setPosition(
          textObj.x - textObj.displayWidth / 2,
          textObj.y - textObj.displayHeight / 2
        )
        const subtitleTextObj = this.add.text(
          Constants.MAP_WIDTH / 2,
          textObj.y + textObj.displayHeight + 20,
          subtitleText,
          {
            fontSize: '20px',
            color: 'black',
          }
        )
        subtitleTextObj.setPosition(
          subtitleTextObj.x - subtitleTextObj.displayWidth / 2,
          subtitleTextObj.y - subtitleTextObj.displayHeight / 2
        )

        const buttonObj = new Button({
          x: Constants.MAP_WIDTH / 2,
          y: subtitleTextObj.y + subtitleTextObj.displayHeight + 25,
          width: 100,
          height: 25,
          text: 'Continue',
          onClick: () => {
            // Hide the window
            rectangle.destroy()
            textObj.destroy()
            subtitleTextObj.destroy()
            buttonObj.destroy()

            // Reset back to preround state
            Game.instance.roundState = RoundState.PREROUND
            this.timer.setTime(Constants.PREROUND_TIME_SEC)
            this.timer.start()
            Game.instance.restartRound()
          },
          scene: this,
          backgroundColor: 0x222222,
          textColor: '#ffffff',
        })
      },
    })
  }

  update() {
    this.initialPlayerSetup()
    this.updateAllAgentInfoBoxes()
  }

  updateSelectedAgentFireOnSightToggleSwitch() {
    // Render fire on sight toggle
    if (Game.instance.player && Game.instance.player.selectedAgent) {
      this.fireOnSightToggleSwitch.setValue(Game.instance.player.selectedAgent.fireOnSight)
    }
  }

  updateAllAgentInfoBoxes() {
    // Render agent info boxes
    if (Game.instance.player && Game.instance.player.agents) {
      this.updateAgentInfoBoxes(Game.instance.player.agents, Side.PLAYER)
    }
    if (Game.instance.cpu && Game.instance.cpu.agents) {
      this.updateAgentInfoBoxes(Game.instance.cpu.agents, Side.CPU)
    }
  }

  updateSelectedAgentCommandState() {
    if (Game.instance.attackSide === Side.PLAYER) {
      const commandBtn = this.commandMapping[CommandState.PLANT]!.boundingBox
      const commandIcon = this.commandMapping[CommandState.PLANT]!.icon
      if (this.isSelectingSpikeCarrier()) {
        commandBtn.setAlpha(1)
        commandIcon.setAlpha(1)
      } else {
        commandBtn.setAlpha(0.25)
        commandIcon.setAlpha(0.25)
      }
    } else {
      if (Game.instance.player) {
        const selectedAgent = Game.instance.player.selectedAgent
        const commandBtn = this.commandMapping[CommandState.STOP_HOLD]!.boundingBox
        const commandIcon = this.commandMapping[CommandState.STOP_HOLD]!.icon
        commandBtn.setAlpha(selectedAgent.holdLocation ? 1 : 0.25)
        commandIcon.setAlpha(selectedAgent.holdLocation ? 1 : 0.25)
      }
    }
  }

  updateAgentInfoBoxes(agents: Agent[], side: Side) {
    Object.keys(this.agentInfoBoxMapping).forEach((agentName: string) => {
      const infoBox = this.agentInfoBoxMapping[agentName]
      if (infoBox) {
        infoBox.update()
      }
    })
  }

  isSelectingSpikeCarrier() {
    const player = Game.instance.player
    const selectedAgent = player.selectedAgent
    return selectedAgent.hasSpike
  }
}
