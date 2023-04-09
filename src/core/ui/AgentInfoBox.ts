import { Scene } from 'phaser'
import { Constants } from '~/utils/Constants'
import { GunTypes } from '~/utils/GunConstants'
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
  public agentGunIcon!: Phaser.GameObjects.Sprite
  public agentKillStreak!: Phaser.GameObjects.Text
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
      width: Constants.RIGHT_BAR_WIDTH - 20,
      borderWidth: 0,
      bgColor: 0x222222,
    })

    this.agentKillStreak = this.scene.add
      .text(
        position.x + this.infoBoxRect.displayWidth - 50,
        agentNameText.y,
        `KS: ${this.agent.killStreak}`,
        {
          fontSize: '14px',
          color: 'white',
        }
      )
      .setDepth(Constants.SORT_LAYERS.UI)

    const agentKdaTextPosX = this.agentKillStreak.x - 75
    this.agentKdaText = this.scene.add
      .text(agentKdaTextPosX, agentNameText.y, '0/0/0', {
        fontSize: '14px',
        color: 'white',
      })
      .setDepth(Constants.SORT_LAYERS.UI)

    this.agentGunIcon = this.scene.add
      .sprite(
        this.infoBoxRect.x + this.infoBoxRect.displayWidth - 50,
        agentProfilePic.y + 25,
        'classic-icon'
      )
      .setFlipX(true)
      .setDepth(Constants.SORT_LAYERS.UI)
  }

  update() {
    this.updateHealth()
    this.setKda()
    this.updateGunIcon()
  }

  updateGunIcon() {
    switch (this.agent.currWeapon) {
      case GunTypes.PISTOL: {
        this.agentGunIcon.setTexture('classic-icon')
        break
      }
      case GunTypes.SMG: {
        this.agentGunIcon.setTexture('spectre-icon')
        break
      }
      case GunTypes.RIFLE: {
        this.agentGunIcon.setTexture('vandal-icon')
        break
      }
    }
  }

  updateHealth() {
    this.agentHealthBar.setCurrValue(this.agent.healthBar.currValue)
  }

  setKda() {
    this.agentKdaText.setText(`${this.agent.kills}/${this.agent.deaths}/${this.agent.assists}`)
    this.agentKdaText.setPosition(
      this.agentKillStreak.x - this.agentKdaText.displayWidth - 20,
      this.agentKillStreak.y
    )
  }
}
