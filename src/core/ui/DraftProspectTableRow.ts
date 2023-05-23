import { Scene } from 'phaser'
import TeamMgmt, { PlayerAgentConfig } from '~/scenes/TeamMgmt'
import { PlayerAttributes } from '~/utils/PlayerConstants'
import { RoundConstants } from '~/utils/RoundConstants'
import { Button } from './Button'
import { Utilities } from '~/utils/Utilities'

export interface DraftProspectTableRowConfig {
  position: {
    x: number
    y: number
  }
  playerConfig: PlayerAgentConfig
  isHeader: boolean
  onDraft: Function
  onScout: Function
  isScouted: boolean
}

export class DraftProspectTableRow {
  private scene: Scene
  private columnGroup: Phaser.GameObjects.Group
  private nameText: Phaser.GameObjects.Text
  private scoutButton!: Button
  private draftButton!: Button
  private potentialText!: Phaser.GameObjects.Text
  private isScouted: boolean = false

  constructor(scene: Scene, config: DraftProspectTableRowConfig) {
    this.scene = scene
    this.nameText = this.scene.add
      .text(config.position.x, config.position.y, config.playerConfig.name, {
        color: 'black',
        fontSize: '15px',
      })
      .setOrigin(0, 0)
    this.columnGroup = this.scene.add.group()
    this.isScouted = config.isScouted
    this.setupAttributes(config)
  }

  setVisible(isVisible: boolean) {
    this.nameText.setVisible(isVisible)
    this.columnGroup.setVisible(isVisible)
    this.scoutButton.setVisible(isVisible)
    this.potentialText.setVisible(isVisible)
    this.draftButton.setVisible(isVisible)
  }

  destroy() {
    this.nameText.destroy()
    this.columnGroup.clear(true, true)
    this.scoutButton.destroy()
    this.potentialText.destroy()
    this.draftButton.destroy()
  }

  setupAttributes(config: DraftProspectTableRowConfig) {
    let xPos = 330
    let yPos = 0
    const columnWidth =
      (TeamMgmt.BODY_WIDTH - (350 - RoundConstants.TEAM_MGMT_SIDEBAR_WIDTH)) /
      (Object.keys(config.playerConfig.attributes).length + 3)
    Object.keys(config.playerConfig.attributes).forEach((key: string) => {
      const attr = key as PlayerAttributes

      // TODO: Replace this with rank icons
      const rankIcon = this.scene.add
        .text(xPos, this.nameText.y, config.playerConfig.attributes[key], {
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
        yPos = headerText.y
        this.columnGroup.add(headerText)
      }
      this.columnGroup.add(rankIcon)
      xPos += columnWidth + 15
    })

    // Add Overall Rank
    const overall = Utilities.getOverallRank(config.playerConfig)
    const overallRank = this.scene.add
      .text(xPos, this.nameText.y, `${overall}`, {
        fontSize: '15px',
        color: 'black',
      })
      .setOrigin(0)

    if (config.isHeader) {
      const overallHeader = this.scene.add.text(xPos, yPos, 'OVERALL', {
        fontSize: '12px',
        color: 'black',
      })
      overallHeader
        .setPosition(overallHeader.x - overallHeader.displayWidth / 2, overallHeader.y)
        .setOrigin(0)
      this.columnGroup.add(overallHeader)
    }
    this.columnGroup.add(overallRank)
    xPos += columnWidth + 15

    // Add Potential
    this.scoutButton = new Button({
      scene: this.scene,
      onClick: () => {
        config.onScout()
      },
      text: 'Scout',
      width: 75,
      height: 25,
      fontSize: '12px',
      textColor: 'black',
      strokeColor: 0x000000,
      strokeWidth: 1,
      x: xPos,
      y: config.position.y + 8,
    })
    this.scoutButton.setVisible(!this.isScouted)
    this.potentialText = this.scene.add
      .text(xPos, this.nameText.y, `${config.playerConfig.potential}`, {
        fontSize: '15px',
        color: 'black',
      })
      .setOrigin(0)
      .setVisible(this.isScouted)
    if (config.isHeader) {
      const potentialHeader = this.scene.add.text(xPos, yPos, 'POTENTIAL', {
        fontSize: '12px',
        color: 'black',
      })
      potentialHeader
        .setPosition(potentialHeader.x - potentialHeader.displayWidth / 2, potentialHeader.y)
        .setOrigin(0)
      this.columnGroup.add(potentialHeader)
    }
    xPos += columnWidth
    this.draftButton = new Button({
      scene: this.scene,
      onClick: () => {
        config.onDraft()
      },
      text: 'Draft',
      width: 75,
      height: 25,
      fontSize: '12px',
      textColor: 'black',
      strokeColor: 0x000000,
      strokeWidth: 1,
      x: xPos,
      y: config.position.y + 8,
    })
  }

  revealPotential() {
    this.isScouted = true
    this.scoutButton.setVisible(false)
    this.potentialText.setVisible(true)
  }
}
