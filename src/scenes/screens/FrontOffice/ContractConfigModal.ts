import { Button } from '~/core/ui/Button'
import { Slider } from '~/core/ui/Slider'
import TeamMgmt, { PlayerAgentConfig, TeamConfig } from '~/scenes/TeamMgmt'
import { PlayerRank, RANK_TO_ASKING_AMOUNT_MAPPING } from '~/utils/PlayerConstants'
import { RoundConstants } from '~/utils/RoundConstants'
import { Save, SaveKeys } from '~/utils/Save'
import { Utilities } from '~/utils/Utilities'

export interface ContractConfigModalConfig {
  playerConfig: PlayerAgentConfig
  onAccept: Function
  onDeny: Function
  position: {
    x: number
    y: number
  }
  width: number
  height: number
}

export class ContractConfigModal {
  private scene: TeamMgmt
  private rectangle: Phaser.GameObjects.Rectangle
  private contractAskText!: Phaser.GameObjects.Text
  private backText!: Phaser.GameObjects.Text
  private durationAsk: number = 2
  private salaryAsk: number = 5
  private position: { x: number; y: number }
  private playerConfig: PlayerAgentConfig
  private isShowing: boolean = false

  private onAccept: Function
  private onDeny: Function

  private acceptButton!: Button
  private denyButton!: Button
  private slider!: Slider
  private titleText: Phaser.GameObjects.Text
  private durationText!: Phaser.GameObjects.Text
  private salaryCapAfterExtGroup!: Phaser.GameObjects.Group

  constructor(scene: TeamMgmt, config: ContractConfigModalConfig) {
    this.scene = scene
    this.position = config.position
    this.onAccept = config.onAccept
    this.onDeny = config.onDeny
    this.rectangle = this.scene.add
      .rectangle(config.position.x, config.position.y, config.width, config.height)
      .setStrokeStyle(1, 0x000000)
      .setFillStyle(0xffffff)

    this.salaryAsk = this.getExtensionEstimate(config.playerConfig, this.durationAsk)
    this.titleText = this.scene.add
      .text(config.position.x, config.position.y, 'Extend Contract?', {
        fontSize: '20px',
        color: 'black',
      })
      .setOrigin(0)

    this.titleText.setPosition(
      this.position.x - this.titleText.displayWidth / 2,
      this.position.y - 125
    )
    this.playerConfig = config.playerConfig
    this.setupContractSlider()
    this.setupContractAskText()
    this.setupSalaryCapAfterExtensionText()
    this.setupBackText()
    this.setupButtons()
    this.setupDurationText(config)
  }

  setupSalaryCapAfterExtensionText() {
    const allTeams = Save.getData(SaveKeys.ALL_TEAM_CONFIGS) as { [key: string]: TeamConfig }
    const playerTeam = allTeams[Save.getData(SaveKeys.PLAYER_TEAM_NAME)] as TeamConfig
    let totalSalaryAfterExtension = 0
    playerTeam.roster.forEach((player: PlayerAgentConfig) => {
      if (player.id === this.playerConfig.id) {
        totalSalaryAfterExtension += this.salaryAsk
      } else {
        totalSalaryAfterExtension += player.contract.salary
      }
    })
    this.salaryCapAfterExtGroup = this.scene.add.group()
    const capSpace = RoundConstants.SALARY_CAP - totalSalaryAfterExtension
    const capSpaceLabel = this.scene.add.text(
      this.position.x,
      this.position.y + 30,
      `Cap Space: `,
      {
        fontSize: '15px',
        color: 'black',
      }
    )
    capSpaceLabel.setPosition(capSpaceLabel.x - capSpaceLabel.displayWidth / 2, capSpaceLabel.y)
    const capSpaceValue = this.scene.add.text(
      capSpaceLabel.x + capSpaceLabel.displayWidth,
      this.position.y + 30,
      `$${capSpace}M`,
      {
        fontSize: '15px',
        color: capSpace > 0 ? 'green' : 'red',
      }
    )
    const totalSalaryLabel = this.scene.add.text(
      capSpaceValue.x + capSpaceValue.displayWidth + 15,
      this.position.y + 30,
      `Total Salary After: $${totalSalaryAfterExtension}M`,
      {
        fontSize: '15px',
        color: 'black',
      }
    )
    const yPos = this.contractAskText.y + this.contractAskText.displayHeight + 15
    const totalWidth =
      capSpaceLabel.displayWidth + capSpaceValue.displayWidth + 15 + totalSalaryLabel.displayWidth
    capSpaceLabel.setPosition(this.position.x - totalWidth / 2, yPos)
    capSpaceValue.setPosition(capSpaceLabel.x + capSpaceLabel.displayWidth, yPos)
    totalSalaryLabel.setPosition(capSpaceValue.x + capSpaceValue.displayWidth + 15, yPos)
    this.salaryCapAfterExtGroup.add(capSpaceLabel)
    this.salaryCapAfterExtGroup.add(capSpaceValue)
    this.salaryCapAfterExtGroup.add(totalSalaryLabel)
  }

  setupDurationText(config: ContractConfigModalConfig) {
    this.durationText = this.scene.add.text(
      config.position.x,
      this.titleText.y + this.titleText.displayHeight + 20,
      `${this.durationAsk} Years`,
      {
        fontSize: '24px',
        color: 'black',
      }
    )
    this.durationText.setPosition(
      this.position.x - this.durationText.displayWidth / 2,
      this.durationText.y
    )
  }

