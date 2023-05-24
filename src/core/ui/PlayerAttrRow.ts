import { Scene } from 'phaser'
import TeamMgmt from '~/scenes/TeamMgmt'
import { PlayerAttributes, PlayerRank } from '~/utils/PlayerConstants'
import { RoundConstants } from '~/utils/RoundConstants'
import { Button } from './Button'

export interface AgentTableRowStatsConfig {
  isHeader: boolean
  position: {
    x: number
    y: number
  }
  name: string
  attributes: {
    [key in PlayerAttributes]: PlayerRank
  }
  buttonConfig: {
    shouldShow: boolean
    onClick: Function
  }
}

export class PlayerAttrRow {
  private scene: Scene
  private nameText: Phaser.GameObjects.Text
  private columnGroup: Phaser.GameObjects.Group
  private showStatsButton!: Button

  constructor(scene: Scene, config: AgentTableRowStatsConfig) {
    this.scene = scene
    this.nameText = this.scene.add
      .text(config.position.x, config.position.y, config.name, {
        color: 'black',
        fontSize: '15px',
      })
      .setOrigin(0, 0)
    this.columnGroup = this.scene.add.group()
    this.setupAttributes(config)
    this.setupShowStatDrilldownButton(config)
  }

  setupShowStatDrilldownButton(config: AgentTableRowStatsConfig) {
    const xPos = RoundConstants.WINDOW_WIDTH - 50
    if (config.buttonConfig.shouldShow) {
      this.showStatsButton = new Button({
        scene: this.scene,
        width: 75,
        height: 25,
        text: 'Show Stats',
        fontSize: '10px',
        onClick: () => {
          config.buttonConfig.onClick()
        },
        strokeColor: 0x000000,
        strokeWidth: 1,
        x: xPos,
        y: config.position.y + 5,
      })
    }
  }

  destroy() {
    this.nameText.destroy()
    this.showStatsButton.destroy()
    this.columnGroup.clear(true, true)
    this.columnGroup.destroy()
  }

  setVisible(isVisible: boolean) {
    this.nameText.setVisible(isVisible)
    this.columnGroup.setVisible(isVisible)
    this.showStatsButton.setVisible(isVisible)
  }

  setupAttributes(config: AgentTableRowStatsConfig) {
    let xPos = RoundConstants.TEAM_MGMT_SIDEBAR_WIDTH + 150
    const columnWidth =
      (TeamMgmt.BODY_WIDTH - (xPos - RoundConstants.TEAM_MGMT_SIDEBAR_WIDTH)) /
      Object.keys(config.attributes).length
    Object.keys(config.attributes).forEach((key: string) => {
      const attr = key as PlayerAttributes

      // TODO: Replace this with rank icons
      const rankIcon = this.scene.add
        .text(xPos, this.nameText.y, config.attributes[key], {
          fontSize: '15px',
          color: 'black',
        })
        .setOrigin(0)

      if (config.isHeader) {
        const headerText = this.scene.add.text(
          xPos,
          this.nameText.y - rankIcon.displayHeight - 10,
          attr.toUpperCase(),
          {
            fontSize: '12px',
            color: 'black',
          }
        )
        headerText
          .setPosition(headerText.x - headerText.displayWidth / 2, headerText.y)
          .setOrigin(0)
        this.columnGroup.add(headerText)
      }
      this.columnGroup.add(rankIcon)
      xPos += columnWidth + 15
    })
  }
}
