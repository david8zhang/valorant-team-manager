import { Agent, Side } from '~/core/Agent'
import { Timer } from '~/core/Timer'
import { AgentInfoBox } from '~/core/ui/AgentInfoBox'
import { Constants, RoundState } from '~/utils/Constants'
import Game from './Game'

export enum CommandState {
  MOVE = 'MOVE',
  HOLD = 'HOLD',
  STOP_HOLD = 'STOP_HOLD',
  PEEK = 'PEEK',
  PLANT = 'PLANT',
  DEFUSE = 'DEFUSE',
}

export default class UI extends Phaser.Scene {
  public currCommandState: CommandState = CommandState.MOVE
  private static _instance: UI
  private commandMapping: {
    [key in CommandState]?: {
      boundingBox: Phaser.GameObjects.Rectangle
      icon: Phaser.GameObjects.Image
      shortcutText: Phaser.GameObjects.Text
      triggerOnPress: boolean
    }
  }
  private shortcutMapping: {
    [key: string]: CommandState
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
    this.shortcutMapping[shortcut] = commandState
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

  canPlantSpike() {
    return !Game.instance.spike.isPlanted && this.isSelectingSpikeCarrier()
  }

  create() {
    this.createCommandBar()
    this.selectNewCommand(this.currCommandState)
    this.setupKeyboardShortcutListener()
    this.createTopBar()
    this.createSideBar()
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

  createCommandBar() {
    const backgroundRectangle = this.add
      .rectangle(
        0,
        Constants.MAP_HEIGHT + Constants.BOTTOM_BAR_HEIGHT,
        Constants.MAP_WIDTH,
        Constants.BOTTOM_BAR_HEIGHT
      )
      .setOrigin(0)

    const allCommands: {
      boundingBox: Phaser.GameObjects.Rectangle
      icon: Phaser.GameObjects.Image
      shortcutText: Phaser.GameObjects.Text
    }[] = []

    allCommands.push(
      this.createCommandIcon(
        'move-icon',
        Constants.MAP_WIDTH / 2,
        Constants.WINDOW_HEIGHT - 27,
        CommandState.MOVE,
        'A'
      )
    )
    allCommands.push(
      this.createCommandIcon(
        'watch-icon',
        Constants.MAP_WIDTH / 2,
        Constants.WINDOW_HEIGHT - 27,
        CommandState.HOLD,
        'S'
      )
    )
    allCommands.push(
      this.createCommandIcon(
        'stop-watch-icon',
        Constants.MAP_WIDTH / 2,
        Constants.WINDOW_HEIGHT - 27,
        CommandState.STOP_HOLD,
        'D',
        true
      )
    )

    allCommands.push(
      this.createCommandIcon(
        'peek-icon',
        Constants.MAP_WIDTH / 2,
        Constants.WINDOW_HEIGHT - 27,
        CommandState.PEEK,
        'F'
      )
    )

    // Render Plant icon or Defuse icon based on player side
    const dCommand =
      Game.instance.attackSide === Side.PLAYER ? CommandState.PLANT : CommandState.DEFUSE
    allCommands.push(
      this.createCommandIcon(
        'plant-icon',
        Constants.MAP_WIDTH / 2,
        Constants.WINDOW_HEIGHT - 27,
        dCommand,
        'G'
      )
    )
    const totalWidth = allCommands.length * 36 + (allCommands.length - 1) * 12
    let startX = Constants.MAP_WIDTH / 2 - totalWidth / 2
    allCommands.forEach((command) => {
      command.boundingBox.setX(startX)
      console.log(command.icon.displayWidth)
      command.icon.setX(startX + 18)
      command.shortcutText.setPosition(command.boundingBox.x + 28, command.boundingBox.y - 30)
      startX += 48
    })
    backgroundRectangle.setFillStyle(0xdddddd)
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

  plantSpike() {
    this.timer.stop()
    this.timer.setTime(Constants.POSTPLANT_ROUND_TIME_SEC)
    this.timer.start()
  }

  setupKeyboardShortcutListener() {
    this.input.keyboard.on(Phaser.Input.Keyboard.Events.ANY_KEY_DOWN, (e) => {
      const keyPressed = e.key.toUpperCase()
      const commandState = this.shortcutMapping[keyPressed]
      if (commandState) {
        const commandObj = this.commandMapping[commandState]!
        if (!commandObj.triggerOnPress) {
          this.selectNewCommand(commandState)
        }
      }
    })
  }

  update() {
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
      const commandBtn = this.commandMapping[CommandState.DEFUSE]!.boundingBox
      const commandIcon = this.commandMapping[CommandState.DEFUSE]!.icon
      if (Game.instance.spike.isPlanted || Game.instance.spike.isDefused) {
        commandBtn.setAlpha(1)
        commandIcon.setAlpha(1)
      } else {
        commandBtn.setAlpha(0.25)
        commandIcon.setAlpha(0.25)
      }

      if (Game.instance.player) {
        const selectedAgent = Game.instance.player.selectedAgent
        const commandBtn = this.commandMapping[CommandState.STOP_HOLD]!.boundingBox
        const commandIcon = this.commandMapping[CommandState.STOP_HOLD]!.icon
        commandBtn.setAlpha(selectedAgent.holdLocation ? 1 : 0.25)
        commandIcon.setAlpha(selectedAgent.holdLocation ? 1 : 0.25)
      }
    }

    // Render agent info boxes
    if (Game.instance.player && Game.instance.player.agents) {
      if (!this.didRenderPlayerAgentInfoBoxes) {
        this.didRenderPlayerAgentInfoBoxes = true
        this.renderAgentsInfoBoxes(Game.instance.player.agents, 30)
      } else {
        this.updateAgentInfoBoxes(Game.instance.player.agents, Side.PLAYER)
      }
    }
    if (Game.instance.cpu && Game.instance.cpu.agents) {
      if (!this.didRenderCPUAgentInfoBoxes) {
        this.didRenderCPUAgentInfoBoxes = true
        this.renderAgentsInfoBoxes(Game.instance.cpu.agents, Constants.WINDOW_HEIGHT / 2 + 30)
      } else {
        this.updateAgentInfoBoxes(Game.instance.cpu.agents, Side.CPU)
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
