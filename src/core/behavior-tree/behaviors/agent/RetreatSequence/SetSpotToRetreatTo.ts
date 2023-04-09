import { Agent } from '~/core/Agent'
import { BehaviorStatus } from '~/core/behavior-tree/BehaviorStatus'
import { BehaviorTreeNode } from '~/core/behavior-tree/BehaviorTreeNode'
import { Blackboard } from '~/core/behavior-tree/Blackboard'
import Game from '~/scenes/Game'
import { BlackboardKeys } from '../BlackboardKeys'

export class SetSpotToRetreatTo extends BehaviorTreeNode {
  constructor(blackboard: Blackboard) {
    super('GetSpotToRetreatTo', blackboard)
  }

  public process(trace?: boolean | undefined): BehaviorStatus {
    const retreatSpot = this.getBestRetreatSpot()
    if (!retreatSpot) {
      return BehaviorStatus.FAILURE
    }
    const tile = Game.instance.map.getTileAtRowCol(retreatSpot[0], retreatSpot[1])!
    this.blackboard.setData(BlackboardKeys.SPOT_TO_RETREAT_TO, {
      x: tile.getCenterX(),
      y: tile.getCenterY(),
    })
    return BehaviorStatus.SUCCESS
  }

  getBestRetreatSpot() {
    const currAgent = this.blackboard.getData(BlackboardKeys.CURR_AGENT) as Agent

    // Get all the tiles within a N tile radius of the current agent
    // N can be adjusted
    const startTile = Game.instance.map.getTileAt(currAgent.sprite.x, currAgent.sprite.y)
    const tilesWithinRadius = this.getTilesWithinRadius(startTile, 4)
    const safeTilesWithinRadius = tilesWithinRadius.filter((tile) => this.isTileSafe(tile))

    if (safeTilesWithinRadius.length > 0) {
      return safeTilesWithinRadius.sort((a, b) => {
        return this.distanceToClosestAgent(b) - this.distanceToClosestAgent(a)
      })[0]
    }
    return null
  }

  distanceToClosestAgent(tilePos: number[]) {
    const tile = Game.instance.map.getTileAtRowCol(tilePos[0], tilePos[1])
    const enemyAgents = this.blackboard.getData(BlackboardKeys.PLAYER_AGENTS) as Agent[]
    let closestDist = Number.MAX_SAFE_INTEGER
    enemyAgents.forEach((agent) => {
      closestDist = Math.min(
        Phaser.Math.Distance.Between(
          agent.sprite.x,
          agent.sprite.y,
          tile.getCenterX(),
          tile.getCenterY()
        ),
        closestDist
      )
    })
    return closestDist
  }

  getTilesWithinRadius(startTile: { x: number; y: number } | null, radius: number) {
    // Perform BFS
    const map = Game.instance.map
    if (!startTile) {
      return []
    }

    const directions = [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
      [1, 1],
      [-1, 1],
      [1, -1],
      [-1, -1],
    ]
    const queue: number[][] = [[startTile.y, startTile.x]]
    let distance = 0
    const resultTiles: number[][] = []
    const seen = new Set<string>()

    while (queue.length > 0 && distance < radius) {
      distance++
      const length = queue.length
      for (let i = 0; i < length; i++) {
        const currTile = queue.shift()!
        directions.forEach((dir) => {
          const newTile = [currTile[0] + dir[0], currTile[1] + dir[1]] // y corresponds to row, x corresponds to column
          if (
            map.isTileCoordWithinBounds(newTile[0], newTile[1]) &&
            map.isTileWalkable(newTile[0], newTile[1]) &&
            !seen.has(`${newTile[0]},${newTile[1]}`)
          ) {
            resultTiles.push(newTile)
            queue.push(newTile)
            seen.add(`${newTile[0]},${newTile[1]}`)
          }
        })
      }
    }
    return resultTiles
  }

  public isTileSafe(tilePos: number[]) {
    const tile = Game.instance.map.getTileAtRowCol(tilePos[0], tilePos[1])
    const enemyAgents = this.blackboard.getData(BlackboardKeys.PLAYER_AGENTS) as Agent[]
    for (let i = 0; i < enemyAgents.length; i++) {
      const agent = enemyAgents[i]
      const distanceToAgent = Phaser.Math.Distance.Between(
        agent.sprite.x,
        agent.sprite.y,
        tile.getCenterX(),
        tile.getCenterY()
      )
      if (
        agent.isPointWithinVision(tile.getCenterX(), tile.getCenterY()) ||
        distanceToAgent <= 100
      ) {
        return false
      }
    }
    return true
  }
}
