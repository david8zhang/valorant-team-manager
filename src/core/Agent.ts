import Game from '~/scenes/Game'

export interface AgentConfig {
  position: {
    x: number
    y: number
  }
  texture: string
}

export class Agent {
  public ray: any
  public game: Game
  public sprite: Phaser.Physics.Arcade.Sprite

  constructor(config: AgentConfig) {
    this.game = Game.instance
    this.ray = this.game.raycaster.createRay({
      origin: config.position,
    })
    this.ray.setAngle(Phaser.Math.DegToRad(90))
    this.ray.setConeDeg(60)
    this.sprite = this.game.physics.add.sprite(config.position.x, config.position.y, config.texture)
  }

  update() {
    const intersections = this.ray.castCone()
    intersections.push(this.ray.origin)
    this.game.draw(intersections)
  }
}