  setupContractSlider() {
    this.slider = new Slider(this.scene, {
      position: {
        x: this.rectangle.x,
        y: this.rectangle.y - 30,
      },
      width: this.rectangle.displayWidth - 80,
      height: 5,
      maxValue: 3,
      stepSize: 1,
      onStepChanged: (step: number) => {
        this.durationAsk = step + 2
        this.salaryAsk = this.getExtensionEstimate(this.playerConfig, this.durationAsk)
        this.updateContractAskText()
        this.updateSalaryCapSpaceText()
      },
    })
  }

  getAskingAmount(player: PlayerAgentConfig) {
    const overall = Utilities.getOverallRank(player) as PlayerRank
    return RANK_TO_ASKING_AMOUNT_MAPPING[overall]
  }

  getExtensionEstimate(player: PlayerAgentConfig, duration: number) {
    const contract = player.contract
    const currDuration = contract.duration
    let askingAmount = Math.max(contract.salary, this.getAskingAmount(player))

    // Factor in potentials
    const potentialMultiplier = 0.15 * player.potential + 0.8
    askingAmount *= potentialMultiplier

    // Factor in duration
    const durationMultiplier = 1.46429 - 0.0714286 * (duration + currDuration)
    askingAmount *= durationMultiplier
    askingAmount = Math.floor(askingAmount)

    // If hero is a rookie, the max they can ask for is 10
    return player.isRookie ? Math.min(askingAmount, 10) : Math.min(askingAmount, 40)
  }

  updateContractAskText() {
    this.durationText.setText(`${this.durationAsk} Years`)
    this.durationText.setPosition(
      this.position.x - this.durationText.displayWidth / 2,
      this.durationText.y
    )
    this.contractAskText.setText(
      `For a ${this.durationAsk} year extension, ${this.playerConfig.name} is asking for $${this.salaryAsk}M per year`
    )
    this.contractAskText.setPosition(
      this.position.x - (this.rectangle.displayWidth - 40) / 2,
      this.position.y + 20
    )
  }

  updateSalaryCapSpaceText() {
    this.salaryCapAfterExtGroup.clear(true, true)
    this.salaryCapAfterExtGroup.destroy()
    this.setupSalaryCapAfterExtensionText()
  }

  setupButtons() {
    this.acceptButton = new Button({
      scene: this.scene,
      onClick: () => {
        this.onAccept(this.salaryAsk, this.durationAsk)
      },
      width: 100,
      height: 30,
      text: 'Accept',
      x: this.rectangle.x - 55,
      y: this.rectangle.y + 125,
      strokeColor: 0x000000,
      strokeWidth: 1,
      fontSize: '14px',
    })
    this.denyButton = new Button({
      scene: this.scene,
      onClick: () => {
        this.onDeny()
      },
      width: 100,
      height: 30,
      text: 'Deny',
      x: this.rectangle.x + 55,
      y: this.rectangle.y + 125,
      strokeColor: 0x000000,
      strokeWidth: 1,
      fontSize: '14px',
    })
  }

  setupContractAskText() {
    this.contractAskText = this.scene.add.text(
      this.position.x,
      this.position.y,
      `For a ${this.durationAsk} year extension, ${this.playerConfig.name} is asking for $${this.salaryAsk}M per year`,
      {
        fontSize: '18px',
        color: 'black',
      }
    )
    this.contractAskText.setPosition(
      this.position.x - (this.rectangle.displayWidth - 40) / 2,
      this.position.y + 20
    )
    this.contractAskText.setAlign('center').setWordWrapWidth(this.rectangle.displayWidth - 20)
  }

  setupBackText() {
    this.backText = this.scene.add.text(
      this.position.x + this.rectangle.displayWidth / 2 - 50,
      this.position.y - this.rectangle.displayHeight / 2 + 15,
      'Back',
      {
        fontSize: '15px',
        color: 'black',
      }
    )
    this.backText.setInteractive().on(Phaser.Input.Events.POINTER_DOWN, () => {
      this.hide()
    })
  }

  destroy() {
    this.titleText.destroy()
    this.acceptButton.destroy()
    this.backText.destroy()
    this.rectangle.destroy()
    this.contractAskText.destroy()
    this.denyButton.destroy()
    this.durationText.destroy()
    this.slider.destroy()
    this.salaryCapAfterExtGroup.clear(true, true)
    this.salaryCapAfterExtGroup.destroy()
  }

  hide() {
    this.isShowing = false
    this.setVisible(this.isShowing)
  }

  display() {
    this.isShowing = true
    this.setVisible(this.isShowing)
  }

  setVisible(isVisible: boolean) {
    this.contractAskText.setVisible(isVisible)
    this.titleText.setVisible(isVisible)
    this.rectangle.setVisible(isVisible)
    this.backText.setVisible(isVisible)
    this.acceptButton.setVisible(isVisible)
    this.denyButton.setVisible(isVisible)
    this.slider.setVisible(isVisible)
    this.durationText.setVisible(isVisible)
    this.salaryCapAfterExtGroup.setVisible(isVisible)
  }
}
