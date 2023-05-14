import { Scene } from 'phaser'
import TeamMgmt from '~/scenes/TeamMgmt'
import { PlayerAttributes, PlayerRank } from '~/utils/PlayerConstants'
import { RoundConstants } from '~/utils/RoundConstants'

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
}

export class PlayerAttrRow {
  private scene: Scene
  private nameText: Phaser.GameObjects.Text
  private columnGroup: Phaser.GameObjects.Group

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
  }

  destroy() {
    this.nameText.destroy()
    this.columnGroup.clear(true, true)
    this.columnGroup.destroy()
  }

  setVisible(isVisible: boolean) {
    this.nameText.setVisible(isVisible)
    this.columnGroup.setVisible(isVisible)
  }

  setupAttributes(config: AgentTableRowStatsConfig) {
    let xPos = this.nameText.x + this.nameText.displayWidth + 75
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
