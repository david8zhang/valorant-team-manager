import Game from '~/scenes/Game'
import { Node } from '../Pathfinding'
import { Agent, Side } from '../Agent'
import { UIValueBar } from '../ui/UIValueBar'
import { State } from './StateMachine'
import { States } from './States'
import { Constants } from '~/utils/Constants'

export class DefuseState extends State {
  public currPath: Node[] = []
  public currNodeToMoveTo: Node | undefined
  public pathLines: Phaser.GameObjects.Line[] = []
  public moveTarget: { x: number; y: number } | null = null

  public spikeDefuseProgressBar!: UIValueBar
  public spikeDefuseText!: Phaser.GameObjects.Text
  public arrivedAtDestination: boolean = false
  public hasStartedDefusingSpike: boolean = false

  public startDefusingSpikeTimestamp: number = -1
  private spikeDefuseProgressTimerEvent: Phaser.Time.TimerEvent | null = null

  private static SPIKE_DEFUSE_DURATION_MSEC = 7000

  enter(agent: Agent, pointToMoveTo: { x: number; y: number }) {
    this.arrivedAtDestination = false
    this.startDefusingSpikeTimestamp = -1
    this.moveTarget = null
    const endTilePos = Game.instance.getTilePosForWorldPos(pointToMoveTo.x, pointToMoveTo.y)
    const currTilePos = Game.instance.getTilePosForWorldPos(agent.sprite.x, agent.sprite.y)
    const path = Game.instance.pathfinding.getPath(currTilePos, endTilePos)
    this.currPath = path
    if (agent.side === Side.PLAYER) {
      this.tracePath(agent)
    }
    agent.sprite.setVelocity(0, 0)
    if (!this.spikeDefuseProgressBar) {
      this.spikeDefuseProgressBar = new UIValueBar(Game.instance, {
        width: agent.sprite.displayWidth * 2,
        height: 2,
        fillColor: 0x00ff00,
        maxValue: 100,
        x: agent.sprite.x,
        y: agent.sprite.y,
        borderWidth: 0,
      })
    }
    if (!this.spikeDefuseText) {
      this.spikeDefuseText = Game.instance.add
        .text(this.spikeDefuseProgressBar.x, this.spikeDefuseProgressBar.y, 'Defusing', {
          fontSize: '10px',
          color: 'white',
        })
        .setDepth(Constants.SORT_LAYERS.UI)
    }
    if (this.spikeDefuseProgressTimerEvent) {
      this.spikeDefuseProgressTimerEvent.destroy()
      this.spikeDefuseProgressTimerEvent = null
    }
    this.spikeDefuseProgressBar.setCurrValue(0)
    this.spikeDefuseProgressBar.setVisible(false)
    this.spikeDefuseText.setVisible(false)
  }

  exit() {
    this.pathLines.forEach((pathLine) => {
      pathLine.destroy()
    })
    this.pathLines = []
    this.hasStartedDefusingSpike = false
    this.arrivedAtDestination = false
    this.moveTarget = null
    this.spikeDefuseProgressBar.setCurrValue(0)
    this.spikeDefuseProgressBar.setVisible(false)
    this.startDefusingSpikeTimestamp = -1
    if (this.spikeDefuseProgressTimerEvent) {
      this.spikeDefuseProgressTimerEvent.destroy()
      this.spikeDefuseProgressTimerEvent = null
    }
  }

  startDefusingSpike(agent: Agent) {
    this.startDefusingSpikeTimestamp = Date.now()
    this.spikeDefuseProgressBar.setVisible(true)
    this.spikeDefuseText.setVisible(true)
    this.spikeDefuseProgressBar.x = agent.sprite.x - this.spikeDefuseProgressBar.width / 2
    this.spikeDefuseProgressBar.y = agent.sprite.y + agent.sprite.displayHeight + 4
    this.spikeDefuseProgressBar.draw()
    this.spikeDefuseProgressTimerEvent = Game.instance.time.addEvent({
      callback: () => {
        const amountToIncrement = 100 / (DefuseState.SPIKE_DEFUSE_DURATION_MSEC / 100)
        this.spikeDefuseProgressBar.setCurrValue(
          this.spikeDefuseProgressBar.currValue + amountToIncrement
        )
      },
      delay: 100,
      repeat: DefuseState.SPIKE_DEFUSE_DURATION_MSEC / 100,
    })
    this.spikeDefuseText.setPosition(
      this.spikeDefuseProgressBar.x -
        (this.spikeDefuseText.displayWidth - this.spikeDefuseProgressBar.width) / 2,
      this.spikeDefuseProgressBar.y + 4
    )
  }

