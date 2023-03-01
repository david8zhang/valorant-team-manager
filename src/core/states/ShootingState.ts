import Game from '~/scenes/Game'
import { Constants, GunConfig } from '~/utils/Constants'
import { Agent } from '../Agent'
import { State } from './StateMachine'
import { States } from './States'

export class ShootingState extends State {
  public target: Agent | null = null
  private lastBulletFiredTimestamp: number = 0
  private muzzleFlareSprite!: Phaser.GameObjects.Sprite

  enter(agent: Agent, target?: Agent) {
    if (target) {
      this.target = target
    } else {
      Game.instance.time.delayedCall(250, () => {
        agent.sprite.setVelocity(0, 0)
        agent.highlightCircle.setVelocity(0, 0)

        const intersections = agent.visionRay.castCone()
        const enemyAgents: Agent[] = intersections
          .filter((n) => {
            return n.object && n.object.name === 'agent'
          })
          .map((n) => {
            return n.object.getData('ref') as Agent
          })

        // Target the closest agent distance-wise
        let closestAgent = enemyAgents[0]
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
        if (!this.muzzleFlareSprite) {
          this.muzzleFlareSprite = Game.instance.add
            .sprite(agent.sprite.x, agent.sprite.y, 'muzzle-flare')
            .setDepth(Constants.SORT_LAYERS.Player + 100)
            .setVisible(false)
        }
      })
    }
  }

  execute(agent: Agent) {
    if (this.target) {
      agent.graphics.lineStyle(0, 0xffffff)
      // Rotate agent to face the enemy target
      const angle = Phaser.Math.Angle.Between(
        agent.sprite.x,
        agent.sprite.y,
        this.target.sprite.x,
        this.target.sprite.y
      )
      agent.visionRay.setAngle(angle)
      agent.crosshairRay.setAngle(angle)
      this.fireBullet(agent, angle)
    }
  }

  fireBullet(agent: Agent, angle: number) {
    if (this.target && agent.currWeapon) {
      const currTimestamp = Date.now()
      const weaponConfig = Constants.GUN_CONFIGS[agent.currWeapon] as GunConfig

      if (currTimestamp - this.lastBulletFiredTimestamp > weaponConfig.fireDelay) {
        this.muzzleFlareSprite.setPosition(agent.sprite.x, agent.sprite.y)
        this.muzzleFlareSprite.setAngle(Phaser.Math.RadToDeg(angle))
        this.muzzleFlareSprite.setOrigin(0, 0.5)
        this.muzzleFlareSprite.setAlpha(1)
        this.muzzleFlareSprite.setVisible(true)

        this.lastBulletFiredTimestamp = currTimestamp

        const tracerLine = Game.instance.add
          .line(0, 0, agent.sprite.x, agent.sprite.y, this.target.sprite.x, this.target.sprite.y)
          .setStrokeStyle(1, 0xffff00)
          .setDisplayOrigin(0.5)

        Game.instance.tweens.add({
          targets: [tracerLine, this.muzzleFlareSprite],
          alpha: {
            from: 1,
            to: 0,
          },
          duration: 75,
          onComplete: () => {
            this.handleRandomShot(weaponConfig)
            tracerLine.destroy()
          },
        })
      }
    }
  }

  handleRandomShot(weaponConfig: GunConfig) {
    const shotTypes = ['body', 'armsAndLegs', 'head']
    const randomShotType = shotTypes[Phaser.Math.Between(0, shotTypes.length - 1)]
    const damage = weaponConfig.damage[randomShotType]
    if (this.target) {
      this.target.takeDamage(damage)
    }
  }

  exit() {
    this.target = null
    this.lastBulletFiredTimestamp = 0
    this.muzzleFlareSprite.setVisible(false)
  }
}
