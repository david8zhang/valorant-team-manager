import { Scene } from 'phaser'
import { Screen } from './Screen'
import { PlayerAgentConfig } from '../TeamMgmt'
import { Save, SaveKeys } from '~/utils/Save'
import { PlayerAttributes, PlayerRank } from '~/utils/PlayerConstants'
import { RoundConstants } from '~/utils/RoundConstants'
import { DraftProspectTableRow } from '~/core/ui/DraftProspectTableRow'
import { Utilities } from '~/utils/Utilities'

export class DraftScreen implements Screen {
  public static PAGE_SIZE = 10
  public static NUM_DRAFT_PROSPECTS = 20

  private scene: Scene
  private titleText: Phaser.GameObjects.Text
  private currPageIndex: number = 0
  public draftProspectRows: DraftProspectTableRow[] = []
  private leftButton!: Phaser.GameObjects.Image
  private rightButton!: Phaser.GameObjects.Image
  private scoutPointsText!: Phaser.GameObjects.Text

  constructor(scene: Scene) {
    this.scene = scene
    this.titleText = this.scene.add
      .text(RoundConstants.TEAM_MGMT_SIDEBAR_WIDTH + 15, 15, 'Draft Prospects', {
        fontSize: '25px',
        color: 'black',
      })
      .setOrigin(0)
    this.setupScoutPointsText()
    this.setupPaginationButton()
    this.setVisible(false)
  }

  setupScoutPointsText() {
    let scoutPoints = Save.getData(SaveKeys.SCOUT_POINTS) as number
    if (!scoutPoints) {
      Save.setData(SaveKeys.SCOUT_POINTS, RoundConstants.DEFAULT_SCOUT_POINTS)
      scoutPoints = RoundConstants.DEFAULT_SCOUT_POINTS
    }
    this.scoutPointsText = this.scene.add
      .text(
        this.titleText.x,
        this.titleText.y + this.titleText.displayHeight + 15,
        `Scout Points: ${scoutPoints}`,
        {
          fontSize: '18px',
          color: 'black',
        }
      )
      .setOrigin(0)
  }

  loadSavedDraftProspects() {
    let savedDraftProspects = Save.getData(SaveKeys.DRAFT_PROSPECTS) as PlayerAgentConfig[]
    if (!savedDraftProspects) {
      let savedDraftProspects = this.generateDraftProspects().sort((a, b) => {
        return Utilities.getOverallRank(b) - Utilities.getOverallRank(a)
      })
      Save.setData(SaveKeys.DRAFT_PROSPECTS, savedDraftProspects)
    }
    return savedDraftProspects
  }

  setupPaginationButton() {
    this.leftButton = this.scene.add
      .image(
        RoundConstants.TEAM_MGMT_SIDEBAR_WIDTH + 20,
        RoundConstants.WINDOW_HEIGHT - 20,
        'backward'
      )
      .setScale(0.5)
      .setInteractive()
      .on(Phaser.Input.Events.POINTER_DOWN, () => {
        this.leftButton.setAlpha(0.5)
      })
      .on(Phaser.Input.Events.POINTER_DOWN_OUTSIDE, () => {
        this.updateDraftPage(-1)
        this.leftButton.setAlpha(1)
      })
      .on(Phaser.Input.Events.POINTER_UP, () => {
        this.updateDraftPage(-1)
        this.leftButton.setAlpha(1)
      })
      .on(Phaser.Input.Events.POINTER_UP_OUTSIDE, () => {
        this.updateDraftPage(-1)
        this.leftButton.setAlpha(1)
      })

    this.rightButton = this.scene.add
      .image(RoundConstants.WINDOW_WIDTH - 20, RoundConstants.WINDOW_HEIGHT - 20, 'forward')
      .setScale(0.5)
      .setInteractive()
      .on(Phaser.Input.Events.POINTER_DOWN, () => {
        this.rightButton.setAlpha(0.5)
      })
      .on(Phaser.Input.Events.POINTER_DOWN_OUTSIDE, () => {
        this.updateDraftPage(1)
        this.rightButton.setAlpha(1)
      })
      .on(Phaser.Input.Events.POINTER_UP, () => {
        this.updateDraftPage(1)
        this.rightButton.setAlpha(1)
      })
      .on(Phaser.Input.Events.POINTER_UP_OUTSIDE, () => {
        this.updateDraftPage(1)
        this.rightButton.setAlpha(1)
      })
  }

