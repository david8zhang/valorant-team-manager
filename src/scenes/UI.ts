import { Agent, Side } from '~/core/Agent'
import { Timer } from '~/core/Timer'
import { AgentInfoBox } from '~/core/ui/AgentInfoBox'
import { Button } from '~/core/ui/Button'
import { UtilityKey } from '~/core/utility/UtilityKey'
import { Constants, RoundState } from '~/utils/Constants'
import { GUN_CONFIGS } from '~/utils/GunConstants'
import Round from './Round'
import { TeamConfig } from './TeamMgmt'
import { Save, SaveKeys } from '~/utils/Save'

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

  private killMessageFeed: {
    killerNameText: Phaser.GameObjects.Text
    killedNameText: Phaser.GameObjects.Text
    gunSprite: Phaser.GameObjects.Sprite
    boundingRect: Phaser.GameObjects.Rectangle
    renderTimestamp: number
  }[] = []

  public cpuTeamConfig!: TeamConfig
  public calledCreate: boolean = false

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

  init(data: { cpuTeamConfig: TeamConfig }) {
    this.cpuTeamConfig = data.cpuTeamConfig
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
      if (!Round.instance.spike.isPlanted) {
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
    if (Round.instance.player) {
      const currUtilityKey = Round.instance.player.currUtilityKey
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

      Round.instance.player.handleUtilityPress(utilityKey)
    }
  }

  canPlantSpike() {
    return !Round.instance.spike.isPlanted && this.isSelectingSpikeCarrier()
  }

  create() {
    if (this.calledCreate) {
      Round.instance.roundState = RoundState.PREROUND
      this.timer.setTime(Constants.PREROUND_TIME_SEC)
      this.timer.start()
      Round.instance.restartRound()
    }
    this.calledCreate = true
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
      if (Round.instance.player && Round.instance.player.selectedAgent) {
        Round.instance.player.selectedAgent.fireOnSight = value
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
      .text(Constants.MAP_WIDTH + 10, 10, Constants.TEAM_SHORT_NAME, {
        fontSize: '16px',
        color: 'white',
      })
      .setDepth(Constants.SORT_LAYERS.UI)

    this.cpuSidebarTeamLabel = this.add
      .text(
        Constants.MAP_WIDTH + 10,
        Constants.WINDOW_HEIGHT / 2 + 10,
        this.cpuTeamConfig.shortName,
        {
          fontSize: '16px',
          color: 'white',
        }
      )
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
      Round.instance.scoreMapping[Side.PLAYER].toString(),
      {
        fontSize: '30px',
      }
    )
    this.playerScoreText.setPosition(
      this.timer.clockText.x - this.playerScoreText.displayWidth - 30,
      this.timer.clockText.y - 5
    )
    this.playerTeamLabel = this.add
      .text(this.playerScoreText.x, this.playerScoreText.y, Constants.TEAM_SHORT_NAME, {
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
      Round.instance.scoreMapping[Side.CPU].toString(),
      {
        fontSize: '30px',
      }
    )
    this.cpuScoreText.setPosition(
      this.timer.clockText.x + this.timer.clockText.displayWidth + 30,
      this.timer.clockText.y - 5
    )
    this.cpuTeamLabel = this.add
      .text(this.cpuScoreText.x, this.cpuScoreText.y - 15, this.cpuTeamConfig.shortName, {
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
        if (Round.instance.isPaused) {
          playOrPauseButton.setTexture('pause')
          pauseOverlay.setVisible(false)
          Round.instance.unPause()
          this.timer.start()
        } else {
          playOrPauseButton.setTexture('play')
          pauseOverlay.setVisible(true)
          Round.instance.pause()
          this.timer.stop()
        }
      }
    })
  }

  initialPlayerSetup() {
    if (!this.didInitialSetup) {
      if (
        Round.instance.player &&
        Round.instance.cpu &&
        Round.instance.cpu.agents &&
        Round.instance.player.selectedAgent
      ) {
        this.renderAgentsInfoBoxes(Round.instance.player.agents, 30)
        this.renderAgentsInfoBoxes(Round.instance.cpu.agents, Constants.WINDOW_HEIGHT / 2 + 30)
        this.didInitialSetup = true
      }
    }
  }

  updateScores() {
    this.playerScoreText.setText(Round.instance.scoreMapping[Side.PLAYER].toString())
    this.playerScoreText.setPosition(
      this.timer.clockText.x - this.playerScoreText.displayWidth - 30,
      this.timer.clockText.y - 5
    )
    this.playerTeamLabel.setPosition(
      this.playerScoreText.x - this.playerTeamLabel.displayWidth - 15,
      this.playerScoreText.y + 7
    )
    this.cpuScoreText.setText(Round.instance.scoreMapping[Side.CPU].toString())
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
    const game = Round.instance
    switch (game.roundState) {
      case RoundState.PREROUND: {
        this.timer.setTime(Constants.MID_ROUND_TIME_SEC)
        this.timer.start()
        game.roundState = RoundState.MID_ROUND
        game.dropBarriers()
        break
      }
      case RoundState.MID_ROUND: {
        game.pause()
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
        const scoreMapping = Round.instance.scoreMapping
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
            this.didInitialSetup = false
            this.loadTeamMgmtScreen()
          },
          scene: this,
          backgroundColor: 0x222222,
          textColor: '#ffffff',
        })
      },
    })
  }

  loadTeamMgmtScreen() {
    const playerWinLoss = Save.getData(SaveKeys.PLAYER_TEAM_WIN_LOSS_RECORD)
    const playerTeamName = Save.getData(SaveKeys.PLAYER_TEAM_NAME)
    const allTeams = Save.getData(SaveKeys.ALL_TEAM_CONFIGS)
    const currMatchIndex = Save.getData(SaveKeys.CURR_MATCH_INDEX)
    const seasonSchedule = Save.getData(SaveKeys.SEASON_SCHEDULE)

    const opponentTeam = allTeams[this.cpuTeamConfig.name]

    const scoreMapping = Round.instance.scoreMapping
    if (scoreMapping[Side.PLAYER] > scoreMapping[Side.CPU]) {
      playerWinLoss.wins++
      opponentTeam.losses++
    } else if (scoreMapping[Side.PLAYER] < scoreMapping[Side.CPU]) {
      playerWinLoss.losses++
      opponentTeam.wins++
    }

    allTeams[this.cpuTeamConfig.name] = opponentTeam
    allTeams[playerTeamName] = { ...allTeams[playerTeamName], ...playerWinLoss }
    Save.setData(SaveKeys.PLAYER_TEAM_WIN_LOSS_RECORD, playerWinLoss)
    Save.setData(SaveKeys.ALL_TEAM_CONFIGS, allTeams)
    Save.setData(SaveKeys.CURR_MATCH_INDEX, Math.min(currMatchIndex + 1, seasonSchedule.length - 1))

    this.scene.bringToTop('team-mgmt')
    this.scene.start('team-mgmt')
  }

  renderKillMessage(killer: Agent, killed: Agent) {
    const killedNameText = this.add.text(Constants.MAP_WIDTH - 50, 50, killed.name, {
      fontSize: '12px',
      color: 'white',
    })

    killedNameText
      .setPosition(Constants.MAP_WIDTH - 20 - killedNameText.displayWidth, 50)
      .setVisible(false)

    const gunConfig = GUN_CONFIGS[killer.currWeapon]
    const gunSprite = this.add.sprite(killedNameText.x - 10, 50, gunConfig.texture)
    gunSprite
      .setPosition(killedNameText.x - 10 - gunSprite.displayWidth, 50)
      .setFlipX(true)
      .setVisible(false)
      .setOrigin(0, 0.5)

    const killerNameText = this.add.text(gunSprite.x - 10, 50, killer.name, {
      fontSize: '12px',
      color: 'white',
    })
    killerNameText.setPosition(gunSprite.x - 10 - killerNameText.displayWidth, 50).setVisible(false)

    const totalWidth =
      killerNameText.displayWidth + 10 + gunSprite.displayWidth + 10 + killedNameText.displayWidth

    const boundingRect = this.add.rectangle(
      Constants.MAP_WIDTH - totalWidth / 2 - 20,
      50,
      totalWidth + 30,
      30,
      killer.side === Side.PLAYER ? 0x0000ff : 0xff0000
    )
    boundingRect
      .setAlpha(0.5)
      .setVisible(false)
      .setDepth(killedNameText.depth - 1)

    const newKillMessage = {
      killerNameText,
      killedNameText,
      gunSprite,
      renderTimestamp: Date.now(),
      boundingRect,
    }

    this.killMessageFeed.push(newKillMessage)
  }

  update() {
    this.initialPlayerSetup()
    this.updateAllAgentInfoBoxes()
    this.updateKillMessageFeed()
  }

  updateKillMessageFeed() {
    let yPosition = Constants.TOP_BAR_HEIGHT + 25
    const currTimestamp = Date.now()
    this.killMessageFeed.forEach((message) => {
      if (currTimestamp - message.renderTimestamp >= 3000) {
        message.killedNameText.destroy()
        message.killerNameText.destroy()
        message.gunSprite.destroy()
        message.boundingRect.destroy()
      } else {
        message.killerNameText.y = yPosition - message.killerNameText.displayHeight / 2
        message.killedNameText.y = yPosition - message.killedNameText.displayHeight / 2
        message.gunSprite.y = yPosition
        message.boundingRect.y = yPosition

        message.boundingRect.setVisible(true)
        message.killerNameText.setVisible(true)
        message.killedNameText.setVisible(true)
        message.gunSprite.setVisible(true)
        yPosition += 35
      }
    })
    this.killMessageFeed = this.killMessageFeed.filter((message) => message.killedNameText.active)
  }

  updateSelectedAgentFireOnSightToggleSwitch() {
    // Render fire on sight toggle
    if (Round.instance.player && Round.instance.player.selectedAgent) {
      this.fireOnSightToggleSwitch.setValue(Round.instance.player.selectedAgent.fireOnSight)
    }
  }

  updateAllAgentInfoBoxes() {
    // Render agent info boxes
    if (Round.instance.player && Round.instance.player.agents) {
      this.updateAgentInfoBoxes(Round.instance.player.agents, Side.PLAYER)
    }
    if (Round.instance.cpu && Round.instance.cpu.agents) {
      this.updateAgentInfoBoxes(Round.instance.cpu.agents, Side.CPU)
    }
  }

  updateSelectedAgentCommandState() {
    if (Round.instance.attackSide === Side.PLAYER) {
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
      if (Round.instance.player) {
        const selectedAgent = Round.instance.player.selectedAgent
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
    const player = Round.instance.player
    const selectedAgent = player.selectedAgent
    return selectedAgent.hasSpike
  }
}
