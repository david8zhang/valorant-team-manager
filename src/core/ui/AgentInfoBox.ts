import { Scene } from 'phaser'
import { Constants } from '~/utils/Constants'
import { Agent } from '../Agent'
import { UIValueBar } from './UIValueBar'

export interface AgentInfoConfig {
  agent: Agent
  position: {
    x: number
    y: number
  }
}

export class AgentInfoBox {
  public scene: Scene
  public agent: Agent
  public agentHealthBar!: UIValueBar
  public agentKdaText!: Phaser.GameObjects.Text
  public agentUtilityIcons: Phaser.GameObjects.Rectangle[] = []
  public infoBoxRect!: Phaser.GameObjects.Rectangle

  constructor(scene: Scene, config: AgentInfoConfig) {
    this.scene = scene
    this.agent = config.agent
    this.setupBox(config.position)
  }

  setupBox(position: { x: number; y: number }) {
    this.infoBoxRect = this.scene.add
      .rectangle(position.x, position.y, Constants.RIGHT_BAR_WIDTH - 20, 80)
      .setFillStyle(0xffffff)
      .setAlpha(0.2)
      .setDepth(Constants.SORT_LAYERS.UI)
      .setOrigin(0)

    const agentProfilePic = this.scene.add
      .rectangle(position.x, position.y, 65, 45, 0xff0000)
      .setOrigin(0)
      .setDepth(Constants.SORT_LAYERS.UI)

    const agentNameText = this.scene.add
      .text(agentProfilePic.x, agentProfilePic.y + 50, this.agent.name, {
        fontSize: '14px',
        color: 'white',
      })
      .setDepth(Constants.SORT_LAYERS.UI)
      .setOrigin(0)

    this.agentHealthBar = new UIValueBar(this.scene, {
      x: position.x,
      y: agentNameText.y + 20,
      maxValue: 100,
      height: 10,
      width: 320,
      borderWidth: 0,
      bgColor: 0x222222,
    })

    this.agentKdaText = this.scene.add
      .text(position.x + this.infoBoxRect.displayWidth, agentNameText.y, '0/0/0', {
        fontSize: '14px',
        color: 'white',
      })
      .setDepth(Constants.SORT_LAYERS.UI)
    this.agentKdaText.setPosition(
      position.x + this.infoBoxRect.displayWidth - this.agentKdaText.displayWidth - 5,
      agentNameText.y
    )
    // Utility icons
    let x = agentProfilePic.x + 100
    for (let i = 1; i <= 3; i++) {
      const icon = this.scene.add
        .rectangle(x, agentProfilePic.y + 25, 30, 30, 0xff0000)
        .setDepth(Constants.SORT_LAYERS.UI)
      x += icon.displayWidth + 5
      this.agentUtilityIcons.push(icon)
    }
  }

  update() {
    this.updateHealth()
    this.setKda()
  }

  updateHealth() {
    this.agentHealthBar.setCurrValue(this.agent.healthBar.currValue)
  }

  setKda() {
    this.agentKdaText.setText(`${this.agent.kills}/${this.agent.deaths}/${this.agent.assists}`)
  }
}
