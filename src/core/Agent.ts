import Game from '~/scenes/Game'
import UI from '~/scenes/UI'
import { Constants, Role } from '~/utils/Constants'
import { GunTypes, GUN_CONFIGS } from '~/utils/GunConstants'
import { DeathState } from './states/DeathState'
import { IdleState } from './states/IdleState'
import { MoveState } from './states/MoveState'
import { RespawnState } from './states/RespawnState'
import { ShootingState } from './states/ShootingState'
import { StateMachine } from './states/StateMachine'
import { States } from './states/States'
import { Team } from './Team'
import { UIValueBar } from './ui/UIValueBar'
import { Utility, UtilityConfig } from './utility/Utility'
import { UtilityKey } from './utility/UtilityKey'
import { UtilityMapping } from './utility/UtilityMapping'
import { UtilityName } from './utility/UtilityNames'

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
  raycaster: any
  side: Side
  role: Role
  team: Team
  stats: {
    accuracyPct: number
    headshotPct: number
    reactionTimeMs: number
  }
  utility: {
    [key in UtilityKey]?: UtilityName
  }
  hideSightCones?: boolean
  fireOnSight?: boolean
  onDetectedEnemyHandler?: Function
}

export class Agent {
  public static FULL_HEALTH: number = 100

  // All the raycasters
  public visionRay: any
  public visionPolygon!: Phaser.Geom.Polygon
  public shotRay: any
  public role: Role

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
  public currWeapon: GunTypes = GunTypes.PISTOL
  public agentNameText: Phaser.GameObjects.Text
  public hasSpike: boolean = false
  public team: Team

  public kills: number = 0
  public deaths: number = 0
  public assists: number = 0
  public credits: number = 0

  // The damage that this agent has received from enemies (used for determining kills/assists)
  private damageMapping: {
    [key: string]: number
  } = {}
  private killerId: string | null = null

  // Stats of the player controlling the agent
  public stats: {
    accuracyPct: number
    headshotPct: number
    reactionTimeMs: number // Affects how quickly agent will turn to return fire
  }

  // Location the agent is currently holding (will fire on sight)
  public holdLocation: {
    x: number
    y: number
  } | null = null

  // Whether or not the agent fires as soon as they see an enemy
  public fireOnSight: boolean = false

  // Set to true if the agent is in the process of reacting to a shot
  public isBeingShotAt: boolean = false

  // Determines if the agent should return fire when being shot at (can be overridden so that
  // agent does something else instead, like retreat)
  public shouldFireBack: boolean = true

  // Utility that the agent has, mapped to keyboard keys
  public utilityMapping: {
    [key in UtilityKey]?: Utility
  } = {}

  // Custom handler for when the agent sees an enemy
  public onDetectedEnemyHandlers: Function[] = []
  public onKillEnemyHandlers: Function[] = []
  public onWasKilledByEnemyHandlers: Function[] = []

  public healTimerEvent: Phaser.Time.TimerEvent

