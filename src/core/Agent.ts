import Game from '~/scenes/Game'
import { GunTypes } from '~/utils/Constants'
import { DeathState } from './states/DeathState'
import { HoldState } from './states/HoldState'
import { IdleState } from './states/IdleState'
import { MoveState } from './states/MoveState'
import { ShootingState } from './states/ShootingState'
import { StateMachine } from './states/StateMachine'
import { States } from './states/States'
import { UIValueBar } from './UIValueBar'

export enum Side {
  PLAYER = 'PLAYER',
  CPU = 'CPU',
}

export enum WeaponTypes {
  PRIMARY = 'PRIMARY',
  SECONDARY = 'SECONDARY',
  MELEE = 'MELEE',
}

export interface AgentConfig {
  position: {
    x: number
    y: number
  }
  name: string
  texture: string
  sightAngleDeg: number
  hideSightCones?: boolean
  raycaster: any
  side: Side
}

export class Agent {
  public visionRay: any
  public crosshairRay: any
  public game: Game
  public sprite: Phaser.Physics.Arcade.Sprite
  public highlightCircle: Phaser.Physics.Arcade.Sprite
  public isPaused: boolean = false
  public hideSightCones: boolean = false
  public name: string

  public graphics: Phaser.GameObjects.Graphics
  public stateMachine: StateMachine
  public side: Side

  public healthBar!: UIValueBar
  public weapons: {
    [key in WeaponTypes]: GunTypes | null
  }
  private currEquippedWeapon: WeaponTypes = WeaponTypes.SECONDARY

  constructor(config: AgentConfig) {
    this.game = Game.instance
    if (config.hideSightCones) {
      this.hideSightCones = config.hideSightCones
    }
    this.name = config.name
    this.setupVisionAndCrosshair(config)
    this.sprite = this.game.physics.add
      .sprite(config.position.x, config.position.y, config.texture)
      .setDepth(50)
      .setName('agent')
      .setData('ref', this)
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
        [States.HOLD]: new HoldState(),
        [States.SHOOT]: new ShootingState(),
        [States.DIE]: new DeathState(),
      },
      [this]
    )

    this.graphics = this.game.add.graphics({
      lineStyle: { width: 2, color: 0x00ffff, alpha: 0.3 },
    })
    this.side = config.side
    this.setupHealthBar()
    this.weapons = {
      [WeaponTypes.PRIMARY]: null,
      [WeaponTypes.SECONDARY]: GunTypes.PISTOL,
      [WeaponTypes.MELEE]: null,
    }
  }

  setupHealthBar() {
    const healthBarWidth = this.sprite.displayWidth * 2
    this.healthBar = new UIValueBar(this.game, {
      x: this.sprite.x - healthBarWidth / 2,
      y: this.sprite.y - this.sprite.displayHeight - 5,
      height: 2,
      width: healthBarWidth,
      maxValue: 100,
      borderWidth: 0,
      fillColor: 0x00ff00,
    })
  }

  getCurrState() {
    return this.stateMachine.getState()
  }

  takeDamage(damage: number) {
    const newValue = Math.max(0, this.healthBar.currValue - damage)
    this.healthBar.setCurrValue(newValue)
    if (newValue == 0) {
      this.stateMachine.transition(States.DIE)
    }
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

  didDetectEnemy() {
    const intersections = this.visionRay.castCone()
    return (
      intersections.find((n) => {
        if (!n.object || n.object.name !== 'agent') {
          return false
        }
        const agent = n.object.getData('ref') as Agent
        return agent.side !== this.side
      }) !== undefined
    )
  }

  get currWeapon(): GunTypes | null {
    return this.weapons[this.currEquippedWeapon]
  }

  update() {
    this.graphics.clear()
    this.stateMachine.step()
    this.updateVisionAndCrosshair()
    this.highlightCircle.setVelocity(this.sprite.body.velocity.x, this.sprite.body.velocity.y)
    if (this.didDetectEnemy() && this.canShootEnemy()) {
      this.stateMachine.transition(States.SHOOT)
    }
    this.healthBar.x = this.sprite.x - this.healthBar.width / 2
    this.healthBar.y = this.sprite.y - this.sprite.displayHeight - 5
    this.healthBar.draw()
  }

  canShootEnemy() {
    return (
      this.stateMachine.getState() !== States.SHOOT && this.stateMachine.getState() !== States.DIE
    )
  }

  updateVisionAndCrosshair() {
    if (this.getCurrState() !== States.DIE) {
      this.visionRay.setOrigin(this.sprite.x, this.sprite.y)
      this.crosshairRay.setOrigin(this.sprite.x, this.sprite.y)
      const visionIntersections = this.visionRay.castCone()
      visionIntersections.push(this.visionRay.origin)
      visionIntersections.forEach((n) => {
        if (n.object && n.object.name === 'agent') {
          const agent = n.object.getData('ref') as Agent
          if (agent.getCurrState() !== States.DIE) {
            agent.sprite.setVisible(true)
            agent.healthBar.setVisible(true)
          }
        }
      })
      const crosshairIntersection = this.crosshairRay.cast()
      if (!this.hideSightCones) {
        // hide sight cones (for CPU agents)
        this.game.draw(visionIntersections)
        this.drawCrosshair(crosshairIntersection)
      }
    }
  }

  drawCrosshair(intersection: { x: number; y: number }) {
    const line = new Phaser.Geom.Line(
      this.crosshairRay.origin.x,
      this.crosshairRay.origin.y,
      intersection.x,
      intersection.y
    )
    this.graphics.strokeLineShape(line)
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
