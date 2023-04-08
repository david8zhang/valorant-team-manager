import { Agent } from '~/core/Agent'
import { BehaviorStatus } from '~/core/behavior-tree/BehaviorStatus'
import { BehaviorTreeNode } from '~/core/behavior-tree/BehaviorTreeNode'
import { Blackboard } from '~/core/behavior-tree/Blackboard'
import { States } from '~/core/states/States'
import Game from '~/scenes/Game'
import { Sites } from '~/utils/Constants'
import { MapConstants } from '~/utils/MapConstants'
import { BlackboardKeys } from '../BlackboardKeys'

export class PlantSpike extends BehaviorTreeNode {
  public siteToPlantOn: Sites | null = null

  constructor(blackboard: Blackboard) {
    super('PlantSpike', blackboard)
    Game.instance.onResetRoundHandlers.push(() => {
      this.siteToPlantOn = null
      this.blackboard.setData(BlackboardKeys.SITE_TO_PLANT_ON, null)
    })
  }

  public process(): BehaviorStatus {
    const siteToPlantOn = this.blackboard.getData(BlackboardKeys.SITE_TO_PLANT_ON)
    if (!siteToPlantOn) {
      return BehaviorStatus.FAILURE
    }
    let plantLocation: { x: number; y: number } | null = null
    switch (siteToPlantOn) {
      case Sites.A: {
        plantLocation = MapConstants.DEFAULT_PLANT_LOCATIONS.A
        break
      }
      case Sites.B: {
        plantLocation = MapConstants.DEFAULT_PLANT_LOCATIONS.B
        break
      }
    }
    if (!plantLocation) {
      return BehaviorStatus.FAILURE
    }
    const currAgent = this.blackboard.getData(BlackboardKeys.CURR_AGENT) as Agent
    if (currAgent.getCurrState() !== States.SHOOT) {
      if (!this.siteToPlantOn || siteToPlantOn !== this.siteToPlantOn) {
        this.siteToPlantOn = siteToPlantOn
        currAgent.setState(States.PLANT, plantLocation)
      }
    }
    return BehaviorStatus.SUCCESS
  }
}
