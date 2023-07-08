import { Screen } from '../Screen'
import { FrontOfficeCard } from './FrontOfficeCard'
import { RoundConstants } from '~/utils/RoundConstants'
import TeamMgmt from '~/scenes/TeamMgmt/TeamMgmt'
import { ScreenKeys } from '../ScreenKeys'

export class FrontOfficeScreen implements Screen {
  private scene: TeamMgmt
  private cards: FrontOfficeCard[] = []

  constructor(scene: TeamMgmt) {
    this.scene = scene
    this.setupCardOptions()
    this.setVisible(false)
  }

  setupCardOptions() {
    const configs = [
      {
        text: 'Contracts',
        onClick: () => {
          this.scene.renderActiveScreen(ScreenKeys.CONTRACTS)
        },
      },
      {
        text: 'Trades',
        onClick: () => {
          this.scene.renderActiveScreen(ScreenKeys.TRADES)
        },
      },
      {
        text: 'Free Agents',
        onClick: () => {
          this.scene.renderActiveScreen(ScreenKeys.FREE_AGENTS)
        },
      },
    ]
    const padding = 15
    let xPos = RoundConstants.TEAM_MGMT_SIDEBAR_WIDTH + padding
    const cardWidth =
      TeamMgmt.BODY_WIDTH / configs.length - padding * ((configs.length + 1) / configs.length)

    configs.forEach((config) => {
      const newCard = new FrontOfficeCard(this.scene, {
        position: {
          x: xPos,
          y: padding,
        },
        width: cardWidth,
        height: RoundConstants.WINDOW_HEIGHT - padding * 2,
        text: config.text,
        onClick: config.onClick,
      })
      this.cards.push(newCard)
      xPos += cardWidth + padding
    })
  }

  onRender(data?: any): void {}
  setVisible(isVisible: boolean): void {
    this.cards.forEach((card) => {
      card.setVisible(isVisible)
    })
  }
}
