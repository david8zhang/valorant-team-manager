import { UIValueBar } from '~/core/ui/UIValueBar'
import TeamMgmt from '~/scenes/TeamMgmt'
import { PlayerRank } from '~/utils/PlayerConstants'
import { RoundConstants } from '~/utils/RoundConstants'
import { Utilities } from '~/utils/Utilities'

export interface PlayerDrilldownAttrRowConfig {
  name: string
  value: string
  exp: {
    currValue: number
    maxValue: number
  }
  rank: PlayerRank
  position: {
    x: number
    y: number
  }
}

export class PlayerDrilldownAttrRow {
  private scene: TeamMgmt
  private playerNameText: Phaser.GameObjects.Text
  private valueText!: Phaser.GameObjects.Text
  private rankText!: Phaser.GameObjects.Text
  private expBar!: UIValueBar

  constructor(scene: TeamMgmt, config: PlayerDrilldownAttrRowConfig) {
    this.scene = scene
    this.playerNameText = this.scene.add
      .text(config.position.x, config.position.y, `${config.name}`, {
        fontSize: '18px',
        color: 'black',
      })
      .setOrigin(0)
    this.setupColumns(config)
  }

  updateConfig(config: PlayerDrilldownAttrRowConfig) {
    this.valueText.setText(config.value)
    this.expBar.setCurrValue(config.exp.currValue)
    this.expBar.setMaxValue(config.exp.maxValue)

    const rankTextStr = Utilities.getRankNameForEnum(config.rank)
    this.rankText.setText(rankTextStr)
  }

  setupColumns(config: PlayerDrilldownAttrRowConfig) {
    const startOfColumnsX = 150
    const totalWidth = TeamMgmt.BODY_WIDTH - startOfColumnsX
    const columnWidth = Math.floor(totalWidth / 3)
    let xPos = RoundConstants.TEAM_MGMT_SIDEBAR_WIDTH + startOfColumnsX
    this.valueText = this.scene.add.text(
      xPos + columnWidth / 2,
      this.playerNameText.y,
      `${config.value}`,
      {
        fontSize: '18px',
        color: 'black',
      }
    )
    this.valueText.setPosition(this.valueText.x - this.valueText.displayWidth / 2, this.valueText.y)
    xPos += columnWidth
    this.expBar = new UIValueBar(this.scene, {
      width: columnWidth - 20,
      height: 10,
      maxValue: config.exp.maxValue,
      x: xPos,
      y: this.valueText.y + 5,
      borderWidth: 0,
    })
    this.expBar.setCurrValue(config.exp.currValue)

    xPos += columnWidth
    const rankTextStr = Utilities.getRankNameForEnum(config.rank)
    this.rankText = this.scene.add.text(
      xPos + columnWidth / 2,
      this.valueText.y,
      `${rankTextStr}`,
      {
        fontSize: '18px',
        color: 'black',
      }
    )
    this.rankText.setPosition(this.rankText.x - this.rankText.displayWidth / 2, this.rankText.y)
  }

  setVisible(isVisible: boolean) {
    this.expBar.setVisible(isVisible)
    this.rankText.setVisible(isVisible)
    this.playerNameText.setVisible(isVisible)
    this.valueText.setVisible(isVisible)
  }
}