  updateDraftPage(diff: number) {
    const draftProspects = this.loadSavedDraftProspects()
    this.currPageIndex += diff
    this.currPageIndex = Math.max(0, this.currPageIndex)
    this.currPageIndex = Math.min(
      draftProspects.length / DraftScreen.PAGE_SIZE - 1,
      this.currPageIndex
    )

    if (this.leftButton && this.rightButton) {
      this.leftButton.setVisible(true)
      this.rightButton.setVisible(true)
      if (this.currPageIndex === 0) {
        this.leftButton.setVisible(false)
      }
      const lastPageIndex = draftProspects.length / DraftScreen.PAGE_SIZE - 1
      if (this.currPageIndex === lastPageIndex) {
        this.rightButton.setVisible(false)
      }
    }

    if (this.draftProspectRows.length > 0) {
      this.draftProspectRows.forEach((row) => {
        row.destroy()
      })
      this.draftProspectRows = []
    }

    let yPos = this.titleText.y + this.titleText.displayHeight + 100
    const draftProspectsPage = draftProspects.slice(
      this.currPageIndex * DraftScreen.PAGE_SIZE,
      this.currPageIndex * DraftScreen.PAGE_SIZE + DraftScreen.PAGE_SIZE
    )
    draftProspectsPage.forEach((prospectConfig: PlayerAgentConfig, index: number) => {
      const newProspectRow = new DraftProspectTableRow(this.scene, {
        playerConfig: prospectConfig,
        position: {
          x: RoundConstants.TEAM_MGMT_SIDEBAR_WIDTH + 15,
          y: yPos,
        },
        isHeader: index == 0,
        onClick: () => {
          const numScoutPoints = Save.getData(SaveKeys.SCOUT_POINTS)
          if (numScoutPoints > 0) {
            this.onScout()
            newProspectRow.revealPotential()
          }
        },
      })
      this.draftProspectRows.push(newProspectRow)
      yPos += 35
    })
  }

  onScout() {
    const numScoutPoints = Save.getData(SaveKeys.SCOUT_POINTS)
    Save.setData(SaveKeys.SCOUT_POINTS, numScoutPoints - 1)
    this.scoutPointsText.setText(`Scout Points: ${numScoutPoints - 1}`)
  }

  onRender(data?: any): void {
    this.updateDraftPage(0)
  }

  setVisible(isVisible: boolean) {
    this.titleText.setVisible(isVisible)
    this.draftProspectRows.forEach((row) => {
      row.setVisible(isVisible)
    })
    this.leftButton.setVisible(isVisible)
    this.rightButton.setVisible(isVisible)
    this.scoutPointsText.setVisible(isVisible)
  }

  generateDraftProspects() {
    const newPlayers: PlayerAgentConfig[] = []
    const playerRanks = [PlayerRank.BRONZE, PlayerRank.SILVER, PlayerRank.GOLD]
    for (let i = 1; i <= DraftScreen.NUM_DRAFT_PROSPECTS; i++) {
      newPlayers.push({
        name: `draft-${i}`,
        isStarting: true,
        texture: '',
        potential: Phaser.Math.Between(0, 2),
        attributes: {
          [PlayerAttributes.ACCURACY]: playerRanks[Phaser.Math.Between(0, playerRanks.length - 1)],
          [PlayerAttributes.HEADSHOT]: playerRanks[Phaser.Math.Between(0, playerRanks.length - 1)],
          [PlayerAttributes.REACTION]: playerRanks[Phaser.Math.Between(0, playerRanks.length - 1)],
        },
        experience: {
          [PlayerAttributes.ACCURACY]: 0,
          [PlayerAttributes.HEADSHOT]: 0,
          [PlayerAttributes.REACTION]: 0,
        },
      })
    }
    return newPlayers
  }
}
