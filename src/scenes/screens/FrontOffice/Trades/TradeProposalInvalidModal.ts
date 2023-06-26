import TeamMgmt from '~/scenes/TeamMgmt'
import { RoundConstants } from '~/utils/RoundConstants'

export class TradeProposalInvalidModal {
  private scene: TeamMgmt
  private bgRect: Phaser.GameObjects.Rectangle

  constructor(scene: TeamMgmt) {
    this.scene = scene
    this.bgRect = this.scene.add
      .rectangle(
        (RoundConstants.TEAM_MGMT_SIDEBAR_WIDTH + RoundConstants.WINDOW_WIDTH) / 2,
        RoundConstants.WINDOW_HEIGHT / 2,
        500,
        400,
        0xffffff
      )
      .setStrokeStyle(1, 0x000000)
      .setDepth(RoundConstants.SORT_LAYERS.Modal)
  }
}
