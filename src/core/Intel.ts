import { GunTypes } from '~/utils/GunConstants'
import { Agent } from './Agent'
import { States } from './states/States'

export interface IntelMapping {
  [agentId: string]: {
    lastKnownHealth?: number
    lastKnownGunType?: GunTypes | null
    lastKnownPosition?: {
      x: number
      y: number
    }
    isDead?: boolean
  }
}

export class Intel {
  public dataMapping: IntelMapping = {}

  updateIntel(detectedEnemies: Agent[]) {
    detectedEnemies.forEach((agent: Agent) => {
      const isDead = agent.getCurrState() === States.DIE
      if (!isDead || (this.dataMapping[agent.name] && !this.dataMapping[agent.name].isDead)) {
        this.dataMapping[agent.name] = {
          lastKnownHealth: agent.healthBar.currValue,
          lastKnownGunType: agent.currWeapon,
          lastKnownPosition: {
            x: agent.sprite.x,
            y: agent.sprite.y,
          },
          isDead,
        }
      }
    })
  }

  retrieveIntel(): IntelMapping {
    return this.dataMapping
  }

  retrieveIntelForAgentName(name: string) {
    return this.dataMapping[name]
  }
}
