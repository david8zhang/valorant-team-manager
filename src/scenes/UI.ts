import { Agent, Side } from '~/core/Agent'
import { Timer } from '~/core/Timer'
import { AgentInfoBox } from '~/core/ui/AgentInfoBox'
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

  create() {
    this.createCommandBar()
    this.createUtilityBar()
    this.selectNewCommand(this.currCommandState)
    this.setupKeyboardShortcutListener()
    this.createTopBar()
    this.createSideBar()
    this.createFireOnSightToggle()
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
    const fCommand =
      Game.instance.attackSide === Side.PLAYER ? CommandState.PLANT : CommandState.DEFUSE
    allCommands.push(
      this.createCommandIcon(
        'plant-icon',
        Constants.MAP_WIDTH / 2,
        Constants.WINDOW_HEIGHT - 27,
        fCommand,
        'F'
      )
    )
    const totalWidth = allCommands.length * 36 + (allCommands.length - 1) * 12
    let startX = Constants.MAP_WIDTH / 2.5 - totalWidth / 2
    allCommands.forEach((command) => {
      command.boundingBox.setX(startX)
      command.icon.setX(startX + 18)
      command.shortcutText.setPosition(command.boundingBox.x + 28, command.boundingBox.y - 30)
      startX += 48
    })
    backgroundRectangle.setFillStyle(0xdddddd)
  }

  createUtilityBar() {
    const allCommands = Object.keys(this.commandMapping)
    const totalWidth = allCommands.length * 36 + (allCommands.length - 1) * 12
    const endOfCommandBarX = Constants.MAP_WIDTH / 2.5 + totalWidth / 2
    this.add
      .line(
        0,
        0,
        endOfCommandBarX + 24,
        Constants.MAP_HEIGHT + Constants.TOP_BAR_HEIGHT,
        endOfCommandBarX + 24,
        Constants.WINDOW_HEIGHT
      )
      .setStrokeStyle(1, 0xaaaaaa)
      .setDepth(Constants.SORT_LAYERS.UI)
      .setOrigin(0, 0)
    let startX = endOfCommandBarX + 48
    const utilityCommands: any[] = []
    utilityCommands.push(
      this.createUtilityIcon('', startX, Constants.WINDOW_HEIGHT - 30, UtilityKey.Q, 'Q')
    )
    utilityCommands.push(
      this.createUtilityIcon('', startX, Constants.WINDOW_HEIGHT - 30, UtilityKey.W, 'W')
    )
    utilityCommands.push(
      this.createUtilityIcon('', startX, Constants.WINDOW_HEIGHT - 30, UtilityKey.E, 'E')
    )
    for (let i = 0; i < utilityCommands.length; i++) {
      const command = utilityCommands[i]
      command.boundingBox.setX(startX)
      command.icon.setX(startX + 18)
      command.shortcutText.setPosition(command.boundingBox.x + 28, command.boundingBox.y - 28)
      startX += 48
    }
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
        const agent = Game.instance.player.selectedAgent
        const utilityMapping = agent.utilityMapping
        Object.keys(utilityMapping).forEach((key) => {
          const utilityClass = utilityMapping[key] as Utility
          const utilityObj = this.utilityKeyMapping[key]
          this.createCharges(utilityClass, utilityObj)
        })
      }
    }
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

      // Handle commands
      const commandState = this.commandShortcutMapping[keyPressed]
      if (commandState) {
        const commandObj = this.commandMapping[commandState]!
        if (!commandObj.triggerOnPress) {
          this.selectNewCommand(commandState)
        }
      }

      // Handle utility
      const utilityKey = this.utilityShortcutMapping[keyPressed]
      if (utilityKey) {
        this.selectNewUtility(utilityKey)
      }

      if (e.key === 'x') {
        if (Game.instance.player && Game.instance.player.selectedAgent)
          this.fireOnSightToggleSwitch.setValue(!Game.instance.player.selectedAgent.fireOnSight)
      }
    })
  }

  update() {
    this.initialPlayerSetup()
    this.updateSelectedAgentCommandState()
    this.updateSelectedAgentUtility()
    this.updateAllAgentInfoBoxes()
    this.updateSelectedAgentFireOnSightToggleSwitch()
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
  }

  updateSelectedAgentUtility() {
    if (Game.instance.player && Game.instance.player.selectedAgent) {
      const utilityMapping = Game.instance.player.selectedAgent.utilityMapping
      Object.keys(utilityMapping).forEach((key) => {
        const utilityClass = utilityMapping[key] as Utility
        const utilityObj = this.utilityKeyMapping[key]
        utilityObj.boundingBox
          .setAlpha(utilityClass.isDepleted ? 0.25 : 1)
          .setStrokeStyle(1, 0x000000)
          .setFillStyle(0xffffff)

        utilityObj.charges.forEach((charge: Phaser.GameObjects.Arc, index: number) => {
          if (index + 1 > utilityClass.numCharges) {
            charge.setAlpha(0.2)
          } else {
            charge.setAlpha(1)
          }
        })
      })
    }
  }

  updateCharges(
    utility: Utility,
    utilityObj: { boundingBox: Phaser.GameObjects.Rectangle; charges: Phaser.GameObjects.Arc[] }
  ) {
    utilityObj.charges.forEach((charge: any, index: number) => {
      if (index + 1 < utility.numCharges) {
      }
    })
  }

  createCharges(
    utility: Utility,
    utilityObj: { boundingBox: Phaser.GameObjects.Rectangle; charges: Phaser.GameObjects.Arc[] }
  ) {
    utilityObj.charges.forEach((c) => c.destroy())
    const circleWidth = 6
    const padding = 5
    const totalWidth = utility.totalCharges * circleWidth + (utility.totalCharges - 1) * padding
    let xPos =
      utilityObj.boundingBox.x + (utilityObj.boundingBox.displayWidth / 2 + 2) - totalWidth / 2
    const charges: Phaser.GameObjects.Arc[] = []
    for (let i = 0; i < utility.totalCharges; i++) {
      const circle = this.add.circle(xPos, utilityObj.boundingBox.y + 23, circleWidth / 2, 0x222222)
      charges.push(circle)
      xPos += circleWidth + padding
    }
    utilityObj.charges = charges
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
