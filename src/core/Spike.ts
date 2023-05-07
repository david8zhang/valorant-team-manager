import Round from '~/scenes/Round'
import { RoundConstants, RoundState } from '~/utils/RoundConstants'
import { MapConstants } from '~/utils/MapConstants'
import { Agent } from './Agent'
import { States } from './states/States'

export interface SpikeConfig {
  position: {
    x: number
    y: number
  }
}

export class Spike {
  public sprite: Phaser.Physics.Arcade.Sprite
  public game: Round
  public isPlanted: boolean = false
  public isDefused: boolean = false
  public isDetonated: boolean = false

  public defuseCircleUI: Phaser.GameObjects.Arc
  public defuseCircleDetector: Phaser.Geom.Circle
  public explosionCircle: Phaser.GameObjects.Arc
  public explosionCircleDetector: Phaser.Geom.Circle

  constructor(config: SpikeConfig) {
    this.game = Round.instance
    this.sprite = this.game.physics.add
      .sprite(config.position.x, config.position.y, 'spike')
      .setDepth(RoundConstants.SORT_LAYERS.Player - 1)
    this.game.physics.add.overlap(this.game.playerAgentsGroup, this.sprite, (agentSprite) => {
      this.handleSpikePickup(agentSprite)
    })
    this.game.physics.add.overlap(this.game.cpuAgentsGroup, this.sprite, (agentSprite) => {
      this.handleSpikePickup(agentSprite)
    })
    this.defuseCircleUI = this.game.add
      .circle(this.sprite.x, this.sprite.y, 32, 0x0000ff, 0.2)
      .setVisible(false)
      .setDepth(this.sprite.depth - 1)
    this.defuseCircleDetector = new Phaser.Geom.Circle(this.sprite.x, this.sprite.y, 32)

    this.explosionCircle = this.game.add
      .circle(this.sprite.x, this.sprite.y, 0, 0x000000, 0.5)
      .setVisible(false)
    this.explosionCircleDetector = new Phaser.Geom.Circle(this.sprite.x, this.sprite.y, 0)
  }

  plant(x: number, y: number) {
    this.sprite.setPosition(x, y).setVisible(true).setTexture('spike-planted')
    this.isPlanted = true
    this.defuseCircleUI.setPosition(x, y).setVisible(true)
    this.defuseCircleDetector.setPosition(x, y)
  }

  detonate() {
    this.isDetonated = true
    this.explosionCircle.setPosition(this.sprite.x, this.sprite.y)
    this.explosionCircleDetector.setPosition(this.sprite.x, this.sprite.y)
    this.sprite.setVisible(false)
    this.defuseCircleUI.setVisible(false)
    this.game.tweens.add({
      targets: [this.explosionCircle],
      radius: {
        from: 0,
        to: 128,
      },
      duration: 250,
      hold: 500,
      onStart: () => {
        this.explosionCircle.setVisible(true)
      },
      onUpdate: () => {
        this.explosionCircleDetector.radius = this.explosionCircle.radius
      },
      onComplete: () => {
        this.game.tweens.add({
          targets: [this.explosionCircle],
          alpha: {
            from: 1,
            to: 0,
          },
          duration: 1000,
          onComplete: () => {
            this.isDetonated = false
          },
        })
      },
    })
  }

  defuse() {
    this.isDefused = true
    this.sprite.setTexture('spike')
    this.defuseCircleUI.setVisible(false)
  }

  drop(x: number, y: number, prevSpikeCarrier: Agent) {
    this.sprite.setPosition(x, y).setVisible(true)
    this.sprite.body.enable = true
    this.game.onSpikeDropHandlers.forEach((handler) => {
      handler(prevSpikeCarrier)
    })
  }

  handleSpikePickup(agentSprite: Phaser.GameObjects.GameObject) {
    const agent = agentSprite.getData('ref') as Agent
    if (
      agent.side === this.game.attackSide &&
      !this.isPlanted &&
      agent.getCurrState() !== States.DIE
    ) {
      agent.hasSpike = true
      this.sprite.setVisible(false)
      this.sprite.body.enable = false
    }
  }

  reset() {
    this.isPlanted = false
    this.isDefused = false
    this.isDetonated = false

    const initialSpikePosition = MapConstants.INITIAL_SPIKE_POSITION
    this.sprite.setAlpha(1)
    this.sprite.setTexture('spike')
    this.sprite.body.enable = true
    this.sprite.setVisible(true)
    this.sprite.setPosition(initialSpikePosition.x, initialSpikePosition.y)

    this.defuseCircleUI.setVisible(false)
    this.explosionCircle.setVisible(false)
    this.explosionCircle.setRadius(0)
    this.explosionCircle.setAlpha(1)
    this.explosionCircleDetector.radius = 0
  }
}
