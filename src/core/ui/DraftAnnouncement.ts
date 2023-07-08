import { Scene } from 'phaser'
import { PlayerAgentConfig, TeamConfig } from '~/scenes/TeamMgmt/TeamMgmt'
import { RoundConstants } from '~/utils/RoundConstants'
import { Button } from './Button'

export interface DraftAnnouncementConfig {
  teamConfig: TeamConfig
  draftProspect: PlayerAgentConfig
  pickNum: number
}

export class DraftAnnouncement {
  private scene: Scene
  private continueButton: Button
  private draftAnnouncementGroup: Phaser.GameObjects.Group
  private position: {
    x: number
    y: number
  }

  constructor(scene: Scene, position: { x: number; y: number }, goToNextPickFn: Function) {
    this.scene = scene
    this.draftAnnouncementGroup = this.scene.add.group()
    this.position = position
    this.continueButton = new Button({
      scene: this.scene,
      width: 150,
      height: 50,
      x: position.x,
      y: position.y + 150,
      onClick: () => {
        goToNextPickFn()
      },
      text: 'Continue',
      strokeColor: 0x000000,
      strokeWidth: 1,
      fontSize: '18px',
    })
    this.continueButton.setVisible(false)
  }

  setVisible(isVisible: boolean) {
    this.draftAnnouncementGroup.setVisible(isVisible)
    this.continueButton.setVisible(isVisible)
  }

  hide() {
    this.setVisible(false)
  }

  announceDraftPick(config: DraftAnnouncementConfig) {
    this.draftAnnouncementGroup.clear(true, true)
    const announcementText = this.scene.add
      .text(
        this.position.x,
        this.position.y,
        `With the ${config.pickNum + 1} pick, ${config.teamConfig.name} select`,
        {
          fontSize: '15px',
          color: 'black',
        }
      )
      .setOrigin(0)
      .setWordWrapWidth(300)
      .setAlign('center')

    announcementText.setPosition(
      this.position.x - announcementText.displayWidth / 2,
      this.position.y
    )

    const draftProspectImage = this.scene.add.image(
      this.position.x,
      this.position.y + announcementText.displayHeight + 75,
      ''
    )
    draftProspectImage.setDisplaySize(100, 100)
    const draftProspectName = this.scene.add.text(
      this.position.x,
      draftProspectImage.y + draftProspectImage.displayHeight / 2 + 15,
      `${config.draftProspect.name}`,
      {
        fontSize: '18px',
        color: 'black',
      }
    )
    draftProspectName.setPosition(
      this.position.x - draftProspectName.displayWidth / 2,
      draftProspectName.y
    )
    this.continueButton.setPosition(
      this.position.x,
      draftProspectName.y + draftProspectName.displayHeight + 75
    )
    this.draftAnnouncementGroup.add(announcementText)
    this.draftAnnouncementGroup.add(draftProspectImage)
    this.draftAnnouncementGroup.add(draftProspectName)
    this.continueButton.setVisible(true)
  }
}
