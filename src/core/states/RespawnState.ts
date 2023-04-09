import Game from '~/scenes/Game'
import { MapConstants, Region } from '~/utils/MapConstants'
import { Agent } from '../Agent'
import { State } from './StateMachine'

export class RespawnState extends State {
  enter(agent: Agent) {
    const regionToRespawnIn = this.getRegionToRespawnIn()
    const randomPointWithinRegion = this.getRandomTilePointWithinRegion(regionToRespawnIn)
    agent.reset({
      x: randomPointWithinRegion.x,
      y: randomPointWithinRegion.y,
      sightAngle: 90,
      showOnMap: true,
    })
  }

  getRandomTilePointWithinRegion(region: Region) {
    const topLeftTile = Game.instance.getTileAt(region.topLeft.x, region.topLeft.y)!
    const bottomRightTile = Game.instance.getTileAt(region.bottomRight.x, region.bottomRight.y)!
    const row = Phaser.Math.Between(topLeftTile.y, bottomRightTile.y)
    const col = Phaser.Math.Between(topLeftTile.x, bottomRightTile.x)
    return Game.instance.getWorldPosForTilePos(row, col)
  }

  getRegionToRespawnIn() {
    const allRegions = MapConstants.MAP_CALLOUT_LOCATIONS
    const regionWithNoAgents = allRegions.filter((region) => {
      return !this.containsAgent(region)
    })
    return regionWithNoAgents[Phaser.Math.Between(0, regionWithNoAgents.length - 1)]
  }

  containsAgent(region: Region) {
    const playerAgents = Game.instance.player.agents
    const cpuAgents = Game.instance.cpu.agents
    const allAgents = playerAgents.concat(cpuAgents)
    for (let i = 0; i < allAgents.length; i++) {
      const agent = allAgents[i]
      if (
        region.topLeft.x <= agent.sprite.x &&
        region.topLeft.y <= agent.sprite.y &&
        region.bottomRight.x >= agent.sprite.x &&
        region.bottomRight.y >= agent.sprite.y
      ) {
        return true
      }
    }
    return false
  }
}