  constructor(config: AgentConfig) {
    this.game = Game.instance
    this.team = config.team
    this.stats = config.stats
    if (config.hideSightCones) {
      this.hideSightCones = config.hideSightCones
    }
    this.name = config.name
    this.role = config.role
    this.setupVisionAndCrosshair(config)
    this.sprite = this.game.physics.add
      .sprite(config.position.x, config.position.y, config.texture)
      .setDepth(Constants.SORT_LAYERS.Player)
      .setName('agent')
      .setData('ref', this)
      .setPushable(false)

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
        [States.SHOOT]: new ShootingState(),
        [States.DIE]: new DeathState(),
        [States.RESPAWN]: new RespawnState(),
      },
      [this]
    )

    this.graphics = this.game.add.graphics({
      lineStyle: { width: 2, color: 0x00ffff, alpha: 0.3 },
    })
    this.side = config.side
    this.setupHealthBar()
    this.agentNameText = this.game.add
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
    this.setupUtility(config.utility)
    if (config.onDetectedEnemyHandler) {
      this.onDetectedEnemyHandlers.push(config.onDetectedEnemyHandler)
    }
    if (config.fireOnSight) {
      this.fireOnSight = config.fireOnSight
    }

    // Heal the agent if they aren't in combat for a while
    this.healTimerEvent = this.game.time.addEvent({
      loop: true,
      delay: 1000,
      callback: () => {
        this.healOverTime()
      },
    })
  }

  healOverTime() {
    if (this.getCurrState() !== States.SHOOT && !this.isBeingShotAt) {
      const newValue = Math.min(this.healthBar.maxValue, this.healthBar.currValue + 25)
      this.healthBar.setCurrValue(newValue)
    }
  }

  setupUtility(agentUtility: {
    [key in UtilityKey]?: UtilityName
  }) {
    Object.keys(agentUtility).forEach((key) => {
      const utilityName = agentUtility[key]
      const UtilityClass = UtilityMapping[utilityName]
      const utilityConfig: UtilityConfig = {
        key: key as UtilityKey,
        texture: '',
        name: utilityName as UtilityName,
        agent: this,
      }
      this.utilityMapping[key] = new UtilityClass(this.game, utilityConfig)
    })
  }

  triggerUtility(key: UtilityKey, ...args: any) {
    const utility = this.utilityMapping[key]
    if (utility) {
      utility.use(...args)
    }
  }

  getUtilityMapping(): { [key in UtilityKey]?: Utility } {
    return this.utilityMapping
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

  onKillEnemy(enemyAgent: Agent) {
    this.game.addScore(this.side)
    this.credits += Constants.KILL_CREDITS_AMOUNT
    UI.instance.renderKillMessage(this, enemyAgent)
    this.onKillEnemyHandlers.forEach((handler) => {
      handler(enemyAgent)
    })
    enemyAgent.onWasKilledByEnemyHandlers.forEach((handler) => {
      handler(this)
    })
  }

  get health() {
    return this.healthBar.currValue
  }

  takeDamage(damage: number, attacker: Agent) {
    const newValue = Math.max(0, this.healthBar.currValue - damage)
    this.healthBar.setCurrValue(newValue)
    if (!this.damageMapping[attacker.name]) {
      this.damageMapping[attacker.name] = 0
    }
    this.damageMapping[attacker.name] += damage
    if (newValue == 0) {
      this.deaths++
      this.stateMachine.transition(States.DIE)
      if (!this.killerId) {
        this.killerId = attacker.name
        attacker.kills++
        attacker.onKillEnemy(this)
        Object.keys(this.damageMapping).forEach((name) => {
          if (name !== this.killerId) {
            const agent = this.game.getAgentByName(name)
            if (agent) {
              agent.credits += Constants.ASSIST_CREDITS_AMOUNT
              agent.assists++
            }
          }
        })
      }
    }
  }

  reactToShot(shooter: Agent) {
    this.isBeingShotAt = true
    const angleToShooter = Phaser.Math.Angle.Between(
      this.sprite.x,
      this.sprite.y,
      shooter.sprite.x,
      shooter.sprite.y
    )

    // if the agent has "fireOnSight" toggled
    this.game.time.delayedCall(this.stats.reactionTimeMs, () => {
      this.visionRay.setAngle(angleToShooter)
      if (this.getCurrState() !== States.DIE) {
        this.setState(States.SHOOT, shooter)
      }
    })
  }

  setupVisionAndCrosshair(config: AgentConfig) {
    this.visionRay = config.raycaster.createRay({
      origin: config.position,
    })
    this.visionRay.setAngle(Phaser.Math.DegToRad(config.sightAngleDeg))
    this.visionRay.setConeDeg(60)

    this.shotRay = config.raycaster.createRay({
      origin: config.position,
    })
    this.shotRay.setAngle(Phaser.Math.DegToRad(config.sightAngleDeg))
  }

  getDetectedEnemies(): Agent[] {
    // Currently, this will only account for enemies detected by the agent's own vision
    // TODO: Once recon utility is added, we can modify this logic to include enemies detected by recon as well
    const intersections = this.visionRay.castCone()
    const intersectedObjects = intersections.filter((n) => {
      if (!n.object || n.object.name !== 'agent') {
        return false
      }
      const agent = n.object.getData('ref') as Agent
      return agent.side !== this.side && agent.getCurrState() !== States.DIE
    })
    return intersectedObjects.map((obj) => {
      return obj.object.getData('ref') as Agent
    })
  }

  setHoldLocation(worldX: number, worldY: number) {
    this.holdLocation = {
      x: worldX,
      y: worldY,
    }
    const angle = Phaser.Math.Angle.Between(this.sprite.x, this.sprite.y, worldX, worldY)
    this.visionRay.setAngle(angle)
    this.shotRay.setAngle(angle)
  }

  handleDidDetectEnemy() {
    const detectedEnemies = this.getDetectedEnemies()
    if (detectedEnemies.length > 0) {
      this.onDetectedEnemyHandlers.forEach((handler) => {
        handler(detectedEnemies)
      })
      if (this.canShootEnemy()) {
        this.stateMachine.transition(States.SHOOT)
      }
    }
  }

  update() {
    this.graphics.clear()
    this.stateMachine.step()
    this.updateVisionAndCrosshair()
    this.handleDidDetectEnemy()
    this.healthBar.x = this.sprite.x - this.healthBar.width / 2
    this.healthBar.y = this.sprite.y - this.sprite.displayHeight - 5
    this.healthBar.draw()

    if (this.game.isDebug) {
      this.agentNameText.setText(this.name).setVisible(true)
      this.agentNameText.setPosition(
        this.sprite.x - this.agentNameText.displayWidth / 2,
        this.sprite.y - 20
      )
    }
  }

  // Reset after a round ends
  reset(resetConfig: { x: number; y: number; sightAngle: number; showOnMap: boolean }) {
    this.healTimerEvent.reset({
      loop: true,
      delay: 1000,
      callback: () => {
        this.healOverTime()
      },
    })
    this.healTimerEvent.paused = false
    this.isBeingShotAt = false
    this.damageMapping = {}
    this.fireOnSight = false
    this.killerId = null
    this.hasSpike = false

    this.setState(States.IDLE)
    this.sprite.setPosition(resetConfig.x, resetConfig.y)
    this.setHealth(Agent.FULL_HEALTH)
    this.holdLocation = null
    this.visionRay.setAngle(Phaser.Math.DegToRad(resetConfig.sightAngle))

    Object.keys(this.utilityMapping).forEach((key) => {
      const utility = this.utilityMapping[key] as Utility
      utility.reset()
    })

    if (resetConfig.showOnMap) {
      this.sprite.setVisible(true)
      this.healthBar.setVisible(true)
      this.hideSightCones = false
    } else {
      this.sprite.setVisible(false)
      this.healthBar.setVisible(false)
      this.hideSightCones = true
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
      this.stateMachine.getState() !== States.SHOOT &&
      this.stateMachine.getState() !== States.DIE &&
      this.shouldShootOnSight()
    )
  }

  shouldShootOnSight() {
    return this.holdLocation !== null || this.fireOnSight
  }

  isPointWithinVision(x: number, y: number) {
    if (this.visionPolygon) {
      return this.visionPolygon.contains(x, y)
    }
  }

  updateVisionAndCrosshair() {
    if (this.getCurrState() !== States.DIE) {
      this.visionRay.setOrigin(this.sprite.x, this.sprite.y)
      this.shotRay.setOrigin(this.sprite.x, this.sprite.y)

      const visionIntersections = this.visionRay.castCone()
      this.updateVisionPolygonObj(visionIntersections)

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
      if (!this.hideSightCones) {
        // hide sight cones (for CPU agents)
        this.game.draw(visionIntersections)
      }
    }
  }

  updateVisionPolygonObj(visionIntersections: Phaser.Geom.Point[]) {
    if (this.visionPolygon) {
      this.visionPolygon.setTo([
        ...visionIntersections,
        new Phaser.Geom.Point(this.sprite.x, this.sprite.y),
      ])
    } else {
      this.visionPolygon = new Phaser.Geom.Polygon([
        ...visionIntersections,
        new Phaser.Geom.Point(this.sprite.x, this.sprite.y),
      ])
    }
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
