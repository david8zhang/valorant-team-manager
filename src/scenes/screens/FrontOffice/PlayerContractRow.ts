import { Button } from '~/core/ui/Button'
import TeamMgmt, { PlayerAgentConfig } from '~/scenes/TeamMgmt'
import { PlayerAttributes } from '~/utils/PlayerConstants'
import { RoundConstants } from '~/utils/RoundConstants'
import { Utilities } from '~/utils/Utilities'

export interface PlayerContractConfig {
  playerConfig: PlayerAgentConfig
  isHeader: boolean
  position: {
    x: number
    y: number
  }
  onManage: Function
}

export class PlayerContractRow {
  private scene: TeamMgmt
  private playerNameText: Phaser.GameObjects.Text
  private columnGroup: Phaser.GameObjects.Group
  private buttonColumns: Button[] = []
  private position: { x: number; y: number }
  private isHeader: boolean
  private onManage: Function

  constructor(scene: TeamMgmt, config: PlayerContractConfig) {
    this.scene = scene
    this.position = config.position
    this.isHeader = config.isHeader
    this.onManage = config.onManage
    this.columnGroup = this.scene.add.group()
    this.playerNameText = this.scene.add
      .text(config.position.x, config.position.y, `${config.playerConfig.name}`, {
        fontSize: '15px',
        color: 'black',
      })
      .setOrigin(0)
    this.setupAttributes(config)
  }

  destroy() {
    this.columnGroup.clear(true, true)
    this.columnGroup.destroy()
    this.buttonColumns.forEach((button) => {
      button.destroy()
    })
    this.playerNameText.destroy()
  }

  setVisible(isVisible: boolean) {
    this.playerNameText.setVisible(isVisible)
    this.columnGroup.setVisible(isVisible)
    this.buttonColumns.forEach((button) => {
      button.setVisible(isVisible)
    })
  }

  setupAttributes(config: PlayerContractConfig) {
    const overall = Utilities.getOverallRank(config.playerConfig)
    const contract = config.playerConfig.contract
    const attributes = config.playerConfig.attributes
    const columnConfigs = [
      {
        key: 'Ovr.',
        value: Utilities.getAbbrevRankNameForEnum(overall),
      },
      {
        key: 'Acc.',
        value: Utilities.getAbbrevRankNameForEnum(attributes[PlayerAttributes.ACCURACY]),
      },
      {
        key: 'React.',
        value: Utilities.getAbbrevRankNameForEnum(attributes[PlayerAttributes.REACTION]),
      },
      {
        key: 'HS',
        value: Utilities.getAbbrevRankNameForEnum(attributes[PlayerAttributes.HEADSHOT]),
      },
      {
        key: 'Pot.',
        value: config.playerConfig.potential,
      },
      {
        key: 'Salary',
        value: `$${contract.salary}M`,
      },
      {
        key: 'Length',
        value: contract.duration === 0 ? 'Exp.' : `${contract.duration}Y`,
      },
      {
        buttonConfig: {
          text: 'Manage',
          onClick: () => {
            config.onManage()
          },
        },
      },
    ]
    let xPos = RoundConstants.TEAM_MGMT_SIDEBAR_WIDTH + 225
    const columnWidth =
      (TeamMgmt.BODY_WIDTH - (xPos - RoundConstants.TEAM_MGMT_SIDEBAR_WIDTH) - 100) /
      columnConfigs.length
    columnConfigs.forEach((columnConfig: any) => {
      if (columnConfig.buttonConfig) {
        const button = new Button({
          scene: this.scene,
          width: columnWidth,
          height: 25,
          strokeColor: 0x000000,
          strokeWidth: 1,
          text: columnConfig.buttonConfig.text,
          onClick: () => {
            columnConfig.buttonConfig.onClick()
          },
          x: xPos,
          y: config.position.y + 10,
        })
        this.buttonColumns.push(button)
      } else {
        const attr = columnConfig.key
        const value = columnConfig.value
        const valueText = this.scene.add
          .text(xPos, config.position.y, value, {
            fontSize: '15px',
            color: 'black',
          })
          .setOrigin(0)
        if (columnConfig.fontStyle) {
          valueText.setStyle(columnConfig.fontStyle)
        }

        if (config.isHeader) {
          const headerText = this.scene.add.text(
            xPos,
            config.position.y - valueText.displayHeight - 10,
            attr,
            {
              fontSize: '10px',
              color: 'black',
            }
          )
          headerText
            .setPosition(headerText.x - headerText.displayWidth / 2, headerText.y)
            .setOrigin(0)
          this.columnGroup.add(headerText)
        }
        valueText.setPosition(valueText.x - valueText.displayWidth / 2, valueText.y)
        this.columnGroup.add(valueText)
      }
      xPos += columnWidth + 15
    })
  }
}
