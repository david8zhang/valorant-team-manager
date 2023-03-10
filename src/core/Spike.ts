import Game from '~/scenes/Game'
import { Constants, RoundState } from '~/utils/Constants'
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
  public game: Game
  public isPlanted: boolean = false
  public isDefused: boolean = false
  public defuseCircleUI: Phaser.GameObjects.Arc
  public defuseCircleDetector: Phaser.Geom.Circle

  constructor(config: SpikeConfig) {
    this.game = Game.instance
    this.sprite = this.game.physics.add
      .sprite(config.position.x, config.position.y, 'spike')
      .setDepth(Constants.SORT_LAYERS.Player - 1)
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
  }

  plant(x: number, y: number) {
    this.sprite.setPosition(x, y).setVisible(true).setTexture('spike-planted')
    this.isPlanted = true
    this.defuseCircleUI.setPosition(x, y).setVisible(true)
    this.defuseCircleDetector.setPosition(x, y)
  }

  defuse() {
    this.isDefused = true
    this.sprite.setTexture('spike')
    this.defuseCircleUI.setVisible(false)
  }

  drop(x: number, y: number) {
    this.sprite.setPosition(x, y).setVisible(true)
    this.sprite.body.enable = true
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
    this.sprite.setAlpha(1)
    this.sprite.setTexture('spike')
    this.defuseCircleUI.setVisible(false)
    this.sprite.body.enable = true
    this.sprite.setVisible(true)
    const initialSpikePosition = Constants.INITIAL_SPIKE_POSITION_CPU_SIDE
    this.sprite.setPosition(initialSpikePosition.x, initialSpikePosition.y)
  }
}
