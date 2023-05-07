import Round from '~/scenes/Round'
import { RoundConstants } from '~/utils/RoundConstants'
import { getRangeForPoints, GUN_CONFIGS, GunConfig, Range } from '~/utils/GunConstants'
import { Agent } from '../Agent'
import { State } from './StateMachine'
import { States } from './States'

export class ShootingState extends State {
  public target: Agent | null = null
  private lastBulletFiredTimestamp: number = 0
  private muzzleFlareSprite!: Phaser.GameObjects.Sprite
  private tracerLine: Phaser.GameObjects.Line | null = null
  private isWithinReactionDelay = true

  enter(agent: Agent, target?: Agent) {
    if (target) {
      this.target = target
    } else {
      this.setTarget(agent)
    }
    agent.sprite.setVelocity(0, 0)
    if (!this.muzzleFlareSprite) {
      this.muzzleFlareSprite = Round.instance.add
        .sprite(agent.sprite.x, agent.sprite.y, 'muzzle-flare')
        .setDepth(RoundConstants.SORT_LAYERS.Player + 100)
        .setVisible(false)
    }
    this.isWithinReactionDelay = true
    Round.instance.time.delayedCall(250, () => {
      this.isWithinReactionDelay = false
    })
  }

  setTarget(agent: Agent) {
    const intersections = agent.visionRay.castCone()
    const enemyAgents: Agent[] = intersections
      .filter((n) => {
        return n.object && n.object.name === 'agent'
      })
      .map((n) => {
        return n.object.getData('ref') as Agent
      })
      .filter((agent) => {
        return agent.getCurrState() !== States.DIE
      })

    // Target the closest agent distance-wise
    let closestAgent: Agent | null = null
    let closestDist = Number.MAX_SAFE_INTEGER
    for (let i = 0; i < enemyAgents.length; i++) {
      const enemyAgent = enemyAgents[i]
      const distToEnemyAgent = Phaser.Math.Distance.Between(
        agent.sprite.x,
        agent.sprite.y,
        enemyAgent.sprite.x,
        enemyAgent.sprite.y
      )
      if (distToEnemyAgent < closestDist) {
        closestAgent = enemyAgent
        closestDist = distToEnemyAgent
      }
    }
    this.target = closestAgent
  }

  isTargetVisible(agent) {
    const intersections = agent.visionRay.castCone()
    if (!this.target) {
      return false
    }
    return (
      intersections
        .filter((n) => {
          return n.object && n.object.name === 'agent'
        })
        .map((n) => {
          return n.object.getData('ref') as Agent
        })
        .find((agent) => agent.name === this.target!.name) !== undefined
    )
  }

  execute(agent: Agent) {
    if (!this.target || !this.isTargetVisible(agent)) {
      if (agent.health > 0) {
        agent.setState(States.IDLE)
      }
    } else {
      if (!this.isWithinReactionDelay) {
        if (this.target.getCurrState() === States.DIE) {
          if (agent.health > 0) {
            agent.setState(States.IDLE)
          }
        } else {
          agent.graphics.lineStyle(0, 0xffffff)
          // Rotate agent to face the enemy target
          const angle = Phaser.Math.Angle.Between(
            agent.sprite.x,
            agent.sprite.y,
            this.target.sprite.x,
            this.target.sprite.y
          )
          agent.visionRay.setAngle(angle)
          this.fireBullet(agent, angle)
        }
      }
    }
  }

  fireBullet(agent: Agent, angle: number) {
    if (this.target && agent.currWeapon && !Round.instance.isPaused) {
      const currTimestamp = Date.now()
      const weaponConfig = GUN_CONFIGS[agent.currWeapon] as GunConfig

      if (currTimestamp - this.lastBulletFiredTimestamp > weaponConfig.fireDelay) {
        this.muzzleFlareSprite.setPosition(agent.sprite.x, agent.sprite.y)
        this.muzzleFlareSprite.setAngle(Phaser.Math.RadToDeg(angle))
        this.muzzleFlareSprite.setOrigin(0, 0.5)
        this.muzzleFlareSprite.setAlpha(1)
        this.muzzleFlareSprite.setVisible(true)

        this.lastBulletFiredTimestamp = currTimestamp

        const rangeOfFight = getRangeForPoints(agent.sprite, this.target.sprite) as Range
        const accuracyModifier = weaponConfig.rangeAccModifiers[rangeOfFight]
        const accuracyPct = agent.stats.accuracyPct * accuracyModifier
        const randNum = Phaser.Math.Between(1, 100)

        if (accuracyPct > randNum) {
          this.handleHit(agent, weaponConfig)
        } else {
          this.handleMiss(agent, weaponConfig)
        }
        this.target.reactToShot(agent)
      }
    }
  }

  handleMiss(agent: Agent, weaponConfig: GunConfig) {
    const angle = Phaser.Math.Angle.Between(
      agent.sprite.x,
      agent.sprite.y,
      this.target!.sprite.x,
      this.target!.sprite.y
    )
    const angleDiff =
      Phaser.Math.Between(0, 1) === 0 ? Phaser.Math.Between(-2, -5) : Phaser.Math.Between(2, 5)
    const missAngle = Phaser.Math.DegToRad(Phaser.Math.RadToDeg(angle) + angleDiff)
    agent.shotRay.setAngle(missAngle)
    const intersection = agent.shotRay.cast()

    this.tracerLine = Round.instance.add
      .line(0, 0, agent.sprite.x, agent.sprite.y, intersection.x, intersection.y)
      .setStrokeStyle(1, 0xfeff32)
      .setDisplayOrigin(0.5)
      .setDepth(RoundConstants.SORT_LAYERS.UI + 100)

    Round.instance.tweens.add({
      targets: [this.tracerLine, this.muzzleFlareSprite],
      alpha: {
        from: 1,
        to: 0,
      },
      duration: 75,
      onComplete: () => {
        if (this.tracerLine) {
          this.tracerLine.destroy()
        }
      },
    })
  }

  handleHit(agent: Agent, weaponConfig: GunConfig) {
    this.tracerLine = Round.instance.add
      .line(0, 0, agent.sprite.x, agent.sprite.y, this.target!.sprite.x, this.target!.sprite.y)
      .setStrokeStyle(1, 0xfeff32)
      .setDisplayOrigin(0.5)
      .setDepth(RoundConstants.SORT_LAYERS.UI + 100)
    Round.instance.tweens.add({
      targets: [this.tracerLine, this.muzzleFlareSprite],
      alpha: {
        from: 1,
        to: 0,
      },
      duration: 75,
      onComplete: () => {
        this.handleRandomShot(agent, weaponConfig)
        if (this.tracerLine) {
          this.tracerLine.destroy()
        }
      },
    })
  }

  handleRandomShot(agent: Agent, weaponConfig: GunConfig) {
    if (this.target) {
      const headshotPct = agent.stats.headshotPct
      const randNum = Phaser.Math.Between(1, 100)
      let shotType = ''
      if (headshotPct >= randNum) {
        shotType = 'head'
      } else {
        const nonHeadShotTypes = ['body', 'armsAndLegs']
        shotType = nonHeadShotTypes[Phaser.Math.Between(0, nonHeadShotTypes.length - 1)]
      }
      const damage = weaponConfig.damage[shotType]
      this.target.takeDamage(damage, agent)
    }
  }

  exit(agent: Agent) {
    agent.isBeingShotAt = false
    this.target = null
    this.lastBulletFiredTimestamp = 0
    this.muzzleFlareSprite.setVisible(false)
    if (this.tracerLine) {
      this.tracerLine.destroy()
    }
  }
}