  execute(agent: Agent) {
    if (this.arrivedAtDestination) {
      if (!this.hasStartedDefusingSpike) {
        this.hasStartedDefusingSpike = true
        this.startDefusingSpike(agent)
      } else {
        if (this.spikeDefuseProgressTimerEvent) {
          if (Game.instance.isPaused) {
            this.spikeDefuseProgressTimerEvent.paused = true
          } else {
            this.spikeDefuseProgressTimerEvent.paused = false
            if (this.spikeDefuseProgressTimerEvent.getOverallProgress() === 1) {
              Game.instance.defuseSpike()
              this.spikeDefuseProgressBar.setVisible(false)
              this.spikeDefuseText.setVisible(false)
              agent.setState(States.IDLE)
            }
          }
        }
      }
    } else {
      if (agent.side === Side.PLAYER) {
        this.tracePath(agent)
      }
      if (DefuseState.isAtMoveTarget(agent, this.moveTarget) || !this.moveTarget) {
        const currNode = this.currPath.shift()
        if (currNode) {
          this.moveTarget = Game.instance.getWorldPosForTilePos(
            currNode.position.row,
            currNode.position.col
          )
        } else {
          this.arrivedAtDestination = true
        }
      }
      this.moveTowardTarget(agent)
      this.setRayDirection(agent)
    }
  }

  private tracePath(agent: Agent) {
    this.pathLines.forEach((line) => {
      line.destroy()
    })
    this.pathLines = []
    const tileAtMoveTarget = this.currPath[0]
    if (!tileAtMoveTarget) {
      return
    }

    const currNodeWorldPos = Game.instance.getWorldPosForTilePos(
      tileAtMoveTarget.position.row,
      tileAtMoveTarget.position.col
    )
    const initialLine = Game.instance.add
      .line(0, 0, agent.sprite.x, agent.sprite.y, currNodeWorldPos.x, currNodeWorldPos.y)
      .setStrokeStyle(0.5, 0x00ff00)
      .setDisplayOrigin(0.5)
      .setDepth(Constants.SORT_LAYERS.UI)
    this.pathLines.push(initialLine)
    for (let i = 1; i < this.currPath.length; i++) {
      const prevNode = this.currPath[i - 1]
      const currNode = this.currPath[i]
      const prevNodeWorldPos = Game.instance.getWorldPosForTilePos(
        prevNode.position.row,
        prevNode.position.col
      )
      const currNodeWorldPos = Game.instance.getWorldPosForTilePos(
        currNode.position.row,
        currNode.position.col
      )
      const line = Game.instance.add
        .line(0, 0, currNodeWorldPos.x, currNodeWorldPos.y, prevNodeWorldPos.x, prevNodeWorldPos.y)
        .setStrokeStyle(0.5, 0x00ff00)
        .setDisplayOrigin(0.5)
        .setDepth(Constants.SORT_LAYERS.UI)
      this.pathLines.push(line)
    }
  }

  public static isAtMoveTarget(agent: Agent, moveTarget: { x: number; y: number } | null) {
    if (!moveTarget) {
      return false
    }
    const distanceToTarget = Phaser.Math.Distance.Between(
      moveTarget.x,
      moveTarget.y,
      agent.sprite.x,
      agent.sprite.y
    )
    return distanceToTarget < 1
  }

  private setRayDirection(agent: Agent) {
    if (this.moveTarget && !this.arrivedAtDestination && !agent.isPaused) {
      const angle = Phaser.Math.Angle.Between(
        agent.sprite.x,
        agent.sprite.y,
        this.moveTarget.x,
        this.moveTarget.y
      )
      agent.visionRay.setAngle(angle)
      agent.crosshairRay.setAngle(angle)
    }
  }

  private moveTowardTarget(agent: Agent) {
    if (Game.instance.isPaused) {
      agent.sprite.setVelocity(0, 0)
      return
    }
    if (this.arrivedAtDestination) {
      this.moveTarget = null
      agent.sprite.setVelocity(0, 0)
      return
    }
    if (this.moveTarget) {
      const angle = Phaser.Math.Angle.BetweenPoints(
        {
          x: agent.sprite.x,
          y: agent.sprite.y,
        },
        this.moveTarget
      )
      const velocityVector = new Phaser.Math.Vector2()
      Game.instance.physics.velocityFromRotation(angle, 100, velocityVector)
      agent.sprite.setVelocity(velocityVector.x, velocityVector.y)
    }
  }
}
