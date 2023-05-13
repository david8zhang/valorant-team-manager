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
  private expText!: Phaser.GameObjects.Text

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
    const startOfColumnsX = 150
    const totalWidth = TeamMgmt.BODY_WIDTH - startOfColumnsX
    const columnWidth = Math.floor(totalWidth / 3)
    this.valueText.setText(config.value)
    this.expBar.setCurrValue(config.exp.currValue)
    this.expBar.setMaxValue(config.exp.maxValue)

    this.expText.setText(`${config.exp.currValue}/${config.exp.maxValue}`)
    this.expText.setPosition(
      this.expBar.x + columnWidth / 2 - 10 - this.expText.displayWidth / 2,
      this.expText.y
    )

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
      y: this.valueText.y + 10,
      borderWidth: 0,
    })
    this.expBar.setCurrValue(config.exp.currValue)
    this.expText = this.scene.add
      .text(
        this.expBar.x + columnWidth / 2 - 10,
        this.expBar.y - 20,
        `${config.exp.currValue}/${config.exp.maxValue}`,
        {
          fontSize: '15px',
          color: 'black',
        }
      )
      .setOrigin(0)
    this.expText.setPosition(this.expText.x - this.expText.displayWidth / 2, this.expText.y)

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
    this.expText.setVisible(isVisible)
    this.rankText.setVisible(isVisible)
    this.playerNameText.setVisible(isVisible)
    this.valueText.setVisible(isVisible)
  }
}
