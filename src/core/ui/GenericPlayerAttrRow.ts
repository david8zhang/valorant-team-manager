import { Scene } from 'phaser'
import TeamMgmt from '~/scenes/TeamMgmt'
import { RoundConstants } from '~/utils/RoundConstants'
import { Button } from './Button'

export interface GenericPlayerAttrRowConfig {
  position: {
    x: number
    y: number
  }
  isHeader: boolean
  name?: string
  showName?: boolean
  columnConfigs: {
    key: string
    value?: string
    buttonConfig?: {
      text: string
      onClick: Function
    }
  }[]
  columnFontStyle?: {
    color: string
    fontSize: string
  }
}

export class GenericPlayerAttrRow {
  private scene: Scene
  private showName: boolean = false
  private position: {
    x: number
    y: number
  }
  private isHeader: boolean
  private columnGroup: Phaser.GameObjects.Group
  private buttonColumns: Button[] = []
  private playerNameText: Phaser.GameObjects.Text | null = null
  private columnConfigs: {
    key: string
    value?: string
    buttonConfig?: {
      text: string
      onClick: Function
    }
  }[]
  private columnFontStyle?: {
    color: string
    fontSize: string
  }

  constructor(scene: Scene, config: GenericPlayerAttrRowConfig) {
    this.scene = scene
    this.position = config.position
    this.isHeader = config.isHeader
    this.columnConfigs = config.columnConfigs
    this.columnGroup = this.scene.add.group()
    if (config.showName) {
      this.showName = config.showName
      this.playerNameText = this.scene.add
        .text(config.position.x, config.position.y, `${config.name}`, {
          fontSize: '15px',
          color: 'black',
        })
        .setOrigin(0)
    }
    if (config.columnFontStyle) {
      this.columnFontStyle = config.columnFontStyle
    }
    this.setupColumns()
  }

  destroy() {
    this.columnGroup.clear(true, true)
    this.columnGroup.destroy()
    this.playerNameText?.destroy()
    this.buttonColumns.forEach((button) => {
      button.destroy()
    })
  }

  setVisible(isVisible: boolean) {
    if (this.playerNameText) {
      this.playerNameText.setVisible(isVisible)
    }
    this.columnGroup.setVisible(isVisible)
    this.buttonColumns.forEach((button) => {
      button.setVisible(isVisible)
    })
  }

  setupColumns() {
    let xPos = this.position.x
    if (this.showName) {
      xPos += 200
    }
    const columnWidth =
      (TeamMgmt.BODY_WIDTH - (xPos - RoundConstants.TEAM_MGMT_SIDEBAR_WIDTH) - 50) /
      this.columnConfigs.length
    this.columnConfigs.forEach((columnConfig: any) => {
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
          y: this.position.y + 10,
        })
        this.buttonColumns.push(button)
      } else {
        const attr = columnConfig.key
        const value = columnConfig.value
        const fontStyle = this.columnFontStyle
          ? this.columnFontStyle
          : {
              fontSize: '20px',
              color: 'black',
            }
        const valueText = this.scene.add.text(xPos, this.position.y, value, fontStyle).setOrigin(0)
        if (this.isHeader) {
          const headerText = this.scene.add.text(
            xPos,
            this.position.y - valueText.displayHeight - 10,
            attr,
            {
              fontSize: '15px',
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
