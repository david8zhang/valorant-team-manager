import Game from '~/scenes/Game'
import { Constants, GunTypes } from '~/utils/Constants'
import { DeathState } from './states/DeathState'
import { DefuseState } from './states/DefuseState'
import { HoldState } from './states/HoldState'
import { IdleState } from './states/IdleState'
import { MoveState } from './states/MoveState'
import { PlantState } from './states/PlantState'
import { ShootingState } from './states/ShootingState'
import { StateMachine } from './states/StateMachine'
import { States } from './states/States'
import { Team } from './Team'
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
  team: Team
}

export class Agent {
  public static FULL_HEALTH: number = 100

  public visionRay: any
  public crosshairRay: any
  public game: Game
  public sprite: Phaser.Physics.Arcade.Sprite
  public spikeIcon: Phaser.GameObjects.Image
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
  public currStateText: Phaser.GameObjects.Text
  public hasSpike: boolean = false
  public team: Team

  constructor(config: AgentConfig) {
    this.game = Game.instance
    this.team = config.team
    if (config.hideSightCones) {
      this.hideSightCones = config.hideSightCones
    }
    this.name = config.name
    this.setupVisionAndCrosshair(config)
    this.sprite = this.game.physics.add
      .sprite(config.position.x, config.position.y, config.texture)
      .setDepth(Constants.SORT_LAYERS.Player)
      .setName('agent')
      .setData('ref', this)

    this.spikeIcon = this.game.add
      .image(config.position.x + 4, config.position.y + 4, 'spike-icon')
      .setDepth(Constants.SORT_LAYERS.UI)
      .setScale(1)
      .setVisible(false)

    this.stateMachine = new StateMachine(
      States.IDLE,
      {
        [States.IDLE]: new IdleState(),
        [States.MOVE]: new MoveState(),
        [States.HOLD]: new HoldState(),
        [States.SHOOT]: new ShootingState(),
        [States.DIE]: new DeathState(),
        [States.PLANT]: new PlantState(),
        [States.DEFUSE]: new DefuseState(),
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
    this.currStateText = this.game.add
      .text(
        this.sprite.x,
        this.sprite.y - this.sprite.displayHeight,
        this.stateMachine.getState(),
        {
          fontSize: '12px',
          color: '#ffffff',
        }
      )
      .setDepth(Constants.SORT_LAYERS.UI)
  }

  setupHealthBar() {
    const healthBarWidth = this.sprite.displayWidth * 2
    this.healthBar = new UIValueBar(this.game, {
      x: this.sprite.x - healthBarWidth / 2,
      y: this.sprite.y - this.sprite.displayHeight - 5,
      height: 2,
      width: healthBarWidth,
      maxValue: Agent.FULL_HEALTH,
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
        return agent.side !== this.side && agent.getCurrState() !== States.DIE
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
    if (this.didDetectEnemy() && this.canShootEnemy()) {
      this.stateMachine.transition(States.SHOOT)
    }
    this.healthBar.x = this.sprite.x - this.healthBar.width / 2
    this.healthBar.y = this.sprite.y - this.sprite.displayHeight - 5
    this.healthBar.draw()

    if (this.game.isDebug) {
      this.currStateText.setText(this.stateMachine.getState()).setVisible(true)
      this.currStateText.setPosition(
        this.sprite.x - this.currStateText.displayWidth / 2,
        this.sprite.y - 20
      )
    }
    this.spikeIcon.setPosition(this.sprite.x + 4, this.sprite.y + 4).setVisible(this.hasSpike)
    if (this.isWithinSpikeExplosion() && this.game.spike.isDetonated) {
      this.setState(States.DIE)
    }
  }

  isWithinSpikeExplosion() {
    return this.game.spike.explosionCircleDetector.contains(this.sprite.x, this.sprite.y)
  }

  setHealth(health: number) {
    this.healthBar.setCurrValue(health)
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

  setState(state: States, ...enterArgs: any) {
    this.stateMachine.transition(state, ...enterArgs)
  }

  highlight() {
    this.sprite.setTintFill(0xffff00)
  }

  dehighlight() {
    this.sprite.clearTint()
  }

  pause() {
    this.isPaused = true
  }

  unpause() {
    this.isPaused = false
  }
}
