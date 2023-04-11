import Game from '~/scenes/Game'
import { GunTypes, GUN_CONFIGS } from '~/utils/GunConstants'
import { MapConstants, Region } from '~/utils/MapConstants'
import { Agent } from '../Agent'
import { State } from './StateMachine'

export class RespawnState extends State {
  enter(agent: Agent) {
    const regionToRespawnIn = this.getRegionToRespawnIn()
    const randomPointWithinRegion = this.getRandomTilePointWithinRegion(regionToRespawnIn)

    const shouldBuy = Phaser.Math.Between(0, 1) == 0
    if (shouldBuy) {
      agent.currWeapon = this.buyNewWeapon(agent)
      agent.credits -= GUN_CONFIGS[agent.currWeapon].cost
    }

    agent.reset({
      x: randomPointWithinRegion.x,
      y: randomPointWithinRegion.y,
      sightAngle: 90,
      showOnMap: true,
    })
  }
  buyNewWeapon(agent: Agent): GunTypes {
    let bestWeaponToPurchase = GunTypes.PISTOL
    const allGunTypes = Object.keys(GunTypes)
    for (let i = 0; i < allGunTypes.length; i++) {
      const gunType = allGunTypes[i]
      const gunConfig = GUN_CONFIGS[gunType]
      if (agent.credits >= gunConfig.cost) {
        bestWeaponToPurchase = gunType as GunTypes
      }
    }
    return bestWeaponToPurchase
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
