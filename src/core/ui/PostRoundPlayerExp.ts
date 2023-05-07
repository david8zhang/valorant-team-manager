import { PostRound } from '~/scenes/PostRound'
import { PlayerStatGrowthConfig } from '~/scenes/screens/PostRound/PostRoundPlayerExpScreen'
import { PlayerAttributes, PlayerRank } from '~/utils/PlayerConstants'

export interface PostRoundPlayerStatsConfig {
  position: {
    x: number
    y: number
  }
  width: number
  height: number
  name: string
  exp: {
    [key in PlayerAttributes]?: PlayerStatGrowthConfig
  }
}

export class PostRoundPlayerExp {
  private scene: PostRound
  private rectangle: Phaser.GameObjects.Rectangle
  private playerNameText: Phaser.GameObjects.Text

  constructor(scene: PostRound, config: PostRoundPlayerStatsConfig) {
    this.scene = scene
    this.rectangle = this.scene.add
      .rectangle(config.position.x, config.position.y, config.width, config.height)
      .setStrokeStyle(1, 0x000000)
      .setOrigin(0)
    this.playerNameText = this.scene.add.text(this.rectangle.x, this.rectangle.y, config.name, {
      fontSize: '24px',
      color: 'black',
    })
    this.playerNameText.setPosition(
      this.rectangle.x + this.rectangle.displayWidth / 2 - this.playerNameText.displayWidth / 2,
      this.rectangle.y + 200
    )
  }

  setVisible(isVisible: boolean) {
    this.rectangle.setVisible(isVisible)
    this.playerNameText.setVisible(isVisible)
  }
}
