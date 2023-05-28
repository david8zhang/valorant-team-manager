import { Button } from '~/core/ui/Button'
import { Slider } from '~/core/ui/Slider'
import TeamMgmt, { PlayerAgentConfig } from '~/scenes/TeamMgmt'

export interface ContractConfigModalConfig {
  playerConfig: PlayerAgentConfig
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

  private acceptButton!: Button
  private denyButton!: Button
  private slider!: Slider
  private titleText: Phaser.GameObjects.Text
  private durationText!: Phaser.GameObjects.Text

  constructor(scene: TeamMgmt, config: ContractConfigModalConfig) {
    this.scene = scene
    this.position = config.position
    this.rectangle = this.scene.add
      .rectangle(config.position.x, config.position.y, config.width, config.height)
      .setStrokeStyle(1, 0x000000)
      .setFillStyle(0xffffff)

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
    this.setupBackText()
    this.setupButtons()
    this.setupDurationText(config)
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
        this.updateContractAskText()
      },
    })
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

  setupButtons() {
    this.acceptButton = new Button({
      scene: this.scene,
      onClick: () => {},
      width: 100,
      height: 30,
      text: 'Accept',
      x: this.rectangle.x - 55,
      y: this.rectangle.y + 100,
      strokeColor: 0x000000,
      strokeWidth: 1,
      fontSize: '14px',
    })
    this.denyButton = new Button({
      scene: this.scene,
      onClick: () => {},
      width: 100,
      height: 30,
      text: 'Deny',
      x: this.rectangle.x + 55,
      y: this.rectangle.y + 100,
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
  }
}
