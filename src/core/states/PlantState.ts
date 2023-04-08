import Game from '~/scenes/Game'
import UI, { CommandState } from '~/scenes/UI'
import { Constants } from '~/utils/Constants'
import { Agent, Side } from '../Agent'
import { Node } from '../Pathfinding'
import { UIValueBar } from '../ui/UIValueBar'
import { State } from './StateMachine'
import { States } from './States'

export class PlantState extends State {
  public currPath: Node[] = []
  public currNodeToMoveTo: Node | undefined
  public pathLines: Phaser.GameObjects.Line[] = []
  public arrivedAtDestination: boolean = false
  public moveTarget: { x: number; y: number } | null = null

  // Plant spike variables
  public hasStartedPlantingSpike: boolean = false
  public startPlantingSpikeTimestamp: number = -1
  private static SPIKE_PLANT_DURATION_MSEC = 4000
  private spikePlantProgressBar!: UIValueBar
  private spikePlantProgressTimerEvent: Phaser.Time.TimerEvent | null = null

  enter(agent: Agent, pointToMoveTo: { x: number; y: number }) {
    this.arrivedAtDestination = false
    this.moveTarget = null
    const endTilePos = Game.instance.getTilePosForWorldPos(pointToMoveTo.x, pointToMoveTo.y)
    const currTilePos = Game.instance.getTilePosForWorldPos(agent.sprite.x, agent.sprite.y)
    const path = Game.instance.pathfinding.getPath(currTilePos, endTilePos)
    this.currPath = path
    if (agent.side === Side.PLAYER) {
      this.tracePath(agent)
    }
    if (!this.spikePlantProgressBar) {
      this.spikePlantProgressBar = new UIValueBar(Game.instance, {
        width: agent.sprite.displayWidth * 2,
        height: 2,
        fillColor: 0x00ff00,
        maxValue: 100,
        x: agent.sprite.x,
        y: agent.sprite.y,
        borderWidth: 0,
      })
    }
    if (this.spikePlantProgressTimerEvent) {
      this.spikePlantProgressTimerEvent.destroy()
      this.spikePlantProgressTimerEvent = null
    }

    this.spikePlantProgressBar.setVisible(false)
    this.spikePlantProgressBar.setCurrValue(0)
    this.startPlantingSpikeTimestamp = -1
  }

  startPlantingSpike(agent: Agent) {
    this.startPlantingSpikeTimestamp = Date.now()
    this.spikePlantProgressBar.setVisible(true)
    this.spikePlantProgressBar.x = agent.sprite.x - this.spikePlantProgressBar.width / 2
    this.spikePlantProgressBar.y = agent.sprite.y + agent.sprite.displayHeight + 4
    this.spikePlantProgressBar.draw()
    this.spikePlantProgressTimerEvent = Game.instance.time.addEvent({
      callback: () => {
        const amountToIncrement = 100 / (PlantState.SPIKE_PLANT_DURATION_MSEC / 100)
        this.spikePlantProgressBar.setCurrValue(
          this.spikePlantProgressBar.currValue + amountToIncrement
        )
      },
      delay: 100,
      repeat: PlantState.SPIKE_PLANT_DURATION_MSEC / 100,
    })
  }

  execute(agent: Agent) {
    if (this.arrivedAtDestination) {
      if (!this.hasStartedPlantingSpike) {
        this.hasStartedPlantingSpike = true
        console.log('Planting spike!')
        this.startPlantingSpike(agent)
      } else {
        if (this.spikePlantProgressTimerEvent) {
          if (Game.instance.isPaused) {
            this.spikePlantProgressTimerEvent.paused = true
          } else {
            this.spikePlantProgressTimerEvent.paused = false
            if (this.spikePlantProgressTimerEvent.getOverallProgress() === 1) {
              Game.instance.plantSpike(agent, agent.sprite.x, agent.sprite.y)
              this.spikePlantProgressBar.setVisible(false)
              agent.setState(States.IDLE)
            }
          }
        }
      }
    } else {
      if (agent.side === Side.PLAYER) {
        this.tracePath(agent)
      }
      if (PlantState.isAtMoveTarget(agent, this.moveTarget) || !this.moveTarget) {
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

  exit() {
    this.pathLines.forEach((pathLine) => {
      pathLine.destroy()
    })
    this.pathLines = []
    this.hasStartedPlantingSpike = false
    this.arrivedAtDestination = false
    this.moveTarget = null
    this.spikePlantProgressBar.setCurrValue(0)
    this.spikePlantProgressBar.setVisible(false)
    this.startPlantingSpikeTimestamp = -1
    if (this.spikePlantProgressTimerEvent) {
      this.spikePlantProgressTimerEvent.destroy()
      this.spikePlantProgressTimerEvent = null
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
