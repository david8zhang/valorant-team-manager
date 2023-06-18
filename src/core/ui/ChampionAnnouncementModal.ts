import TeamMgmt, { TeamConfig } from '~/scenes/TeamMgmt'
import { RoundConstants } from '~/utils/RoundConstants'
import { Button } from './Button'

export interface ChampionAnnouncementModalConfig {
  champion: TeamConfig | null
  onContinue: Function
  depth: number
}

export class ChampionAnnouncementModal {
  private bgRect: Phaser.GameObjects.Rectangle
  private announcementText: Phaser.GameObjects.Text
  private continueButton: Button
  private scene: TeamMgmt

  constructor(scene: TeamMgmt, config: ChampionAnnouncementModalConfig) {
    this.scene = scene

    this.bgRect = this.scene.add.rectangle(
      (RoundConstants.TEAM_MGMT_SIDEBAR_WIDTH + RoundConstants.WINDOW_WIDTH) / 2,
      RoundConstants.WINDOW_HEIGHT / 2,
      500,
      300
    )
    this.bgRect.setStrokeStyle(1, 0x000000).setFillStyle(0xffffff).setDepth(config.depth)

    this.announcementText = this.scene.add
      .text(this.bgRect.x, this.bgRect.y, '', {
        fontSize: '20px',
        color: 'black',
        align: 'center',
      })
      .setDepth(config.depth)
      .setWordWrapWidth(this.bgRect.displayWidth - 30, true)

    if (config.champion) {
      this.announcementText.setText(`${config.champion.name} have won the championship!`)
      this.announcementText.setStyle({
        fontSize: '30px',
        color: 'black',
        align: 'center',
      })
      this.announcementText.setPosition(
        this.bgRect.x - this.announcementText.displayWidth / 2,
        this.bgRect.y - this.announcementText.displayHeight / 2 - 50
      )
    }

    this.continueButton = new Button({
      scene: this.scene,
      onClick: () => {
        config.onContinue()
      },
      fontSize: '15px',
      textColor: 'black',
      width: 200,
      height: 50,
      strokeColor: 0x000000,
      strokeWidth: 1,
      x: this.bgRect.x,
      y: this.announcementText.y + this.announcementText.displayHeight + 50,
      text: 'Continue',
      depth: RoundConstants.SORT_LAYERS.UI,
    })
  }

  setVisible(isVisible: boolean) {
    this.continueButton.setVisible(isVisible)
    this.announcementText.setVisible(isVisible)
    this.bgRect.setVisible(isVisible)
  }

  destroy() {
    this.announcementText.destroy()
    this.bgRect.destroy()
    this.continueButton.destroy()
  }

  updateChampion(champion: TeamConfig) {
    this.announcementText.setText(`${champion.name} have won the championship!`)
    this.announcementText.setStyle({
      fontSize: '30px',
      color: 'black',
      align: 'center',
    })
    this.announcementText.setPosition(
      this.bgRect.x - this.announcementText.displayWidth / 2,
      this.bgRect.y - this.announcementText.displayHeight / 2 - 50
    )
  }
}
