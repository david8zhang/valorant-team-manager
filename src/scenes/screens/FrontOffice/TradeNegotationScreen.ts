import TeamMgmt, { TeamConfig } from '~/scenes/TeamMgmt'
import { Screen } from '../Screen'

export interface TradeNegotiationScreenConfig {
  teamToTradeWith: TeamConfig
}

export class TradeNegotiationScreen implements Screen {
  private scene: TeamMgmt
  private teamToTradeWith!: TeamConfig

  constructor(scene: TeamMgmt) {
    this.scene = scene
  }

  init(data: TradeNegotiationScreenConfig) {
    if (data) {
      this.teamToTradeWith = data.teamToTradeWith
    }
  }

  setVisible(isVisible: boolean): void {
    throw new Error('Method not implemented.')
  }
  onRender(data?: any): void {
    throw new Error('Method not implemented.')
  }
}
