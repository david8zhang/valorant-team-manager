import Game from '~/scenes/Game'
import { Agent } from './Agent'

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

  constructor(config: SpikeConfig) {
    this.game = Game.instance
    this.sprite = this.game.physics.add.sprite(config.position.x, config.position.y, 'spike')
    this.game.physics.add.overlap(this.game.playerAgentsGroup, this.sprite, (agentSprite) => {
      this.handleSpikePickup(agentSprite)
    })
    this.game.physics.add.overlap(this.game.cpuAgentsGroup, this.sprite, (agentSprite) => {
      this.handleSpikePickup(agentSprite)
    })
  }

  handleSpikePickup(agentSprite: Phaser.GameObjects.GameObject) {
    const agent = agentSprite.getData('ref') as Agent
    if (agent.side === this.game.attackSide && !this.isPlanted) {
      agent.hasSpike = true
      this.sprite.setVisible(false)
    }
  }
}
