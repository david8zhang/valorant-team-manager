import Game from '~/scenes/Game'
import { Constants } from '~/utils/Constants'
import { Node } from './Pathfinding'
import { IdleState } from './states/IdleState'
import { MoveState } from './states/MoveState'
import { StateMachine } from './states/StateMachine'
import { States } from './states/States'

export interface AgentConfig {
  position: {
    x: number
    y: number
  }
  texture: string
  sightAngleDeg: number
  hideSightCones?: boolean
  raycaster: any
}

export class Agent {
  public visionRay: any
  public crosshairRay: any
  public game: Game
  public sprite: Phaser.Physics.Arcade.Sprite
  public currPath: Node[] = []
  public currNodeToMoveTo: Node | undefined
  public pathLines: Phaser.GameObjects.Line[] = []
  public moveTarget: { x: number; y: number } | null = null
  public shouldStop: boolean = false

  public highlightCircle: Phaser.Physics.Arcade.Sprite
  public isPaused: boolean = false
  public hideSightCones: boolean = false

  public stateMachine: StateMachine

  constructor(config: AgentConfig) {
    this.game = Game.instance
    if (config.hideSightCones) {
      this.hideSightCones = config.hideSightCones
    }
    this.setupVisionAndCrosshair(config)
    this.sprite = this.game.physics.add
      .sprite(config.position.x, config.position.y, config.texture)
      .setDepth(50)
      .setName('agent')
    this.highlightCircle = this.game.physics.add
      .sprite(config.position.x, config.position.y, config.texture)
      .setTintFill(0xffff00)
      .setVisible(false)
      .setScale(1.5)
      .setDepth(this.sprite.depth - 1)
    this.stateMachine = new StateMachine(
      States.IDLE,
      {
        [States.IDLE]: new IdleState(),
        [States.MOVE]: new MoveState(),
      },
      [this]
    )
  }

  setupVisionAndCrosshair(config: AgentConfig) {
    this.visionRay = config.raycaster.createRay({
      origin: config.position,
    })
    this.visionRay.setAngle(Phaser.Math.DegToRad(config.sightAngleDeg))
    this.visionRay.setConeDeg(60)

    this.crosshairRay = config.raycaster.createRay({
      origin: config.position,
    })
    this.crosshairRay.setAngle(Phaser.Math.DegToRad(config.sightAngleDeg))
  }

  update() {
    this.stateMachine.step()
    this.updateVisionAndCrosshair()
    this.highlightCircle.setVelocity(this.sprite.body.velocity.x, this.sprite.body.velocity.y)
  }

  updateVisionAndCrosshair() {
    this.visionRay.setOrigin(this.sprite.x, this.sprite.y)
    this.crosshairRay.setOrigin(this.sprite.x, this.sprite.y)
    const visionIntersections = this.visionRay.castCone()
    visionIntersections.push(this.visionRay.origin)
    visionIntersections.forEach((n) => {
      if (n.object && n.object.name === 'agent') {
        n.object.setVisible(true)
      }
    })
    const crosshairIntersection = this.crosshairRay.cast()
    if (!this.hideSightCones) {
      // hide sight cones (for CPU agents)
      this.game.draw(visionIntersections)
      this.game.drawCrosshair(this.crosshairRay.origin, crosshairIntersection)
    }
  }

  setState(state: States, enterArgs?: any) {
    this.stateMachine.transition(state, enterArgs)
  }

  highlight() {
    this.highlightCircle.setPosition(this.sprite.x, this.sprite.y).setVisible(true)
  }

  dehighlight() {
    this.highlightCircle.setVisible(false)
  }

  pause() {
    this.isPaused = true
  }

  unpause() {
    this.isPaused = false
  }
}
